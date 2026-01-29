'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TermsPage() {
    const lastUpdated = 'January 23, 2026';
    const effectiveDate = 'January 23, 2026';

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
                        <h1 className="text-4xl font-bold text-stone-900 mb-4">Terms of Service</h1>
                        <p className="text-stone-500">Last updated: {lastUpdated} | Effective: {effectiveDate}</p>
                    </div>

                    <div className="prose prose-stone max-w-none">
                        <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
                            <p className="text-lg text-stone-600 leading-relaxed">
                                Welcome to Sky Sign. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Sky Sign electronic signature platform, including our website, applications, and related services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
                            </p>
                        </div>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-stone-600 mb-4">
                                By creating an account or using Sky Sign, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Service.
                            </p>
                            <p className="text-stone-600">
                                If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">2. Description of Service</h2>
                            <p className="text-stone-600 mb-4">Sky Sign provides an electronic signature platform that enables users to:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Create digital signatures through drawing, typing, or uploading</li>
                                <li>Use hand-tracking technology for air-drawn signatures</li>
                                <li>Upload and sign PDF documents</li>
                                <li>Add date, initials, and text fields to documents</li>
                                <li>Share signed documents via email or secure links</li>
                                <li>Track signature requests and maintain audit trails</li>
                                <li>Store and manage multiple signatures</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">3. Account Registration and Security</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">3.1 Account Creation</h3>
                            <p className="text-stone-600 mb-4">
                                To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as needed.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">3.2 Account Security</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-4">
                                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                                <li>You must notify us immediately of any unauthorized access or security breach</li>
                                <li>You are liable for all activities that occur under your account</li>
                                <li>We recommend enabling two-factor authentication for enhanced security</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">3.3 Age Requirement</h3>
                            <p className="text-stone-600">
                                You must be at least 18 years old to use the Service. By using Sky Sign, you represent and warrant that you meet this age requirement.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">4. Subscription Plans and Payment</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">4.1 Free and Paid Plans</h3>
                            <p className="text-stone-600 mb-4">
                                Sky Sign offers both free and paid subscription plans. Free plans include limited features, while paid plans (Pro and Team) provide access to advanced functionality.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">4.2 Billing</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-4">
                                <li>Paid subscriptions are billed in advance on a monthly or annual basis</li>
                                <li>All fees are non-refundable unless otherwise stated</li>
                                <li>We may change pricing with 30 days&apos; notice</li>
                                <li>Failure to pay may result in suspension or termination of your account</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">4.3 Cancellation</h3>
                            <p className="text-stone-600">
                                You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period. You will retain access to paid features until then.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">5. Electronic Signature Legal Framework</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">5.1 Legal Validity</h3>
                            <p className="text-stone-600 mb-4">
                                Electronic signatures created through Sky Sign are intended to be legally binding under applicable laws, including:
                            </p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-4">
                                <li><strong>ESIGN Act:</strong> U.S. Electronic Signatures in Global and National Commerce Act</li>
                                <li><strong>UETA:</strong> Uniform Electronic Transactions Act (adopted by most U.S. states)</li>
                                <li><strong>eIDAS:</strong> EU Regulation on electronic identification and trust services</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">5.2 User Responsibility</h3>
                            <p className="text-stone-600 mb-4">
                                While Sky Sign facilitates electronic signatures, you are responsible for:
                            </p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Ensuring electronic signatures are appropriate for your specific use case</li>
                                <li>Complying with industry-specific regulations (e.g., healthcare, finance)</li>
                                <li>Obtaining necessary consents from all signing parties</li>
                                <li>Verifying the identity of signers when required</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">5.3 Limitations</h3>
                            <p className="text-stone-600">
                                Electronic signatures may not be valid for certain documents such as wills, trusts, family law matters, court orders, or other documents requiring notarization or wet signatures under applicable law.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">6. Acceptable Use Policy</h2>
                            <p className="text-stone-600 mb-4">You agree not to use the Service to:</p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights of others</li>
                                <li>Upload malicious code, viruses, or harmful content</li>
                                <li>Forge signatures or impersonate others</li>
                                <li>Transmit fraudulent, defamatory, or misleading content</li>
                                <li>Interfere with or disrupt the Service or servers</li>
                                <li>Attempt to gain unauthorized access to systems or accounts</li>
                                <li>Use automated systems or bots without permission</li>
                                <li>Resell or redistribute the Service without authorization</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">7. Intellectual Property</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">7.1 Our Intellectual Property</h3>
                            <p className="text-stone-600 mb-4">
                                The Service, including all software, designs, logos, and content created by Sky Sign, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our intellectual property without permission.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">7.2 Your Content</h3>
                            <p className="text-stone-600 mb-4">
                                You retain ownership of all documents, signatures, and content you create or upload. By using the Service, you grant us a limited license to store, process, and display your content as necessary to provide the Service.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">7.3 Feedback</h3>
                            <p className="text-stone-600">
                                If you provide feedback, suggestions, or ideas about the Service, we may use such feedback without obligation to you.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">8. Privacy and Data Protection</h2>
                            <p className="text-stone-600">
                                Your use of the Service is also governed by our <Link href="/privacy" className="text-stone-900 underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information. By using the Service, you consent to the practices described in our Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">9. Disclaimers and Limitations of Liability</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">9.1 Service Provided &quot;As Is&quot;</h3>
                            <p className="text-stone-600 mb-4">
                                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">9.2 Limitation of Liability</h3>
                            <p className="text-stone-600 mb-4">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SKY SIGN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES ARISING FROM YOUR USE OF THE SERVICE.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">9.3 Maximum Liability</h3>
                            <p className="text-stone-600">
                                Our total liability for any claims arising under these Terms shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">10. Indemnification</h2>
                            <p className="text-stone-600">
                                You agree to indemnify, defend, and hold harmless Sky Sign and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your infringement of any third-party rights.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">11. Termination</h2>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>You may terminate your account at any time through your account settings</li>
                                <li>We may suspend or terminate your account for violation of these Terms</li>
                                <li>We may discontinue the Service with 30 days&apos; notice</li>
                                <li>Upon termination, your right to use the Service ceases immediately</li>
                                <li>We may retain certain data as required by law or for legitimate business purposes</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">12. Dispute Resolution</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">12.1 Governing Law</h3>
                            <p className="text-stone-600 mb-4">
                                These Terms are governed by the laws of Trinidad and Tobago, without regard to conflict of law principles.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">12.2 Arbitration</h3>
                            <p className="text-stone-600 mb-4">
                                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in Trinidad and Tobago, in accordance with applicable arbitration rules.
                            </p>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">12.3 Class Action Waiver</h3>
                            <p className="text-stone-600">
                                You agree to resolve disputes on an individual basis and waive the right to participate in class actions or class-wide arbitration.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">13. Changes to Terms</h2>
                            <p className="text-stone-600">
                                We may modify these Terms at any time. We will notify you of material changes via email or through the Service. Continued use of the Service after changes take effect constitutes acceptance of the modified Terms.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">14. General Provisions</h2>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Sky Sign</li>
                                <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
                                <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver</li>
                                <li><strong>Assignment:</strong> You may not assign these Terms; we may assign them freely</li>
                                <li><strong>Force Majeure:</strong> We are not liable for failures due to circumstances beyond our control</li>
                            </ul>
                        </section>

                        <section className="bg-stone-50 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">Contact Us</h2>
                            <p className="text-stone-600 mb-4">For questions about these Terms:</p>
                            <ul className="text-stone-600 space-y-2">
                                <li><strong>Email:</strong> <a href="mailto:hello@skysign.io" className="text-stone-900 underline">hello@skysign.io</a></li>
                                <li><strong>Address:</strong> Adevstudio (Sky Sign), Trinidad and Tobago</li>
                                <li><strong>Support:</strong> <Link href="/support" className="text-stone-900 underline">Visit our Support Center</Link></li>
                            </ul>
                        </section>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-200 bg-white py-8">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-stone-500">
                    <p>© 2026 Skysign. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-stone-900">Privacy Policy</Link>
                        <Link href="/support" className="hover:text-stone-900">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
