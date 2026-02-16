'use client';

import { motion } from 'framer-motion';
import FadeContent from "@/components/reactbits/FadeContent";

export default function WorkflowSection() {
    return (
        <section className="py-24 px-8 lg:px-12 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <FadeContent>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-semibold text-stone-500 mb-6 uppercase tracking-wider border border-stone-200">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            No App Download Required
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6">
                            From PDF to signed in seconds
                        </h2>
                        <p className="text-stone-500 max-w-xl mx-auto text-lg leading-relaxed">
                            Forget printing, scanning, or downloading bulky apps. SkySign works instantly in your browser.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 -z-10 transform translate-y-4"></div>

                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="w-24 h-24 bg-white rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/50 flex items-center justify-center mx-auto mb-8 group-hover:scale-105 group-hover:border-stone-900/20 transition-all duration-300">
                                <span className="text-4xl">📄</span>
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">1</div>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 text-center mb-3">Upload PDF</h3>
                            <p className="text-stone-500 text-center text-sm leading-relaxed px-4">
                                Drag and drop any PDF or image. We support all standard document formats securely.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="w-24 h-24 bg-white rounded-2xl border border-emerald-200 shadow-xl shadow-emerald-100/50 flex items-center justify-center mx-auto mb-8 group-hover:scale-105 group-hover:border-emerald-500/30 transition-all duration-300">
                                <span className="text-4xl">✍️</span>
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">2</div>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 text-center mb-3">Air Sign</h3>
                            <p className="text-stone-500 text-center text-sm leading-relaxed px-4">
                                Use your camera to draw your signature in the air. Magic, secure, and touch-free.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="w-24 h-24 bg-white rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/50 flex items-center justify-center mx-auto mb-8 group-hover:scale-105 group-hover:border-stone-900/20 transition-all duration-300">
                                <span className="text-4xl">🔒</span>
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white">3</div>
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 text-center mb-3">Secure Export</h3>
                            <p className="text-stone-500 text-center text-sm leading-relaxed px-4">
                                Download your legally binding, AES-256 encrypted document instantly.
                            </p>
                        </div>
                    </div>

                    {/* Trust Strip */}
                    <div className="mt-20 pt-10 border-t border-stone-100 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-semibold text-stone-900 text-sm">ESIGN Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <span className="font-semibold text-stone-900 text-sm">AES-256 Encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            <span className="font-semibold text-stone-900 text-sm">Valid Legal Evidence</span>
                        </div>
                    </div>
                </FadeContent>
            </div>
        </section>
    );
}
