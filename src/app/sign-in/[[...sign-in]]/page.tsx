'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url(/signature-pattern.png)`,
                    backgroundSize: '500px',
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* Subtle gradient orbs */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-200/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-300/40 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <Logo size="lg" />
                    <span className="text-2xl font-semibold tracking-tight text-stone-900">
                        SkySign
                    </span>
                </Link>

                {/* Clerk Sign In Component */}
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-white backdrop-blur-xl border border-stone-200 shadow-xl shadow-stone-200/50 rounded-2xl w-full",
                            headerTitle: "text-stone-900 text-xl font-bold",
                            headerSubtitle: "text-stone-500",
                            socialButtonsBlockButton: "bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 transition-all duration-200",
                            socialButtonsBlockButtonText: "text-stone-700 font-medium",
                            dividerLine: "bg-stone-200",
                            dividerText: "text-stone-400",
                            formFieldLabel: "text-stone-700",
                            formFieldInput: "bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-400 focus:ring-stone-400/20 transition-all",
                            formButtonPrimary: "bg-stone-900 hover:bg-stone-800 text-white font-medium border-none transition-all duration-300 shadow-lg shadow-stone-900/20 hover:shadow-xl hover:shadow-stone-900/25",
                            footerActionLink: "text-stone-600 hover:text-stone-900 font-medium",
                            identityPreviewText: "text-stone-900",
                            identityPreviewEditButton: "text-stone-600 hover:text-stone-900",
                            formFieldInputShowPasswordButton: "text-stone-500 hover:text-stone-700",
                            otpCodeFieldInput: "border-stone-200 text-stone-900",
                        },
                        variables: {
                            colorPrimary: '#1c1917',
                            colorText: '#1c1917',
                            colorTextSecondary: '#78716c',
                            colorBackground: '#ffffff',
                            colorInputBackground: '#fafaf9',
                            colorInputText: '#1c1917',
                            borderRadius: '1rem',
                        }
                    }}
                />
            </div>
        </main>
    );
}
