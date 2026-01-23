'use client';

import { motion } from 'framer-motion';

const laws = [
    {
        country: '🇺🇸',
        name: 'ESIGN Act',
        region: 'United States',
        description: 'The Electronic Signatures in Global and National Commerce Act gives electronic signatures the same legal validity as handwritten signatures for most transactions.',
        year: '2000',
    },
    {
        country: '🇺🇸',
        name: 'UETA',
        region: 'United States (47 States)',
        description: 'The Uniform Electronic Transactions Act provides a legal framework for the use of electronic records and signatures in commerce.',
        year: '1999',
    },
    {
        country: '🇪🇺',
        name: 'eIDAS',
        region: 'European Union',
        description: 'The Electronic Identification and Trust Services Regulation establishes a legal framework for electronic signatures across all EU member states.',
        year: '2014',
    },
    {
        country: '🇬🇧',
        name: 'Electronic Communications Act',
        region: 'United Kingdom',
        description: 'Recognizes electronic signatures as legally admissible evidence and valid for electronic contracts.',
        year: '2000',
    },
    {
        country: '🇨🇦',
        name: 'PIPEDA & Provincial Laws',
        region: 'Canada',
        description: 'Various federal and provincial laws recognize electronic signatures, including PIPEDA for personal information protection.',
        year: '2000+',
    },
];

const validUses = [
    'Business contracts & agreements',
    'Employment documents',
    'Purchase orders & invoices',
    'Non-disclosure agreements',
    'Sales contracts',
    'Lease agreements',
    'Tax documents (many forms)',
    'Government forms (varies)',
];

const invalidUses = [
    'Wills & testamentary trusts',
    'Adoption papers',
    'Divorce decrees',
    'Court orders',
    'Certain real estate deeds',
    'Powers of attorney (varies)',
    'Notarized documents (varies)',
];

export default function ESignatureLaws() {
    return (
        <section className="py-32 px-8 lg:px-12 relative z-10 bg-gradient-to-b from-stone-50 to-white overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-[0.02]">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="legal-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M0 10 L20 10 M10 0 L10 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#legal-pattern)" />
                </svg>
            </div>

            <div className="max-w-6xl mx-auto relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-6 border border-emerald-100">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-medium text-emerald-700">Legally Compliant</span>
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-6">
                        E-Signature Laws & Compliance
                    </h2>
                    <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Electronic signatures are legally binding in most countries. Here&apos;s what you need to know about the laws that protect your digital signatures.
                    </p>
                </motion.div>

                {/* Laws Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {laws.map((law, index) => (
                        <motion.div
                            key={law.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 border border-stone-200/80 hover:border-stone-300 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{law.country}</span>
                                    <div>
                                        <h3 className="font-semibold text-stone-900 group-hover:text-stone-800">{law.name}</h3>
                                        <p className="text-xs text-stone-400">{law.region}</p>
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 bg-stone-100 rounded-full text-stone-500 font-mono">
                                    {law.year}
                                </span>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                {law.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Valid vs Invalid Uses */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Valid Uses */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-stone-900">Valid For</h3>
                        </div>
                        <ul className="space-y-3">
                            {validUses.map((use, index) => (
                                <li key={index} className="flex items-center gap-3 text-stone-600">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    {use}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Invalid Uses */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-stone-900">Exceptions (Check Local Laws)</h3>
                        </div>
                        <ul className="space-y-3">
                            {invalidUses.map((use, index) => (
                                <li key={index} className="flex items-center gap-3 text-stone-600">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    {use}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-sm text-stone-400 max-w-2xl mx-auto">
                        <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute legal advice.
                        Always consult with a qualified legal professional for specific questions about e-signature validity in your jurisdiction.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
