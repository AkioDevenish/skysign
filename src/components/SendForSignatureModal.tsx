'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Id } from '../../convex/_generated/dataModel';

interface SendForSignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentStorageId: Id<"_storage">;
    documentName: string;
}

export default function SendForSignatureModal({
    isOpen,
    onClose,
    documentStorageId,
    documentName,
}: SendForSignatureModalProps) {
    const [signers, setSigners] = useState([{ email: '', name: '' }]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [signingLink, setSigningLink] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const createRequest = useMutation(api.signatureRequests.create);

    const addSigner = () => {
        setSigners([...signers, { email: '', name: '' }]);
    };

    const removeSigner = (index: number) => {
        const newSigners = [...signers];
        newSigners.splice(index, 1);
        setSigners(newSigners);
    };

    const updateSigner = (index: number, field: 'email' | 'name', value: string) => {
        const newSigners = [...signers];
        newSigners[index][field] = value;
        setSigners(newSigners);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (signers.some(s => !s.email)) {
             setError("All signers must have an email address");
             return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createRequest({
                signers,
                documentStorageId,
                documentName,
                message: message || undefined,
            });

            const link = `${window.location.origin}/sign/${result.accessToken}`;
            setSigningLink(link);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(signingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setSigners([{ email: '', name: '' }]);
        setMessage('');
        setSuccess(false);
        setSigningLink('');
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 text-white sticky top-0 z-10 shrink-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    {success ? (
                                        <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Request Sent!</>
                                    ) : (
                                        <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Send for Signature</>
                                    )}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {!success ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Document Info */}
                                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                                        <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-stone-900 truncate">{documentName}</p>
                                            <p className="text-xs text-stone-500">Document to be signed</p>
                                        </div>
                                    </div>

                                    {/* Signers List */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-stone-700">Signers</label>
                                            <button 
                                                type="button" 
                                                onClick={addSigner}
                                                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg"
                                            >
                                                + Add Signer
                                            </button>
                                        </div>
                                        
                                        {signers.map((signer, index) => (
                                            <div key={index} className="space-y-2 p-3 border border-stone-200 rounded-xl relative group">
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSigner(index)}
                                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        title="Remove signer"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-xs flex items-center justify-center font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                                                        {index === 0 ? 'First Signer' : `Then Signer ${index + 1}`}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="email"
                                                        required
                                                        value={signer.email}
                                                        onChange={(e) => updateSigner(index, 'email', e.target.value)}
                                                        placeholder="Email address *"
                                                        className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-stone-400 transition-all"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={signer.name}
                                                        onChange={(e) => updateSigner(index, 'name', e.target.value)}
                                                        placeholder="Name (Optional)"
                                                        className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-stone-400 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Please sign this document..."
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm transition-all"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Send Request ({signers.length})
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-stone-900 mb-2">Request Created!</h3>
                                    <p className="text-stone-600 text-sm mb-4">
                                        The first signer ({signers[0].name || signers[0].email}) has been notified.
                                    </p>

                                    {/* Signing Link */}
                                    <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={signingLink}
                                                className="flex-1 bg-transparent text-sm text-stone-700 outline-none truncate"
                                            />
                                            <button
                                                onClick={copyLink}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                                            >
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-stone-400 mt-1 text-left">
                                            This link is for the <strong>first signer only</strong>.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="w-full py-3 border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
