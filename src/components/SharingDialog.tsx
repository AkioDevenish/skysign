'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logAuditEntry } from '@/lib/auditTrail';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";


interface SharingDialogProps {
    pdfBlob: Blob | null;
    documentName: string;
    onClose: () => void;
    signatureId?: string | null;
}

export default function SharingDialog({ pdfBlob, documentName, onClose, signatureId }: SharingDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');



    const auditUrl = useQuery(api.signatures.getAuditUrl, 
        signatureId ? { signatureId: signatureId as Id<"signatures"> } : "skip"
    );

    const handleEmailShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !pdfBlob) return;

        setStatus('sending');

        try {
            // Convert blob to base64 for transport
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
            });
            reader.readAsDataURL(pdfBlob);
            const base64Data = await base64Promise;

            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    documentName,
                    password,
                    pdfData: base64Data,
                    type: 'email'
                }),
            });

            if (response.ok) {
                logAuditEntry('shared', undefined, documentName, { recipient: email, method: 'email', passwordProtected: !!password });
                setStatus('success');
                setTimeout(onClose, 2000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Sharing error:', error);
            setStatus('error');
        }
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-stone-900">Share Document</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Security Settings */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <label className="text-sm font-semibold text-stone-900">Security Settings</label>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">Access Password (Optional)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Set a password to protect document"
                                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Option */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Send via Email
                        </label>
                        <form onSubmit={handleEmailShare} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="recipient@example.com"
                                className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900"
                                required
                            />
                            <button
                                type="submit"
                                disabled={status === 'sending' || !pdfBlob}
                                className="px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
                            >
                                {status === 'sending' ? 'Sending...' : 'Send'}
                            </button>
                        </form>
                        {status === 'success' && <p className="mt-2 text-sm text-green-600">Email sent successfully!</p>}
                        {status === 'error' && <p className="mt-2 text-sm text-red-600">Failed to send email.</p>}
                    </div>


                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 px-6 space-y-3">
                    {auditUrl && (
                        <a 
                            href={auditUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-medium hover:bg-emerald-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Download Legal Audit Certificate
                        </a>
                    )}
                    <p className="text-xs text-stone-400 text-center">
                        Documents are encrypted and links expire after 7 days.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
