import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build errors
function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        return null;
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
    });
}

// Price IDs from Stripe Dashboard
const PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID || '',
    proplus: process.env.STRIPE_PROPLUS_PRICE_ID || '',
};

export async function POST(request: NextRequest) {
    try {
        const { planId, email, successUrl, cancelUrl } = await request.json();

        // Validate plan
        if (!planId || !['pro', 'proplus'].includes(planId)) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.log('Stripe not configured. Plan:', planId, 'Email:', email);
            return NextResponse.json(
                {
                    error: 'Payment system not configured',
                    message: 'Please contact support to set up your subscription.',
                },
                { status: 503 }
            );
        }

        const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS];

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price not configured for this plan' },
                { status: 500 }
            );
        }

        // Create Stripe Checkout Session
        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe not initialized' },
                { status: 500 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/create?success=true`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/#pricing`,
            customer_email: email || undefined,
            metadata: {
                planId,
            },
            subscription_data: {
                metadata: {
                    planId,
                },
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Checkout error:', error);

        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

// Handle GET request to check configuration status
export async function GET() {
    const isConfigured = !!(
        process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_PRO_PRICE_ID &&
        process.env.STRIPE_PROPLUS_PRICE_ID
    );

    return NextResponse.json({
        configured: isConfigured,
        plans: {
            pro: !!process.env.STRIPE_PRO_PRICE_ID,
            proplus: !!process.env.STRIPE_PROPLUS_PRICE_ID,
        },
    });
}
