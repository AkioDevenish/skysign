'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RefundPage() {
    const lastUpdated = 'January 24, 2026';

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
                        <h1 className="text-4xl font-bold text-stone-900 mb-4">Refund Policy</h1>
                        <p className="text-stone-500">Last updated: {lastUpdated}</p>
                    </div>

                    <div className="prose prose-stone max-w-none">
                        <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-8">
                            <p className="text-lg text-stone-600 leading-relaxed">
                                At Sky Sign, we want you to be completely satisfied with your subscription. This Refund Policy outlines our commitment to fair and transparent refund practices for all our subscription plans.
                            </p>
                        </div>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">1. Money-Back Guarantee</h2>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-emerald-900 mb-2">14-Day Money-Back Guarantee</h3>
                                        <p className="text-emerald-700">
                                            If you&apos;re not satisfied with Sky Sign within the first 14 days of your initial subscription, we&apos;ll provide a full refund—no questions asked.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-stone-600 mb-4">
                                This guarantee applies to:
                            </p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Pro Plan:</strong> First-time subscribers only</li>
                                <li><strong>Pro Plus Plan:</strong> First-time subscribers only</li>
                                <li><strong>Team Plans:</strong> First-time team subscriptions</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">2. Eligibility for Refunds</h2>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">2.1 Full Refund Eligible</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-6">
                                <li>Request made within 14 days of initial subscription purchase</li>
                                <li>First-time subscription to a paid plan</li>
                                <li>Account in good standing (no violation of Terms of Service)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">2.2 Partial Refund Eligible</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2 mb-6">
                                <li>Annual subscriptions cancelled after 14 days but within 30 days (pro-rated)</li>
                                <li>Service outages exceeding 24 hours (credited to account)</li>
                                <li>Duplicate charges or billing errors</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-stone-800 mb-3">2.3 Not Eligible for Refunds</h3>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Monthly subscriptions after 14 days from purchase</li>
                                <li>Annual subscriptions after 30 days from purchase</li>
                                <li>Accounts terminated for Terms of Service violations</li>
                                <li>Requests for refunds on already-used signature credits or API calls</li>
                                <li>Accounts with charge-back history</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">3. Subscription Cancellation</h2>
                            <p className="text-stone-600 mb-4">
                                You can cancel your subscription at any time. Here&apos;s what happens when you cancel:
                            </p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Monthly Plans:</strong> Access continues until the end of your current billing period. No refund for partial months.</li>
                                <li><strong>Annual Plans:</strong> Access continues until the end of your annual billing period. Refunds available within the first 30 days (pro-rated after 14 days).</li>
                                <li><strong>Team Plans:</strong> All team member access ends when the subscription expires. Team data is retained for 30 days.</li>
                            </ul>
                            <p className="text-stone-600 mt-4">
                                Your signatures and documents remain accessible during the remaining subscription period. After expiration, you&apos;ll be downgraded to the Free plan with limited features.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">4. How to Request a Refund</h2>
                            <p className="text-stone-600 mb-4">
                                To request a refund, please follow these steps:
                            </p>
                            <ol className="list-decimal pl-6 text-stone-600 space-y-3">
                                <li>
                                    <strong>Email Us:</strong> Send a refund request to{' '}
                                    <a href="mailto:hello@skysign.io" className="text-stone-900 underline">hello@skysign.io</a>
                                </li>
                                <li>
                                    <strong>Include Your Details:</strong> Provide your account email, subscription type, and reason for refund
                                </li>
                                <li>
                                    <strong>Wait for Confirmation:</strong> We&apos;ll review your request within 2 business days
                                </li>
                                <li>
                                    <strong>Receive Your Refund:</strong> Approved refunds are processed within 5-10 business days
                                </li>
                            </ol>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">5. Refund Processing</h2>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li><strong>Processing Time:</strong> Refunds are typically processed within 5-10 business days</li>
                                <li><strong>Payment Method:</strong> Refunds are issued to the original payment method</li>
                                <li><strong>Currency:</strong> Refunds are issued in the original currency of purchase</li>
                                <li><strong>Bank Processing:</strong> Additional time may be required for your bank to process the refund</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">6. Disputes and Chargebacks</h2>
                            <p className="text-stone-600 mb-4">
                                Before initiating a chargeback with your bank or credit card company, please contact us first:
                            </p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>We&apos;re committed to resolving any billing issues promptly</li>
                                <li>Chargebacks for legitimate purchases may result in account suspension</li>
                                <li>We will work with you to resolve any concerns directly</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">7. Plan Downgrades</h2>
                            <p className="text-stone-600 mb-4">
                                If you downgrade your plan instead of cancelling:
                            </p>
                            <ul className="list-disc pl-6 text-stone-600 space-y-2">
                                <li>Changes take effect at the start of your next billing cycle</li>
                                <li>No refunds are provided for the remaining time on the higher-tier plan</li>
                                <li>You retain access to premium features until the downgrade takes effect</li>
                                <li>Signatures and documents created with premium features remain accessible</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">8. Changes to This Policy</h2>
                            <p className="text-stone-600">
                                We may update this Refund Policy from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of our services after changes constitutes acceptance of the revised policy.
                            </p>
                        </section>

                        <section className="bg-stone-50 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-4">Contact Us</h2>
                            <p className="text-stone-600 mb-4">For refund requests or billing questions:</p>
                            <ul className="text-stone-600 space-y-2">
                                <li><strong>Email:</strong> <a href="mailto:hello@skysign.io" className="text-stone-900 underline">hello@skysign.io</a></li>
                                <li><strong>Response Time:</strong> Within 2 business days</li>
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
                        <Link href="/terms" className="hover:text-stone-900">Terms of Service</Link>
                        <Link href="/support" className="hover:text-stone-900">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
