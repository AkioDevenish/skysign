'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Navbar() {
    return (
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
                <div className="hidden md:flex items-center gap-10">
                    <Link href="/#features" className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">Features</Link>
                    <Link href="/#pricing" className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">Pricing</Link>
                    <Link href="/#faq" className="text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">FAQ</Link>
                    <SignedOut>
                        <Link
                            href="/sign-up"
                            className="px-6 py-2.5 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/10"
                        >
                            Get Started
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/create"
                            className="px-6 py-2.5 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/10"
                        >
                            Create Signature
                        </Link>
                        <UserButton
                            userProfileMode="navigation"
                            userProfileUrl="/dashboard"
                            appearance={{
                                elements: {
                                    avatarBox: {
                                        width: '36px',
                                        height: '36px',
                                    },
                                },
                            }}
                        />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
