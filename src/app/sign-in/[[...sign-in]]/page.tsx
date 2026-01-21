'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <main
            className="gradient-bg"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '32px',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '36px' }}>✍️</span>
                    <span
                        style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            letterSpacing: '-0.5px',
                        }}
                        className="neon-text"
                    >
                        SkySign
                    </span>
                </div>

                {/* Clerk Sign In Component */}
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: {
                                boxShadow: '0 0 40px rgba(0, 245, 255, 0.15)',
                                borderRadius: '24px',
                            },
                            card: {
                                background: 'rgba(10, 10, 26, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                            },
                            headerTitle: {
                                color: '#ffffff',
                            },
                            headerSubtitle: {
                                color: 'rgba(255, 255, 255, 0.6)',
                            },
                            socialButtonsBlockButton: {
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                            },
                            formFieldLabel: {
                                color: 'rgba(255, 255, 255, 0.8)',
                            },
                            formFieldInput: {
                                background: 'rgba(26, 26, 46, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#ffffff',
                            },
                            formButtonPrimary: {
                                background: 'linear-gradient(135deg, #00f5ff 0%, #a855f7 100%)',
                                color: '#000000',
                                fontWeight: '600',
                            },
                            footerActionLink: {
                                color: '#00f5ff',
                            },
                        },
                    }}
                />
            </div>
        </main>
    );
}
