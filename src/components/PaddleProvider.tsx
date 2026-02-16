'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        Paddle?: {
            Initialize: (config: { token: string }) => void;
            Checkout: {
                open: (config: Record<string, unknown>) => void;
            };
            Environment: {
                set: (env: string) => void;
            };
        };
    }
}

// Price IDs — used for display logic only on client
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

export async function openPaddleCheckout({
    customerEmail,
    clerkUserId,
    planId,
    billingCycle = 'monthly',
}: {
    priceId?: string;
    customerEmail?: string;
    clerkUserId?: string;
    planId: string;
    billingCycle?: 'monthly' | 'yearly';
}) {
    if (!window.Paddle) {
        console.error('Paddle.js not loaded');
        alert('Payment system is loading. Please try again in a moment.');
        return;
    }

    try {
        // Create transaction server-side first
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planId,
                email: customerEmail,
                clerkUserId,
                billingCycle,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Checkout API error:', data);
            alert(data.error || 'Failed to start checkout. Please try again.');
            return;
        }

        // Open checkout using the server-created transaction ID
        const checkoutConfig: Record<string, unknown> = {
            transactionId: data.transactionId,
        };

        if (customerEmail) {
            checkoutConfig.customer = { email: customerEmail };
        }

        console.log('Opening Paddle checkout with transactionId:', data.transactionId);
        window.Paddle.Checkout.open(checkoutConfig);
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to start checkout. Please try again.');
    }
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
