'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SupportPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('loading');

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-stone-50/90 backdrop-blur-md z-50 border-b border-stone-200/60">
                <div className="max-w-6xl mx-auto px-8 lg:px-12 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-stone-50"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-stone-900">Sky Sign</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="pt-32 pb-20 px-8 lg:px-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4">
                        Contact Us
                    </h1>
                    <p className="text-stone-500 text-lg mb-12">
                        Have a question or need help? Send us a message and we&apos;ll get back to you within 24 hours.
                    </p>

                    <div className="bg-white rounded-3xl p-8 lg:p-10 border border-stone-200/60">
                        {formStatus === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-stone-900 mb-2">Message Sent!</h3>
                                <p className="text-stone-500 mb-6">We&apos;ll get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setFormStatus('idle')}
                                    className="text-stone-900 underline hover:no-underline"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                                        placeholder="What's this about?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all resize-none"
                                        placeholder="Tell us how we can help..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={formStatus === 'loading'}
                                    className="w-full px-8 py-4 bg-stone-900 text-stone-50 rounded-full font-medium hover:bg-stone-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Additional Contact Info */}
                    <div className="mt-12 text-center">
                        <p className="text-stone-500">
                            You can also reach us at{' '}
                            <a href="mailto:support@skysign.app" className="text-stone-900 underline hover:no-underline">
                                support@skysign.app
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-8 lg:px-12 border-t border-stone-200/60 bg-stone-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <span className="text-sm font-medium text-stone-700">Sky Sign</span>
                        <div className="flex items-center gap-8 text-sm text-stone-500">
                            <Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
                            <Link href="/refund" className="hover:text-stone-900 transition-colors">Refund</Link>
                            <Link href="/support" className="text-stone-900 font-medium">Support</Link>
                        </div>
                        <p className="text-sm text-stone-400">© 2026 skysign. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
