import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Paddle webhook secret for signature verification
const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';

interface PaddleWebhookEvent {
    event_id: string;
    event_type: string;
    occurred_at: string;
    notification_id: string;
    data: {
        id: string;
        status: string;
        customer_id: string;
        custom_data?: {
            clerkUserId?: string;
            planId?: string;
        };
        items?: Array<{
            price: {
                id: string;
                product_id: string;
            };
        }>;
        billing_details?: {
            email?: string;
        };
    };
}

function verifyPaddleSignature(
    rawBody: string,
    signature: string | null,
    secret: string
): boolean {
    if (!signature || !secret) return false;

    try {
        // Paddle uses ts;h1=signature format
        const parts = signature.split(';');
        const tsMatch = parts.find(p => p.startsWith('ts='));
        const h1Match = parts.find(p => p.startsWith('h1='));

        if (!tsMatch || !h1Match) return false;

        const timestamp = tsMatch.split('=')[1];
        const providedSignature = h1Match.split('=')[1];

        const signedPayload = `${timestamp}:${rawBody}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(providedSignature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('paddle-signature');

        // Verify signature in production
        if (webhookSecret && !verifyPaddleSignature(rawBody, signature, webhookSecret)) {
            console.error('Paddle webhook signature verification failed');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        const event: PaddleWebhookEvent = JSON.parse(rawBody);

        console.log('Paddle webhook received:', event.event_type);

        // Handle the event
        switch (event.event_type) {
            case 'subscription.created':
            case 'subscription.activated': {
                const { custom_data, status } = event.data;
                const clerkUserId = custom_data?.clerkUserId;
                const planId = custom_data?.planId;

                console.log('Subscription created:', {
                    planId,
                    clerkUserId,
                    status,
                    subscriptionId: event.data.id,
                });

                // TODO: Update user's subscription in Clerk
                // import { clerkClient } from '@clerk/nextjs/server';
                // if (clerkUserId) {
                //     await clerkClient.users.updateUserMetadata(clerkUserId, {
                //         publicMetadata: {
                //             plan: planId,
                //             subscriptionId: event.data.id,
                //             subscriptionStatus: status,
                //         },
                //     });
                // }

                break;
            }

            case 'subscription.updated': {
                const { status, custom_data } = event.data;
                console.log('Subscription updated:', {
                    id: event.data.id,
                    status,
                    clerkUserId: custom_data?.clerkUserId,
                });

                // TODO: Update subscription status
                break;
            }

            case 'subscription.canceled':
            case 'subscription.past_due': {
                const { custom_data, status } = event.data;
                console.log('Subscription cancelled/past due:', {
                    id: event.data.id,
                    status,
                    clerkUserId: custom_data?.clerkUserId,
                });

                // TODO: Downgrade user to free tier
                // if (custom_data?.clerkUserId) {
                //     await clerkClient.users.updateUserMetadata(custom_data.clerkUserId, {
                //         publicMetadata: {
                //             plan: 'free',
                //             subscriptionId: null,
                //             subscriptionStatus: status,
                //         },
                //     });
                // }

                break;
            }

            case 'transaction.completed': {
                console.log('Transaction completed:', event.data.id);
                break;
            }

            case 'transaction.payment_failed': {
                console.log('Payment failed for transaction:', event.data.id);
                // TODO: Notify user of failed payment
                break;
            }

            default:
                console.log(`Unhandled Paddle event type: ${event.event_type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}
