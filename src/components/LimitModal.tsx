'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: string;
}

export default function LimitModal({ isOpen, onClose, plan }: LimitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
                {/* Decorative background blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Limit Reached</h3>
                    <p className="text-stone-500 mb-8 leading-relaxed">
                        You&apos;ve reached the limit of <strong>5 free signatures</strong>. Upgrade to Pro for unlimited signatures and advanced export features.
                    </p>

                    <div className="w-full space-y-3">
                        <Link
                            href="/#pricing"
                            className="block w-full py-3.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10 hover:shadow-xl hover:shadow-stone-900/20 active:scale-[0.98]"
                        >
                            Upgrade to Pro
                        </Link>
                        <button
                            onClick={onClose}
                            className="block w-full py-3.5 text-stone-500 font-medium hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
