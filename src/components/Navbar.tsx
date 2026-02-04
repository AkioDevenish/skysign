'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Logo from '@/components/Logo';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-stone-50/90 backdrop-blur-md z-50 border-b border-stone-200/60">
            <div className="max-w-6xl mx-auto px-8 lg:px-12 py-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Logo size="md" />
                    <span className="text-xl font-semibold tracking-tight text-stone-900">SkySign</span>
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
