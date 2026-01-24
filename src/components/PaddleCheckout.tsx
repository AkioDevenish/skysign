'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

declare global {
    interface Window {
        Paddle?: {
            Environment: {
                set: (env: 'sandbox' | 'production') => void;
            };
            Initialize: (options: { token: string }) => void;
            Checkout: {
                open: (options: {
                    items: { priceId: string; quantity: number }[];
                    customer?: { email: string };
                    customData?: Record<string, string>;
                    successUrl?: string;
                    settings?: {
                        displayMode?: 'overlay' | 'inline';
                        theme?: 'light' | 'dark';
                        locale?: string;
                    };
                }) => void;
            };
        };
    }
}

interface PaddleCheckoutProps {
    priceId: string;
    planName: string;
    buttonText?: string;
    className?: string;
}

export default function PaddleCheckout({
    priceId,
    planName,
    buttonText = 'Subscribe',
    className = '',
}: PaddleCheckoutProps) {
    const { user, isLoaded } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [paddleLoaded, setPaddleLoaded] = useState(false);

    useEffect(() => {
        // Load Paddle.js script
        if (typeof window !== 'undefined' && !window.Paddle) {
            const script = document.createElement('script');
            script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
            script.async = true;
            script.onload = () => {
                // Initialize Paddle
                const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
                const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox';

                if (vendorId && window.Paddle) {
                    window.Paddle.Environment.set(environment);
                    window.Paddle.Initialize({ token: vendorId });
                    setPaddleLoaded(true);
                }
            };
            document.body.appendChild(script);
        } else if (window.Paddle) {
            setPaddleLoaded(true);
        }
    }, []);

    const handleCheckout = async () => {
        if (!window.Paddle || !paddleLoaded) {
            alert('Payment system is loading. Please try again in a moment.');
            return;
        }

        if (!isLoaded || !user) {
            alert('Please sign in to subscribe.');
            return;
        }

        setIsLoading(true);

        try {
            window.Paddle.Checkout.open({
                items: [{ priceId, quantity: 1 }],
                customer: {
                    email: user.primaryEmailAddress?.emailAddress || '',
                },
                customData: {
                    clerkUserId: user.id,
                    planName: planName,
                },
                successUrl: `${window.location.origin}/dashboard?upgraded=true`,
                settings: {
                    displayMode: 'overlay',
                    theme: 'light',
                    locale: 'en',
                },
            });
        } catch (error) {
            console.error('Paddle checkout error:', error);
            alert('Failed to open checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={isLoading || !paddleLoaded}
            className={`px-6 py-3 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                </span>
            ) : (
                buttonText
            )}
        </button>
    );
}
