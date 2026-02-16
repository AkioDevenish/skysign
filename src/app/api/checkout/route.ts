import { NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/apiUtils';

// Price IDs from Paddle Dashboard (hardcoded strings to avoid env var corruption/quotes)
const PRICE_IDS = {
    pro: {
        monthly: 'pri_01khkgby88ehsa1at50nvxagbm',
        yearly: 'pri_01khkgsy6wmn4z0dbxy212ngq6',
    },
    proplus: {
        monthly: 'pri_01khkh3nnjv3tpmn6a6cft5p7q',
        yearly: 'pri_01khkh6rxg63rtk833862p3wdv',
    },
};

// Paddle API key (must be set in env)
const PADDLE_API_KEY = (process.env.PADDLE_API_KEY || '').trim();

export const dynamic = 'force-dynamic';

// Rate limit: 10 checkout attempts per IP per 15 minutes
const rateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 10 });

export async function POST(request: Request) {
    try {
        // Rate limiting
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
        if (!rateLimiter.check(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { planId, email, clerkUserId, billingCycle = 'monthly' } = await request.json();

        // Validate plan
        if (!planId || !['pro', 'proplus'].includes(planId)) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        // Check if Paddle is configured
        if (!PADDLE_API_KEY) {
            return NextResponse.json(
                {
                    error: 'Payment system not configured',
                    message: 'Please contact support to set up your subscription.',
                },
                { status: 503 }
            );
        }

        const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
        // Force trim just in case, though hardcoded values are clean
        const priceId = (PRICE_IDS[planId as keyof typeof PRICE_IDS]?.[cycle] || '').trim();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price not configured for this plan' },
                { status: 500 }
            );
        }

        // Create transaction server-side via Paddle API
        const transactionPayload = {
            items: [{ 
                price_id: priceId, 
                quantity: 1 
            }],
            ...(clerkUserId ? {
                custom_data: {
                    clerk_user_id: clerkUserId,
                    plan_id: planId,
                },
            } : {}),
        };

        const bodyString = JSON.stringify(transactionPayload);

        const paddleResponse = await fetch('https://api.paddle.com/transactions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PADDLE_API_KEY}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            },
            body: bodyString,
        });

        const responseText = await paddleResponse.text();
        let paddleData;
        try {
            paddleData = JSON.parse(responseText);
        } catch {
            console.error('Paddle API returned non-JSON:', responseText);
            return NextResponse.json(
                { error: 'Failed to create transaction', details: responseText },
                { status: 500 }
            );
        }

        if (!paddleResponse.ok) {
            console.error('Paddle API error:', JSON.stringify(paddleData));
            return NextResponse.json(
                { error: 'Failed to create transaction' },
                { status: 500 }
            );
        }

        const transactionId = paddleData.data?.id;

        if (!transactionId) {
            console.error('No transaction ID returned:', JSON.stringify(paddleData));
            return NextResponse.json(
                { error: 'Failed to get transaction ID' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            transactionId,
            customerEmail: email,
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout' },
            { status: 500 }
        );
    }
}

// Handle GET request to check configuration status
export async function GET() {
    const isConfigured = !!PADDLE_API_KEY;

    return NextResponse.json({
        configured: isConfigured,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'production',
        plans: {
            pro: true, // Hardcoded now
            proplus: true, // Hardcoded now
        },
    });
}
