'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '180+', label: 'Countries' },
    { value: '256-bit', label: 'Encryption' },
];

const trustBadges = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        label: 'ESIGN Compliant',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        label: 'AES-256 Encryption',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        label: 'GDPR Ready',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        label: 'Audit Trail',
    },
];

export default function TrustSection() {
    return (
        <section className="py-24 px-8 lg:px-12 relative z-10 bg-stone-900 text-white overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="max-w-6xl mx-auto relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 block">
                        Trusted Worldwide
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Enterprise-Grade Security
                    </h2>
                    <p className="text-stone-400 max-w-xl mx-auto">
                        Your signatures are protected with the same encryption used by major financial institutions.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-sm text-stone-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-6"
                >
                    {trustBadges.map((badge, index) => (
                        <div
                            key={badge.label}
                            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10"
                        >
                            <span className="text-blue-400">{badge.icon}</span>
                            <span className="text-sm font-medium text-stone-300">{badge.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Featured Image */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-20 relative"
                >
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10">
                        {/* Unsplash Image - Professional signing */}
                        <Image
                            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80"
                            alt="Professional document signing"
                            fill
                            className="object-cover opacity-60"
                            unoptimized
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent" />

                        {/* Floating content */}
                        <div className="absolute bottom-8 left-8 right-8">
                            <p className="text-xl md:text-2xl font-medium text-white mb-2">
                                &ldquo;Sky Sign transformed how we handle document signing at our firm.&rdquo;
                            </p>
                            <p className="text-stone-400">
                                — Legal Professional, Fortune 500 Company
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
