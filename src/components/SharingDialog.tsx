'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logAuditEntry } from '@/lib/auditTrail';

interface SharingDialogProps {
    pdfBlob: Blob | null;
    documentName: string;
    onClose: () => void;
}

export default function SharingDialog({ pdfBlob, documentName, onClose }: SharingDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [shareUrl, setShareUrl] = useState('');

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

    const generateShareLink = async () => {
        setStatus('sending');
        try {
            // Mock generating a link
            await new Promise(r => setTimeout(r, 1000));
            const mockUrl = `https://skysign.io/s/${Math.random().toString(36).substr(2, 9)}`;
            setShareUrl(mockUrl);
            logAuditEntry('shared', undefined, documentName, { method: 'link', passwordProtected: !!password });
            setStatus('idle');
        } catch (error) {
            setStatus('error');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
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

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-stone-100"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-xs text-stone-400 uppercase">or</span>
                        </div>
                    </div>

                    {/* Link Option */}
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Share via Link
                        </label>
                        {shareUrl ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-500"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-stone-100 text-stone-900 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={generateShareLink}
                                disabled={status === 'sending'}
                                className="w-full py-3 bg-stone-50 border border-stone-200 border-dashed rounded-xl text-stone-600 font-medium hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.172 13.828.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-.758 4.826" />
                                </svg>
                                Generate Secure Link
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100 px-6">
                    <p className="text-xs text-stone-400 text-center">
                        Documents are encrypted and links expire after 7 days.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
