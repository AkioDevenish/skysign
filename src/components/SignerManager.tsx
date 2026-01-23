'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}: SignerManagerProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const addSigner = () => {
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
        <div className="bg-stone-50 rounded-2xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-stone-700">Signers</span>
                    {signers.length > 0 && (
                        <span className="text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full">{signers.length}</span>
                    )}
                </div>
                <svg className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                        <div className="px-4 pb-4 space-y-3">
                            {/* Existing signers */}
                            {signers.length > 0 && (
                                <div className="space-y-2">
                                    {signers.map((s, idx) => (
                                        <div
                                            key={s.id}
                                            className="flex items-center gap-2 bg-white rounded-lg p-2 border border-stone-200"
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: s.color }}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-stone-900 truncate">{s.name}</p>
                                                <p className="text-xs text-stone-400 truncate">{s.email}</p>
                                            </div>
                                            <button
                                                onClick={() => removeSigner(s.id)}
                                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
                            <div className="space-y-2 pt-2 border-t border-stone-200">
                                <input
                                    placeholder="Full name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                                />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                                />
                                <button
                                    onClick={addSigner}
                                    disabled={!name.trim() || !email.trim()}
                                    className="w-full py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
