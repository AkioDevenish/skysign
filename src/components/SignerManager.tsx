'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface Signer {
    id: string;
    name: string;
    email: string;
    color: string;
    status: 'pending' | 'signed' | 'declined';
    order: number;
}

interface SignerManagerProps {
    signers: Signer[];
    onSignersChange: (signers: Signer[]) => void;
    currentUserId?: string;
}

const signerColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function SignerManager({
    signers,
    onSignersChange,
    currentUserId,
}: SignerManagerProps) {
    const sendInvite = useAction(api.email.sendInvite);
    const [isExpanded, setIsExpanded] = useState(signers.length > 0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const addSigner = async () => {
        if (!name.trim() || !email.trim()) return;

        const newSigner: Signer = {
            id: `signer_${Date.now()}`,
            name: name.trim(),
            email: email.trim(),
            color: signerColors[signers.length % signerColors.length],
            status: 'pending',
            order: signers.length + 1,
        };

        onSignersChange([...signers, newSigner]);

        // Send email invite asynchronously
        try {
            await sendInvite({
                email: newSigner.email,
                documentName: "Untitled Document", // Ideally passed as prop
                inviterName: "Akio", // Ideally passed as prop or from user
            });
        } catch (e) {
            console.error("Failed to send invite", e);
        }

        setName('');
        setEmail('');
    };

    const removeSigner = (id: string) => {
        onSignersChange(signers.filter(s => s.id !== id));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name && email) {
            addSigner();
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-stone-900 block text-left">Signers</span>
                        <span className="text-xs text-stone-500 block text-left">Manage document recipients</span>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-stone-100 rotate-180' : 'hover:bg-stone-100'}`}>
                    <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4">
                            {/* Existing signers */}
                            {signers.length > 0 && (
                                <div className="space-y-2.5">
                                    {signers.map((s, idx) => (
                                        <div
                                            key={s.id}
                                            className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100 group"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                                                style={{ backgroundColor: s.color }}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-stone-900 truncate">{s.name}</p>
                                                <p className="text-xs text-stone-500 truncate">{s.email}</p>
                                            </div>
                                            <button
                                                onClick={() => removeSigner(s.id)}
                                                className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add new signer form */}
                            <div className="space-y-3 pt-3 border-t border-stone-100">
                                <div className="space-y-2">
                                    <input
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={addSigner}
                                    disabled={!name.trim() || !email.trim()}
                                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-sm font-medium hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Signer
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
