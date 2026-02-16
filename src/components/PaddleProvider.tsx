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

/**
 * Opens a Paddle checkout. Returns an object indicating success/failure
 * so callers can show appropriate toast messages.
 */
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
}): Promise<{ ok: boolean; error?: string }> {
    if (!window.Paddle) {
        return { ok: false, error: 'Payment system is loading. Please try again in a moment.' };
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
            const errorMsg = data.error || 'Failed to start checkout.';
            return { ok: false, error: errorMsg };
        }

        // Open checkout using the server-created transaction ID
        const checkoutConfig: Record<string, unknown> = {
            transactionId: data.transactionId,
            settings: {
                successUrl: `${window.location.origin}/success?payment=completed`,
            }
        };

        if (customerEmail) {
            checkoutConfig.customer = { email: customerEmail };
        }

        window.Paddle.Checkout.open(checkoutConfig);
        return { ok: true };
    } catch (error) {
        console.error('Checkout error:', error);
        return { ok: false, error: 'Failed to start checkout. Please try again.' };
    }
}

export default function PaddleProvider({ children }: { children: React.ReactNode }) {
    const initialized = useRef(false);

    useEffect(() => {
        const initPaddle = () => {
            if (!window.Paddle || initialized.current) return;

            // Use client token from environment
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
