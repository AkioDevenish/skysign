'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
    const lastUpdated = 'January 23, 2026';

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-stone-200/60">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-stone-900">Sky Sign</span>
                    </Link>
                    <Link href="/create" className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-all">
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-stone-900 mb-4">Privacy Policy</h1>
                        <p className="text-stone-500">Last updated: {lastUpdated}</p>
                    </div>

                    <div className="prose prose-stone max-w-none">
                        <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
                            <p className="text-lg text-stone-600 leading-relaxed">
                                At Sky Sign, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our electronic signature platform.
                            </p>
                        </div>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">1. Information We Collect</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">1.1 Personal Information</h3>
                            <p className="text-stone-600 mb-4">When you create an account or use our services, we may collect:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-6">
                                <li><strong>Account Information:</strong> Name, email address, password (encrypted), and profile picture</li>
                                <li><strong>Payment Information:</strong> Credit card details (processed securely via Paddle), billing address, and transaction history</li>
                                <li><strong>Identity Verification:</strong> Phone number, IP address, and device information for security purposes</li>
                                <li><strong>Signature Data:</strong> Digital signatures you create, including drawn, typed, and uploaded signatures</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">1.2 Document Information</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-6">
                                <li>Documents you upload for signing</li>
                                <li>Metadata including timestamps, signer information, and audit trails</li>
                                <li>Document access logs and sharing history</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">1.3 Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>IP address and geolocation data</li>
                                <li>Device identifiers</li>
                                <li>Usage patterns and feature interactions</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-stone-600 mb-4">We use the collected information for:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Service Delivery:</strong> Creating and managing your account, processing signatures, and delivering documents</li>
                                <li><strong>Legal Compliance:</strong> Maintaining audit trails for electronic signature validity under ESIGN Act and UETA</li>
                                <li><strong>Security:</strong> Detecting fraud, preventing unauthorized access, and protecting against malicious activity</li>
                                <li><strong>Communication:</strong> Sending transactional emails, security alerts, and (with consent) marketing communications</li>
                                <li><strong>Improvement:</strong> Analyzing usage patterns to enhance our platform and develop new features</li>
                                <li><strong>Support:</strong> Responding to inquiries and providing customer assistance</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">3. Data Storage and Security</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">3.1 Storage</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-6">
                                <li>Data is stored on secure servers located in the United States</li>
                                <li>Documents are encrypted at rest using AES-256 encryption</li>
                                <li>All data transmissions use TLS 1.3 encryption</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">3.2 Security Measures</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Multi-factor authentication available for all accounts</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>SOC 2 Type II compliance (in progress)</li>
                                <li>24/7 monitoring for suspicious activity</li>
                                <li>Automatic session timeout and account lockout protections</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">4. Data Sharing and Disclosure</h2>
                            <p className="text-stone-600 mb-4">We do not sell your personal information. We may share data with:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform (e.g., Paddle for payments, Clerk for authentication)</li>
                                <li><strong>Document Recipients:</strong> Parties you explicitly share documents with for signing</li>
                                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets (with prior notice)</li>
                                <li><strong>With Your Consent:</strong> Any other sharing you explicitly authorize</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">5. Your Rights and Choices</h2>
                            <p className="text-stone-600 mb-4">Depending on your location, you may have the right to:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                                <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                            </ul>
                            <p className="text-stone-600 mt-4">To exercise these rights, contact us at <a href="mailto:privacy@skysign.io" className="text-stone-900 underline">privacy@skysign.io</a>.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">6. Data Retention</h2>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion request</li>
                                <li><strong>Signed Documents:</strong> Retained for 7 years to comply with legal requirements for electronic records</li>
                                <li><strong>Audit Logs:</strong> Retained for 7 years for compliance and legal purposes</li>
                                <li><strong>Payment Records:</strong> Retained as required by tax and financial regulations</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">7. Cookies and Tracking</h2>
                            <p className="text-stone-600 mb-4">We use cookies and similar technologies for:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                                <li><strong>Analytics Cookies:</strong> Understand how users interact with our platform</li>
                            </ul>
                            <p className="text-stone-600 mt-4">You can manage cookie preferences through your browser settings.</p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">8. International Data Transfers</h2>
                            <p className="text-stone-600">
                                If you access our services from outside the United States, your data may be transferred to and processed in the United States. We implement appropriate safeguards including Standard Contractual Clauses for EU data transfers.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">9. Children's Privacy</h2>
                            <p className="text-stone-600">
                                Sky Sign is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information immediately.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">10. Changes to This Policy</h2>
                            <p className="text-stone-600">
                                We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on our platform. Continued use after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section className="bg-stone-50 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">Contact Us</h2>
                            <p className="text-stone-600 mb-4">For privacy-related questions or concerns:</p>
                            <ul className="text-stone-600 space-y-2">
                                <li><strong>Email:</strong> <a href="mailto:privacy@skysign.io" className="text-stone-900 underline">privacy@skysign.io</a></li>
                                <li><strong>Address:</strong> Sky Sign Inc., 123 Innovation Way, San Francisco, CA 94105</li>
                                <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@skysign.io" className="text-stone-900 underline">dpo@skysign.io</a></li>
                            </ul>
                        </section>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-200 bg-white py-8">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-stone-500">
                    <p>© 2026 Sky Sign. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-stone-900">Terms of Service</Link>
                        <Link href="/refund" className="hover:text-stone-900">Refund Policy</Link>
                        <Link href="/support" className="hover:text-stone-900">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
