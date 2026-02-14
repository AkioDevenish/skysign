import { NextResponse } from 'next/server';

// Price IDs from Paddle Dashboard
const PRICE_IDS = {
    pro: process.env.PADDLE_PRO_PRICE_ID || '',
    proplus: process.env.PADDLE_PROPLUS_PRICE_ID || '',
};

export async function POST(request: Request) {
    try {
        const { planId, email, clerkUserId } = await request.json();

        // Validate plan
        if (!planId || !['pro', 'proplus'].includes(planId)) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        // Check if Paddle is configured
        if (!process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID) {
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

        // Return Paddle checkout configuration for client-side overlay
        // Paddle uses client-side checkout, so we return the config needed
        return NextResponse.json({
            priceId,
            planId,
            vendorId: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
            environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox',
            customerEmail: email,
            customData: {
                clerkUserId,
                planId,
            },
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout configuration' },
            { status: 500 }
        );
    }
}

// Handle GET request to check configuration status
export async function GET() {
    const isConfigured = !!(
        process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID &&
        process.env.PADDLE_PRO_PRICE_ID &&
        process.env.PADDLE_PROPLUS_PRICE_ID
    );

    return NextResponse.json({
        configured: isConfigured,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox',
        plans: {
            pro: !!process.env.PADDLE_PRO_PRICE_ID,
            proplus: !!process.env.PADDLE_PROPLUS_PRICE_ID,
        },
    });
}
