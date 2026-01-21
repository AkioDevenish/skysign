'use client';

import Link from 'next/link';

export default function TermsPage() {
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
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-stone-500 mb-12">Last updated: January 20, 2026</p>

                    <div className="prose prose-stone max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-stone-600 leading-relaxed">
                                By accessing or using Sky Sign, you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our service.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">2. Description of Service</h2>
                            <p className="text-stone-600 leading-relaxed">
                                Sky Sign is a digital signature application that uses augmented reality and computer vision
                                to capture signatures drawn in the air. The service allows users to create, save, and
                                export digital signatures for personal and professional use.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">3. User Accounts</h2>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                To access certain features, you must create an account. You agree to:
                            </p>
                            <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                                <li>Provide accurate and complete information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized access</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">4. Subscription and Payments</h2>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Sky Sign offers free and paid subscription plans. For paid plans:
                            </p>
                            <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                                <li>Payments are processed securely through our payment provider</li>
                                <li>Subscriptions renew automatically unless cancelled</li>
                                <li>You may cancel at any time from your account settings</li>
                                <li>Refunds are provided in accordance with our refund policy</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">5. Acceptable Use</h2>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                You agree not to use Sky Sign to:
                            </p>
                            <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                                <li>Create fraudulent or forged signatures</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on the rights of others</li>
                                <li>Attempt to reverse engineer or exploit the service</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">6. Intellectual Property</h2>
                            <p className="text-stone-600 leading-relaxed">
                                Sky Sign and its original content, features, and functionality are owned by us and are
                                protected by international copyright, trademark, and other intellectual property laws.
                                Signatures you create remain your property.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">7. Limitation of Liability</h2>
                            <p className="text-stone-600 leading-relaxed">
                                Sky Sign is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for
                                any indirect, incidental, special, consequential, or punitive damages resulting from your
                                use of the service.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">8. Changes to Terms</h2>
                            <p className="text-stone-600 leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify users of significant
                                changes via email or through the application. Continued use after changes constitutes
                                acceptance of the new terms.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">9. Contact</h2>
                            <p className="text-stone-600 leading-relaxed">
                                For questions about these Terms of Service, please visit our{' '}
                                <Link href="/support" className="text-stone-900 underline hover:no-underline">
                                    support page
                                </Link>.
                            </p>
                        </section>
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
                            <Link href="/terms" className="text-stone-900 font-medium">Terms</Link>
                            <Link href="/support" className="hover:text-stone-900 transition-colors">Support</Link>
                        </div>
                        <p className="text-sm text-stone-400">© 2026 Sky Sign</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
