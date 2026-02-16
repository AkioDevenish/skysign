'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Paddle?: {
            Initialize: (config: { token: string }) => void;
            Checkout: {
                open: (config: {
                    items: Array<{ priceId: string; quantity: number }>;
                    customer?: { email: string };
                }) => void;
            };
            Environment: {
                set: (env: string) => void;
            };
        };
    }
}

// Price IDs — these are public identifiers, not secrets
const PRICE_IDS: Record<string, Record<string, string>> = {
    pro: {
        monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pri_01khkgby88ehsa1at50nvxagbm',
        yearly: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01khkgsy6wmn4z0dbxy212ngq6',
    },
    proplus: {
        monthly: process.env.NEXT_PUBLIC_PADDLE_PROPLUS_PRICE_ID || 'pri_01khkh3nnjv3tpmn6a6cft5p7q',
        yearly: process.env.NEXT_PUBLIC_PADDLE_PROPLUS_YEARLY_PRICE_ID || 'pri_01khkh6rxg63rtk833862p3wdv',
    },
};

export function getPriceId(planId: 'pro' | 'proplus', billingCycle: 'monthly' | 'yearly'): string {
    return PRICE_IDS[planId]?.[billingCycle] || '';
}

export function openPaddleCheckout({
    priceId,
    customerEmail,
}: {
    priceId: string;
    customerEmail?: string;
    clerkUserId?: string;
    planId?: string;
}) {
    if (!window.Paddle) {
        console.error('Paddle.js not loaded');
        alert('Payment system is loading. Please try again in a moment.');
        return;
    }

    // Keep checkout config minimal to avoid 400 errors
    const config: {
        items: Array<{ priceId: string; quantity: number }>;
        customer?: { email: string };
    } = {
        items: [{ priceId, quantity: 1 }],
    };

    if (customerEmail) {
        config.customer = { email: customerEmail };
    }

    console.log('Opening Paddle checkout with config:', config);
    window.Paddle.Checkout.open(config);
}

export default function PaddleProvider({ children }: { children: React.ReactNode }) {
    const initialized = useRef(false);

    useEffect(() => {
        const initPaddle = () => {
            if (!window.Paddle || initialized.current) return;

            const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
            if (!clientToken) {
                console.warn('Paddle client token not configured');
                return;
            }

            const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'production';

            try {
                // For sandbox, set environment before Initialize
                if (environment === 'sandbox') {
                    window.Paddle.Environment.set('sandbox');
                }

                window.Paddle.Initialize({ token: clientToken });
                initialized.current = true;
                console.log('Paddle initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Paddle:', error);
            }
        };

        if (window.Paddle) {
            initPaddle();
            return;
        }

        const checkPaddle = setInterval(() => {
            if (window.Paddle) {
                clearInterval(checkPaddle);
                initPaddle();
            }
        }, 200);

        return () => clearInterval(checkPaddle);
    }, []);

    return <>{children}</>;
}
