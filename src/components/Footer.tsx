import Link from 'next/link';
import Logo from '@/components/Logo';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-16 px-8 lg:px-12 border-t border-stone-200/60 bg-stone-50">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <Logo size="sm" />
                            <span className="text-lg font-bold text-stone-900 tracking-tight">SkySign</span>
                        </div>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">
                            The most intuitive way to sign documents using air gestures and AR technology.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-100 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-100 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-100 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h4 className="font-semibold text-stone-900 mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-stone-500">
                            <li><Link href="/how-it-works" className="hover:text-stone-900 transition-colors">How it Works</Link></li>
                            <li><a href="/#pricing" className="hover:text-stone-900 transition-colors">Pricing & Plans</a></li>
                            <li><a href="/#faq" className="hover:text-stone-900 transition-colors">FAQ</a></li>
                            <li><Link href="/create" className="hover:text-stone-900 transition-colors">Create Signature</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="font-semibold text-stone-900 mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-stone-500">
                            <li><Link href="/privacy" className="hover:text-stone-900 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-stone-900 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund" className="hover:text-stone-900 transition-colors">Refund Policy</Link></li>
                            <li><Link href="/compliance" className="hover:text-stone-900 transition-colors">Global Compliance</Link></li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h4 className="font-semibold text-stone-900 mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-stone-500">
                            <li><Link href="/support" className="hover:text-stone-900 transition-colors">Help Center</Link></li>
                            <li><a href="mailto:support@skysign.com" className="hover:text-stone-900 transition-colors">Contact Us</a></li>
                            <li>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <span className="text-emerald-600 font-medium text-xs">All Systems Operational</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-stone-400">
                        © 2026 SkySign. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-stone-400">
                        <span>Made with ♥️ in Trinidad & Tobago</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
