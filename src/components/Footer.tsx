import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Footer() {
    return (
        <footer className="py-12 px-8 lg:px-12 border-t border-stone-200/60 bg-stone-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" />
                        <span className="text-sm font-medium text-stone-700">SkySign</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-stone-500">
                        <Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-stone-900 transition-colors">Terms</Link>
                        <Link href="/refund" className="hover:text-stone-900 transition-colors">Refund</Link>
                        <Link href="/support" className="hover:text-stone-900 transition-colors">Support</Link>
                        <Link href="/compliance" className="hover:text-stone-900 transition-colors">Global Compliance</Link>
                    </div>
                    <p className="text-sm text-stone-400">
                        © 2026 SkySign. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
