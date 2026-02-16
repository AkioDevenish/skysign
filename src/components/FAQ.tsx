'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        question: "How does the AR signature work?",
        answer: "Sky Sign uses your device's camera and computer vision to track your finger movements in 3D space. Simply point your finger and draw in the air - our algorithms convert your gestures into a smooth, high-resolution digital signature."
    },
    {
        question: "Is my signature secure?",
        answer: "Yes. Your signatures are processed locally on your device for maximum privacy. When you save them, they are encrypted using industry-standard AES-256 encryption. We never store your biometric data on our servers."
    },
    {
        question: "Can I export to PDF?",
        answer: "Absolutely. You can export your signatures as transparent PNGs, SVGs for infinite scalability, or directly place them onto PDF documents within the app."
    },
    {
        question: "Do I need a special camera?",
        answer: "No special hardware is required. Sky Sign works with any standard webcam or smartphone camera. Our AI model is optimized to work even in low-light conditions."
    },
    {
        question: "Is there a limit to how many signatures I can save?",
        answer: "The Free plan includes 5 signatures per month. The Pro plan offers unlimited signatures and cloud backup for all your creations."
    }
];

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

const FAQItem = ({ question, answer, isOpen, onClick, index }: FAQItemProps) => {
    return (
        <div className="border-b border-stone-200 last:border-0">
            <button
                className="w-full py-7 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                onClick={onClick}
            >
                <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-stone-400 tabular-nums">0{index + 1}</span>
                    <span className={`text-lg font-medium transition-colors ${isOpen ? "text-stone-900" : "text-stone-600 group-hover:text-stone-900"}`}>
                        {question}
                    </span>
                </div>
                <span className={`ml-6 flex-shrink-0 w-8 h-8 rounded-full border ${isOpen ? "bg-stone-900 border-stone-900" : "border-stone-300 group-hover:border-stone-400"} flex items-center justify-center transition-all`}>
                    <svg
                        className={`w-4 h-4 transition-all duration-300 ${isOpen ? "text-stone-50 rotate-180" : "text-stone-500"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-7 pl-12 text-stone-500 leading-relaxed max-w-2xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-32 px-8 lg:px-12 relative z-10 bg-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
                    <div>
                        <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 block">FAQ</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
                            Common questions
                        </h2>
                    </div>
                    <p className="text-stone-500 max-w-sm text-lg">
                        Everything you need to know about Sky Sign.
                    </p>
                </div>

                <div className="bg-stone-50 rounded-3xl p-8 lg:p-10 border border-stone-200/60">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
