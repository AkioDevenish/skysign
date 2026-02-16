import { NextResponse } from 'next/server';

// Price IDs from Paddle Dashboard
const PRICE_IDS = {
    pro: {
        monthly: process.env.PADDLE_PRO_PRICE_ID || '',
        yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID || '',
    },
    proplus: {
        monthly: process.env.PADDLE_PROPLUS_PRICE_ID || '',
        yearly: process.env.PADDLE_PROPLUS_YEARLY_PRICE_ID || '',
    },
};

export async function POST(request: Request) {
    try {
        const { planId, email, clerkUserId, billingCycle = 'monthly' } = await request.json();

        // Validate plan
        if (!planId || !['pro', 'proplus'].includes(planId)) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        // Check if Paddle is configured
        const apiKey = process.env.PADDLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                {
                    error: 'Payment system not configured',
                    message: 'Please contact support to set up your subscription.',
                },
                { status: 503 }
            );
        }

        const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
        const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS]?.[cycle];

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price not configured for this plan' },
                { status: 500 }
            );
        }

        // Create transaction server-side via Paddle API
        const transactionPayload: Record<string, unknown> = {
            items: [{ price_id: priceId, quantity: 1 }],
        };

        // Add custom data if we have a Clerk user ID
        if (clerkUserId) {
            transactionPayload.custom_data = {
                clerk_user_id: clerkUserId,
                plan_id: planId,
            };
        }

        console.log('Creating Paddle transaction with API key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING');
        console.log('Price ID:', priceId);

        const paddleResponse = await fetch('https://api.paddle.com/transactions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionPayload),
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
                { error: 'Failed to create transaction', details: paddleData },
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
    const isConfigured = !!(
        process.env.PADDLE_API_KEY &&
        process.env.PADDLE_PRO_PRICE_ID &&
        process.env.PADDLE_PROPLUS_PRICE_ID
    );

    return NextResponse.json({
        configured: isConfigured,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'production',
        plans: {
            pro: !!(process.env.PADDLE_PRO_PRICE_ID && process.env.PADDLE_PRO_YEARLY_PRICE_ID),
            proplus: !!(process.env.PADDLE_PROPLUS_PRICE_ID && process.env.PADDLE_PROPLUS_YEARLY_PRICE_ID),
        },
    });
}
