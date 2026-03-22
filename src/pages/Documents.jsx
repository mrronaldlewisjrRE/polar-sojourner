import React, { useState, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import {
    UploadCloud,
    FileText,
    FileSpreadsheet,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Settings2,
    Save,
    X
} from 'lucide-react';
import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import { cn } from '../lib/utils';

export default function Documents() {
    const { addRetailer, addVendor, addProduct, addDistributor } = useData();
    const toast = useToast();

    const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Review
    const [targetType, setTargetType] = useState('retailers'); // retailers, vendors, products, distributors
    const [fileData, setFileData] = useState({ name: '', size: 0, type: '' });

    const [rawHeaders, setRawHeaders] = useState([]);
    const [rawRows, setRawRows] = useState([]);

    // mapping: { appField: spreadsheetHeaderName }
    const [fieldMapping, setFieldMapping] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Schema definitions for mapping
    const schemas = {
        retailers: [
            { id: 'name', label: 'Store Name', required: true, aliases: ['name', 'store', 'customer', 'retailer'] },
            { id: 'location', label: 'Location (City, ST)', required: true, aliases: ['location', 'city state', 'area'] },
            { id: 'address', label: 'Full Address', required: false, aliases: ['address', 'street', 'addr'] },
            { id: 'city', label: 'City', required: false, aliases: ['city', 'town'] },
            { id: 'state', label: 'State', required: false, aliases: ['state', 'st'] },
            { id: 'zip', label: 'ZIP Code', required: false, aliases: ['zip', 'zipcode', 'zip code', 'postal'] },
            { id: 'warehouseCode', label: 'Warehouse Code', required: false, aliases: ['warehouse', 'code', 'whse'] },
            { id: 'contactName', label: 'Contact Name', required: false, aliases: ['contact', 'owner', 'manager'] },
            { id: 'email', label: 'Email Address', required: false, aliases: ['email', 'e-mail'] },
            { id: 'phone', label: 'Phone Number', required: false, aliases: ['phone', 'tel', 'telephone'] }
        ],
        vendors: [
            { id: 'name', label: 'Vendor Name', required: true, aliases: ['name', 'vendor', 'mfr', 'manufacturer'] },
            { id: 'status', label: 'Status', required: false, aliases: ['status', 'state'] }
        ],
        products: [
            { id: 'sku', label: 'SKU / Item #', required: true, aliases: ['sku', 'item', 'item#', 'number', 'part'] },
            { id: 'description', label: 'Description', required: true, aliases: ['desc', 'description', 'name'] },
            { id: 'cost', label: 'Unit Cost', required: true, aliases: ['cost', 'price', 'ea'] },
            { id: 'packQty', label: 'Pack Qty', required: false, aliases: ['pack', 'qty', 'packqty', 'uom'] },
            { id: 'vendorId', label: 'Vendor ID', required: true, aliases: ['vendor', 'vendorid'] }
        ]
    };

    const currentSchema = schemas[targetType] || [];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileData({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type
        });

        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;

            try {
                let headers = [];
                let rows = [];

                if (file.name.endsWith('.csv')) {
                    Papa.parse(bstr, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function (results) {
                            headers = results.meta.fields || [];
                            rows = results.data || [];
                            processParsedData(headers, rows);
                        }
                    });
                } else {
                    // Excel
                    const wb = xlsx.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

                    if (data.length > 0) {
                        headers = data[0].map(h => String(h || '').trim());
                        // Convert array of arrays to array of objects
                        rows = data.slice(1).map(row => {
                            let obj = {};
                            headers.forEach((h, i) => {
                                obj[h] = row[i];
                            });
                            return obj;
                        }).filter(row => Object.values(row).some(v => v !== undefined && v !== ''));
                    }
                    processParsedData(headers, rows);
                }
            } catch (err) {
                console.error("Parse error:", err);
                toast?.addToast('error', 'Failed to parse file. Check format.');
                setIsProcessing(false);
            }
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    };

    const processParsedData = (headers, rows) => {
        setRawHeaders(headers);
        setRawRows(rows);

        // Auto-map feature
        const initialMapping = {};
        currentSchema.forEach(field => {
            const match = headers.find(h =>
                field.aliases.includes(h.toLowerCase().trim()) ||
                h.toLowerCase().includes(field.id.toLowerCase())
            );
            if (match) {
                initialMapping[field.id] = match;
            }
        });

        setFieldMapping(initialMapping);
        setIsProcessing(false);
        setStep(2);
    };

    const handleMapChange = (appFieldId, spreadsheetHeader) => {
        setFieldMapping(prev => ({
            ...prev,
            [appFieldId]: spreadsheetHeader
        }));
    };

    const processReview = () => {
        // Validation check
        const missingRequired = currentSchema.filter(f => f.required && !fieldMapping[f.id]);
        if (missingRequired.length > 0) {
            toast?.addToast('error', `Please map required fields: ${(Array.isArray(missingRequired) ? missingRequired : []).map(f => f.label).join(', ')}`);
            return;
        }
        setStep(3);
    };

    const handleImport = async () => {
        setIsProcessing(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const row of rawRows) {
                const payload = {};
                currentSchema.forEach(field => {
                    const mappedHeader = fieldMapping[field.id];
                    if (mappedHeader && row[mappedHeader] !== undefined) {
                        payload[field.id] = row[mappedHeader];
                    }
                });

                // Skip completely empty payloads
                if (Object.keys(payload).length === 0) continue;

                try {
                    if (targetType === 'retailers') {
                        // Quick formatting
                        if (!payload.location && payload.city) {
                            payload.location = `${payload.city}${payload.state ? `, ${payload.state}` : ''}`;
                        }
                        await addRetailer(payload);
                    } else if (targetType === 'vendors') {
                        payload.status = payload.status || 'Active';
                        await addVendor(payload);
                    } else if (targetType === 'products') {
                        // Needs vendorId specifically
                        if (!payload.vendorId) throw new Error("Missing Vendor ID context");
                        const vendorId = payload.vendorId;
                        delete payload.vendorId;
                        payload.cost = parseFloat(payload.cost) || 0;
                        payload.packQty = parseInt(payload.packQty) || 1;
                        await addProduct(vendorId, payload);
                    }
                    successCount++;
                } catch (e) {
                    console.error("Row import error", e);
                    errorCount++;
                }
            }

            toast?.addToast('success', `Import complete! Added ${successCount} records. ${errorCount > 0 ? `Failed: ${errorCount}` : ''}`);
            // Reset
            setStep(1);
            setRawHeaders([]);
            setRawRows([]);
            setFieldMapping({});
            setFileData({ name: '', size: 0, type: '' });

        } catch (error) {
            console.error(error);
            toast?.addToast('error', 'Fatal error during import.');
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setStep(1);
        setRawHeaders([]);
        setRawRows([]);
        setFieldMapping({});
        setFileData({ name: '', size: 0, type: '' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileSpreadsheet className="text-cdh-red" />
                        Smart Importer
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Intelligent drag-and-drop ingestion for standard flat files.
                    </p>
                </div>

                {step > 1 && (
                    <button
                        onClick={reset}
                        className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Start Over
                    </button>
                )}
            </header>

            {/* Stepper Header */}
            <div className="flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-gray-200 dark:before:bg-gray-700 before:z-0 px-4 mb-8">
                {[
                    { id: 1, label: 'Upload', icon: UploadCloud },
                    { id: 2, label: 'Map Fields', icon: Settings2 },
                    { id: 3, label: 'Review & Import', icon: Save }
                ].map(s => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-900 px-2 py-1">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
                            step === s.id ? "bg-cdh-red border-cdh-red text-white" :
                                step > s.id ? "bg-green-500 border-green-500 text-white" :
                                    "bg-white dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600"
                        )}>
                            {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
                        </div>
                        <span className={cn(
                            "text-xs font-semibold uppercase tracking-wider",
                            step >= s.id ? "text-gray-900 dark:text-white" : "text-gray-400"
                        )}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {/* STEP 1: UPLOAD */}
                {step === 1 && (
                    <div className="p-8 flex-1 flex flex-col items-center justify-center">
                        <div className="w-full max-w-md space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Import Target</label>
                                <select
                                    className="w-full border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-cdh-red"
                                    value={targetType}
                                    onChange={(e) => setTargetType(e.target.value)}
                                >
                                    <option value="retailers">Retailers / Resellers</option>
                                    <option value="vendors">Manufacturers / Vendors</option>
                                    <option value="products">Vendor Item Catalogs</option>
                                </select>
                            </div>

                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <input
                                    type="file"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                                        {isProcessing ? (
                                            <div className="w-8 h-8 rounded-full border-2 border-cdh-red border-t-transparent animate-spin" />
                                        ) : (
                                            <UploadCloud size={32} className="text-gray-500 dark:text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">
                                            {isProcessing ? 'Processing File...' : 'Drag & Drop CSV / Excel'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">or click to browse native files</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: MAP */}
                {step === 2 && (
                    <div className="flex flex-col h-full flex-1">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg dark:text-white">Map Data Fields</h2>
                                <p className="text-xs text-gray-500">File: {fileData.name} ({rawRows.length} rows detected)</p>
                            </div>
                            <button
                                onClick={processReview}
                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {(Array.isArray(currentSchema) ? currentSchema : []).map(field => (
                                <div key={field.id} className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            {field.label}
                                            {field.required && <span className="text-xs font-bold text-cdh-red bg-red-50 dark:bg-red-900/30 px-1.5 rounded">*Required</span>}
                                        </span>
                                    </label>
                                    <select
                                        className={cn(
                                            "w-full border rounded-lg p-2.5 outline-none transition-colors",
                                            fieldMapping[field.id]
                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white"
                                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red"
                                        )}
                                        value={fieldMapping[field.id] || ''}
                                        onChange={(e) => handleMapChange(field.id, e.target.value)}
                                    >
                                        <option value="">-- Ignore / Do Not Import --</option>
                                        {(Array.isArray(rawHeaders) ? rawHeaders : []).map((h, i) => (
                                            <option key={i} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    {fieldMapping[field.id] && rawRows.length > 0 && (
                                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                            <span className="text-green-600 dark:text-green-400 font-medium">Mapped:</span>
                                            Sample: "{rawRows[0][fieldMapping[field.id]] || 'Blank'}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 3 && (
                    <div className="flex flex-col h-full flex-1">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg dark:text-white">Review & Execute</h2>
                                <p className="text-xs text-gray-500">Ready to import {rawRows.length} records into {targetType.toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">Back</button>
                                <button
                                    onClick={handleImport}
                                    disabled={isProcessing}
                                    className="bg-cdh-red text-white px-6 py-2 rounded-md font-medium hover:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save size={16} />}
                                    Execute Import
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto overflow-y-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 sticky top-0 z-10 shadow-sm border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-100 dark:bg-gray-900 uppercase font-bold text-xs sticky left-0 border-r border-gray-200 dark:border-gray-700">#</th>
                                        {currentSchema.filter(f => fieldMapping[f.id]).map(field => (
                                            <th key={field.id} className="px-4 py-3 text-xs font-semibold">{field.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {rawRows.slice(0, 50).map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-2 text-xs text-gray-400 bg-white dark:bg-gray-900 sticky left-0 border-r border-gray-200 dark:border-gray-700">{idx + 1}</td>
                                            {currentSchema.filter(f => fieldMapping[f.id]).map(field => (
                                                <td key={field.id} className="px-4 py-2 text-gray-900 dark:text-gray-300">
                                                    {row[fieldMapping[field.id]] || <span className="text-gray-400 italic">null</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {rawRows.length > 50 && (
                                <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700">
                                    Showing first 50 rows of {rawRows.length} total.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
