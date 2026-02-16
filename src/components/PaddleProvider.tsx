'use client';

import { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

declare global {
    interface Window {
        Paddle?: {
            Initialize: (config: Record<string, unknown>) => void;
            Checkout: {
                open: (config: Record<string, unknown>) => void;
            };
            Environment: {
                set: (env: string) => void;
            };
        };
    }
}

// Price IDs from environment
const PRICE_IDS = {
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
    return PRICE_IDS[planId][billingCycle];
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

    window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: customerEmail ? { email: customerEmail } : undefined,
        customData: {
            clerkUserId: clerkUserId || '',
            planId,
        },
        settings: {
            displayMode: 'overlay',
            theme: 'light',
            successUrl: `${window.location.origin}/dashboard?subscribed=true`,
        },
    });
}

export default function PaddleProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();

    const initPaddle = useCallback(() => {
        if (!window.Paddle) return;

        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!clientToken) {
            console.warn('Paddle client token not configured');
            return;
        }

        const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;

        // Only set sandbox environment explicitly; live is the default
        if (environment === 'sandbox') {
            window.Paddle.Environment.set('sandbox');
        }

        window.Paddle.Initialize({
            token: clientToken,
            pwCustomer: user?.primaryEmailAddress?.emailAddress
                ? { email: user.primaryEmailAddress.emailAddress }
                : undefined,
            checkout: {
                settings: {
                    displayMode: 'overlay',
                    theme: 'light',
                },
            },
            eventCallback: (event: { name: string; data?: Record<string, unknown> }) => {
                if (event.name === 'checkout.completed') {
                    // Redirect to dashboard after successful checkout
                    window.location.href = '/dashboard?subscribed=true';
                }
            },
        });
    }, [user]);

    useEffect(() => {
        // Check if Paddle is already loaded
        if (window.Paddle) {
            initPaddle();
            return;
        }

        // Wait for Paddle.js to load
        const checkPaddle = setInterval(() => {
            if (window.Paddle) {
                clearInterval(checkPaddle);
                initPaddle();
            }
        }, 200);

        // Cleanup
        return () => clearInterval(checkPaddle);
    }, [initPaddle]);

    return <>{children}</>;
}
