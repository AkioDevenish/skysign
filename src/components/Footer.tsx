import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12 px-8 lg:px-12 border-t border-stone-200/60 bg-stone-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-stone-50"
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
                        <span className="text-sm font-medium text-stone-700">Sky Sign</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-stone-500">
                        <Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
                        <Link href="/refund" className="hover:text-stone-900 transition-colors">Refund</Link>
                        <Link href="/support" className="hover:text-stone-900 transition-colors">Support</Link>
                        <Link href="/compliance" className="hover:text-stone-900 transition-colors">Global Compliance</Link>
                    </div>
                    <p className="text-sm text-stone-400">
                        © 2026 skysign. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
