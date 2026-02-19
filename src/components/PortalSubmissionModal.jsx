import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Upload, FileText, AlertTriangle, X, CheckSquare, Square } from 'lucide-react';
import { generateConfirmationPdf } from '../lib/pdfGenerator';

export default function PortalSubmissionModal({ isOpen, onClose, retailer, vendor, distributor, items, onSubmit }) {
    const [step, setStep] = useState(1); // 1: Launch, 2: Checklist, 3: Capture
    const [checklist, setChecklist] = useState({
        loggedIn: false,
        itemsEntered: false,
        confirmationReached: false
    });
    const [poNumber, setPoNumber] = useState('');
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleLaunch = () => {
        if (vendor?.portalUrl) {
            window.open(vendor.portalUrl, '_blank', 'noopener,noreferrer');
            setStep(2);
        } else {
            alert(`No portal URL configured for ${vendor?.name}. Please go to the site manually.`);
            setStep(2);
        }
    };

    const toggleCheck = (key) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEvidenceFile(e.target.files[0]);
        }
    };

    const handleFinalize = async () => {
        if (!poNumber || !evidenceFile) return;

        // SOFT PROMPT: Missing Email
        let orderEmail = retailer.email;
        if (!orderEmail) {
            const manualEmail = prompt(
                `NOTICE: ${retailer.name} has no email on file.\n\nEnter an email for this order to receive the confirmation PDF (optional):`,
                ""
            );
            if (manualEmail) orderEmail = manualEmail;
        }

        setIsGenerating(true);

        try {
            // 1. Generate PDF Confirmation
            const pdfDataUrl = generateConfirmationPdf(
                { items }, // minimal order object
                retailer,
                vendor,
                distributor,
                poNumber,
                [{ name: evidenceFile.name, size: evidenceFile.size }]
            );

            const evidence = {
                poNumber,
                file: evidenceFile,
                submittedAt: new Date().toISOString()
            };

            // 3. Submit
            onSubmit({
                submissionStatus: 'SUBMITTED', // Enforce specific status
                vendorPortalPoNumber: poNumber,
                evidenceFiles: [evidence],
                orderEmail, // Pass captured email
                orderEmailPdf: { name: `Confirmation-${poNumber}.pdf`, dataUrl: pdfDataUrl }
            });

        } catch (err) {
            console.error("PDF Generation failed", err);
            alert("Failed to generate confirmation PDF. See console.");
        } finally {
            setIsGenerating(false);
        }
    };

    const allChecked = checklist.loggedIn && checklist.itemsEntered && checklist.confirmationReached;

    return (
        <div data-testid="portal-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ExternalLink size={24} className="text-cdh-red" />
                            Portal Submission
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Submitting to <strong>{vendor?.name}</strong> via Web Portal
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {/* Progress */}
                    <div className="flex items-center justify-between mb-8 px-4">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-cdh-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                }`}>
                                {s}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-6 text-center py-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-left">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Instructions</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                                    <li>This vendor requires manual entry via their website.</li>
                                    <li>Click below to open the portal in a new tab.</li>
                                    <li>Keep this window open to capture the PO confirmation.</li>
                                </ul>
                            </div>

                            {vendor?.portalInstructions && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded italic">
                                    "{vendor.portalInstructions}"
                                </div>
                            )}

                            <button
                                data-testid="launch-portal-btn"
                                onClick={handleLaunch}
                                className="w-full py-4 bg-cdh-red text-white rounded-lg font-bold text-lg hover:bg-cdh-dark shadow-lg flex items-center justify-center gap-2"
                            >
                                Launch Portal <ExternalLink size={20} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white text-center">Submission Checklist</h3>
                            <div className="space-y-3">
                                <CheckItem
                                    label="I have logged into the portal"
                                    checked={checklist.loggedIn}
                                    onToggle={() => toggleCheck('loggedIn')}
                                />
                                <CheckItem
                                    label="I have entered all items and quantities"
                                    checked={checklist.itemsEntered}
                                    onToggle={() => toggleCheck('itemsEntered')}
                                />
                                <CheckItem
                                    label="I have submitted and see the Confirmation Page"
                                    checked={checklist.confirmationReached}
                                    onToggle={() => toggleCheck('confirmationReached')}
                                />
                            </div>

                            <button
                                disabled={!allChecked}
                                onClick={() => setStep(3)}
                                className="w-full py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Next Step
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Vendor PO Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={poNumber}
                                        onChange={e => setPoNumber(e.target.value)}
                                        placeholder="e.g. JB-998877"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Proof of Submission <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept="image/*,.pdf"
                                        />
                                        {evidenceFile ? (
                                            <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                                                <CheckCircle size={32} className="mb-2" />
                                                <span className="font-medium truncate max-w-[200px]">{evidenceFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Upload size={32} className="mb-2" />
                                                <span className="text-sm">Click to upload screenshot/PDF</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex gap-3 border border-yellow-100 dark:border-yellow-800">
                                    <AlertTriangle className="text-yellow-600 dark:text-yellow-400 shrink-0" size={18} />
                                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                        Submitting will attach this evidence and generate a formal Confirmation PDF for your records.
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={!poNumber || !evidenceFile || isGenerating}
                                onClick={handleFinalize}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? 'Generating PDF...' : 'Finalize & Submit Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CheckItem({ label, checked, onToggle }) {
    return (
        <div
            onClick={onToggle}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
        >
            {checked ? (
                <CheckSquare className="text-green-600 dark:text-green-400 shrink-0" size={20} />
            ) : (
                <Square className="text-gray-400 shrink-0" size={20} />
            )}
            <span className={`text-sm ${checked ? 'text-green-900 dark:text-green-100 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                {label}
            </span>
        </div>
    );
}
