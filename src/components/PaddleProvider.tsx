'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

declare global {
    interface Window {
        Paddle?: {
            Initialize: (config: Record<string, unknown>) => void;
            Checkout: {
                open: (config: Record<string, unknown>) => void;
            };
            Setup: (config: Record<string, unknown>) => void;
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
    clerkUserId,
    planId,
}: {
    priceId: string;
    customerEmail?: string;
    clerkUserId?: string;
    planId: string;
}) {
    if (!window.Paddle) {
        console.error('Paddle.js not loaded');
        alert('Payment system is loading. Please try again in a moment.');
        return;
    }

    const checkoutConfig: Record<string, unknown> = {
        items: [{ priceId, quantity: 1 }],
        settings: {
            displayMode: 'overlay',
            theme: 'light',
            successUrl: `${window.location.origin}/dashboard?subscribed=true`,
        },
        customData: {
            clerkUserId: clerkUserId || '',
            planId,
        },
    };

    if (customerEmail) {
        checkoutConfig.customer = { email: customerEmail };
    }

    window.Paddle.Checkout.open(checkoutConfig);
}

export default function PaddleProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const initialized = useRef(false);

    const initPaddle = useCallback(() => {
        if (!window.Paddle || initialized.current) return;

        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!clientToken) {
            console.warn('Paddle client token not configured');
            return;
        }

        const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'production';

        try {
            window.Paddle.Initialize({
                token: clientToken,
                environment: environment === 'sandbox' ? 'sandbox' : undefined,
            });
            initialized.current = true;
        } catch (error) {
            console.error('Failed to initialize Paddle:', error);
        }
    }, []);

    useEffect(() => {
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
    }, [initPaddle]);

    return <>{children}</>;
}
