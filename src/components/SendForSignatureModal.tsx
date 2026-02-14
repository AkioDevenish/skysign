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
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [signingLink, setSigningLink] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const createRequest = useMutation(api.signatureRequests.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createRequest({
                recipientEmail,
                recipientName: recipientName || undefined,
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
        setRecipientEmail('');
        setRecipientName('');
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
                        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-6 py-4 text-white">
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
                                        <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-stone-900">{documentName}</p>
                                            <p className="text-xs text-stone-500">Document to be signed</p>
                                        </div>
                                    </div>

                                    {/* Recipient Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Recipient Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                                        />
                                    </div>

                                    {/* Recipient Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Recipient Name
                                        </label>
                                        <input
                                            type="text"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder="John Doe (optional)"
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Please sign this document... (optional)"
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/20 resize-none"
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
                                        disabled={isSubmitting || !recipientEmail}
                                        className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                                Send Request
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-stone-900 mb-2">Request Created!</h3>
                                    <p className="text-stone-600 text-sm mb-4">
                                        Share this link with {recipientName || recipientEmail}
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
                                                className="px-3 py-1.5 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800 transition-colors"
                                            >
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-stone-500 mb-4">
                                        Link expires in 30 days
                                    </p>

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
