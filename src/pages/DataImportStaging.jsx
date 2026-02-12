import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Upload, Check, AlertTriangle, X, Server, ArrowRight } from 'lucide-react';

export default function DataImportStaging() {
    const { addRetailer } = useData();
    const [jsonInput, setJsonInput] = useState('');
    const [stagedData, setStagedData] = useState([]);
    const [error, setError] = useState('');
    const [importLog, setImportLog] = useState([]);

    const handleParse = () => {
        setError('');
        try {
            const parsed = JSON.parse(jsonInput);
            const arrayData = Array.isArray(parsed) ? parsed : [parsed];

            // Basic validation
            const validData = arrayData.map((item, idx) => ({
                id: `staged-${Date.now()}-${idx}`,
                original: item,
                status: 'pending', // pending, imported, error
                validation: validateItem(item)
            }));

            setStagedData(validData);
            setImportLog([]);
        } catch {
            setError('Invalid JSON format. Please check your syntax.');
        }
    };

    const validateItem = (item) => {
        const issues = [];
        if (!item.name) issues.push('Missing Name');
        if (!item.location) issues.push('Missing Location');
        return issues;
    };

    const handleImportAll = () => {
        if (!window.confirm(`Are you sure you want to import ${stagedData.filter(i => i.status === 'pending').length} items?`)) return;

        const newStaged = [...stagedData];
        let successCount = 0;

        newStaged.forEach(item => {
            if (item.status === 'pending' && item.validation.length === 0) {
                try {
                    addRetailer(item.original);
                    item.status = 'imported';
                    successCount++;
                } catch (e) {
                    item.status = 'error';
                    item.error = e.message;
                }
            }
        });

        setStagedData(newStaged);
        setImportLog(prev => [...prev, `Batch import: ${successCount} successful.`]);
    };

    const handleImportSingle = (index) => {
        const newStaged = [...stagedData];
        const item = newStaged[index];

        try {
            addRetailer(item.original);
            item.status = 'imported';
            setImportLog(prev => [...prev, `Imported ${item.original.name}`]);
        } catch (e) {
            item.status = 'error';
            item.error = e.message;
        }

        setStagedData(newStaged);
    };

    const handleRemove = (index) => {
        const newStaged = [...stagedData];
        newStaged.splice(index, 1);
        setStagedData(newStaged);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Server className="text-cdh-red" />
                    Data Import Governance
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Staging area for bulk data ingestion. All records must be manually approved.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Area */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Paste Retailer JSON
                        </label>
                        <textarea
                            className="w-full h-64 font-mono text-xs p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-cdh-red outline-none resize-none"
                            placeholder='[{"name": "Store A", "location": "City, ST", ...}]'
                            value={jsonInput}
                            onChange={e => setJsonInput(e.target.value)}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                <AlertTriangle size={12} /> {error}
                            </p>
                        )}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleParse}
                                disabled={!jsonInput.trim()}
                                className="flex-1 bg-gray-900 dark:bg-gray-700 text-white py-2 rounded-lg font-medium hover:bg-black disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                            >
                                <ArrowRight size={16} /> Parse & Review
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-2">Governance Rules</h3>
                        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc pl-4">
                            <li>No automatic ingestion allowed.</li>
                            <li>Each record must have a Name and Location.</li>
                            <li>Duplicates will be flagged by internal logic (if implemented).</li>
                            <li>Use "Approve All" only after visual verification.</li>
                        </ul>
                    </div>
                </div>

                {/* Staging Table */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Upload size={18} className="text-gray-400" />
                            Staging Area ({stagedData.length})
                        </h2>
                        {stagedData.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStagedData([])}
                                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleImportAll}
                                    disabled={stagedData.length === 0 || stagedData.every(i => i.status !== 'pending')}
                                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-700 shadow-sm transition-colors flex items-center gap-1"
                                >
                                    <Check size={14} /> Import Valid
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[400px]">
                        {stagedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Server size={48} className="mb-4 opacity-20" />
                                <p>No data staged. Paste JSON to begin.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {stagedData.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3">
                                                {item.status === 'imported' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                        <Check size={10} /> Imported
                                                    </span>
                                                ) : item.validation.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                                        <X size={10} /> Invalid
                                                    </span>
                                                ) : item.status === 'error' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                                        Error
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {item.original.name || <span className="text-red-500 italic">Missing</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {item.original.location || <span className="text-red-500 italic">Missing</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                                                {JSON.stringify(item.original)}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                {item.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRemove(idx)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Reject/Remove"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                        {item.validation.length === 0 && (
                                                            <button
                                                                onClick={() => handleImportSingle(idx)}
                                                                className="text-green-500 hover:text-green-700 transition-colors"
                                                                title="Approve Import"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {importLog.length > 0 && (
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 text-xs font-mono text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto">
                            {importLog.map((log, i) => (
                                <div key={i}>&gt; {log}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
