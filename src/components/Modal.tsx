'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info';
}

export default function Modal({ isOpen, onClose, title, message, type = 'error' }: ModalProps) {
    if (!isOpen) return null;

    const colors = {
        error: {
            bg: 'bg-red-50',
            text: 'text-red-900',
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        success: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-900',
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            button: 'bg-emerald-600 hover:bg-emerald-700'
        },
        info: {
            bg: 'bg-stone-50',
            text: 'text-stone-900',
            iconBg: 'bg-stone-100',
            iconText: 'text-stone-600',
            button: 'bg-stone-900 hover:bg-stone-800'
        }
    };

    const style = colors[type];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-message"
                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
                {/* Decorative blob */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${style.iconBg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10`} />

                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 ${style.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                        {type === 'error' && (
                            <svg className={`w-8 h-8 ${style.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        {type === 'success' && (
                            <svg className={`w-8 h-8 ${style.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {type === 'info' && (
                            <svg className={`w-8 h-8 ${style.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h3 id="modal-title" className={`text-2xl font-bold ${style.text} mb-2`}>{title}</h3>
                    <p id="modal-message" className="text-stone-500 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        autoFocus
                        className="w-full py-3.5 bg-stone-900 text-white font-bold rounded-xl transition-all shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:shadow-xl hover:shadow-stone-900/20 active:scale-[0.98] cursor-pointer"
                    >
                        Okay
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
