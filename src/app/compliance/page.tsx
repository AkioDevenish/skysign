import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ComplianceGrid from '../../components/ComplianceGrid';

export const metadata: Metadata = {
    title: 'Global E-Signature Compliance | SkySign',
    description: 'Explore electronic signature laws and compliance standards for over 180 countries worldwide.',
};

export default function CompliancePage() {
    return (
        <div className="min-h-screen bg-[#fafaf9] selection:bg-stone-900 selection:text-white flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-20">
                {/* Hero */}
                <div className="max-w-4xl mx-auto px-6 text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full border border-stone-200 mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Global Coverage</span>
                    </span>

                    <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight mb-6">
                        Global Compliance Guide
                    </h1>
                    <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
                        SkySign follows international standards to ensure your signatures are legally binding.
                        Browse our guide to understand e-signature laws in your region.
                    </p>
                </div>

                {/* Grid */}
                <ComplianceGrid />

                {/* FAQ / Info Component (Optional addition for depth) */}
                <div className="max-w-3xl mx-auto px-6 mt-20">
                    <div className="bg-stone-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-4">Not sure about your specific case?</h2>
                            <p className="text-stone-400 mb-8 max-w-lg mx-auto">
                                While standard e-signatures are widely accepted, specific high-risk documents may require qualified signatures. Always consult local legal counsel.
                            </p>
                            <Link
                                href="/terms"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white text-stone-900 font-bold rounded-xl hover:bg-stone-100 transition-colors"
                            >
                                Read Documentation
                            </Link>
                        </div>

                        {/* Abstract blob */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-800 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-50" />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
