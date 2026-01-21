'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
                        Privacy Policy
                    </h1>
                    <p className="text-stone-500 mb-12">Last updated: January 20, 2026</p>

                    <div className="prose prose-stone max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">1. Information We Collect</h2>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Sky Sign is designed with privacy in mind. We collect minimal information necessary to provide our service:
                            </p>
                            <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                                <li><strong>Account Information:</strong> Email address and name when you create an account</li>
                                <li><strong>Signature Data:</strong> Digital signatures you create are processed locally on your device</li>
                                <li><strong>Usage Data:</strong> Anonymous analytics to improve our service</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                                <li>Provide and maintain our service</li>
                                <li>Send you important updates about your account</li>
                                <li>Improve and optimize our application</li>
                                <li>Respond to your support requests</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">3. Data Security</h2>
                            <p className="text-stone-600 leading-relaxed">
                                Your signature data is processed entirely on your device using local computer vision.
                                We never transmit your biometric hand-tracking data to our servers. When you save signatures,
                                they are encrypted using industry-standard AES-256 encryption before storage.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">4. Third-Party Services</h2>
                            <p className="text-stone-600 leading-relaxed">
                                We use trusted third-party services for authentication and payments. These services have
                                their own privacy policies and we encourage you to review them.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">5. Your Rights</h2>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                                <li>Access your personal data</li>
                                <li>Request deletion of your account and data</li>
                                <li>Export your signatures</li>
                                <li>Opt out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-stone-900 mb-4">6. Contact Us</h2>
                            <p className="text-stone-600 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us through our{' '}
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
                            <Link href="/privacy" className="text-stone-900 font-medium">Privacy</Link>
                            <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
                            <Link href="/support" className="hover:text-stone-900 transition-colors">Support</Link>
                        </div>
                        <p className="text-sm text-stone-400">© 2026 Sky Sign</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
