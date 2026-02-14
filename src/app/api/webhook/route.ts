import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
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

/**
 * Helper to update Clerk user's publicMetadata with subscription info.
 * This is what the dashboard reads to determine the user's plan.
 */
async function updateUserPlan(
    clerkUserId: string,
    metadata: {
        plan: string;
        subscriptionId: string | null;
        subscriptionStatus: string;
    }
) {
    try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkUserId, {
            publicMetadata: metadata,
        });
    } catch (err) {
        console.error(`[Webhook] Failed to update Clerk metadata for ${clerkUserId}:`, err);
        throw err; // Re-throw so the webhook returns 500 and Paddle retries
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

        // Handle the event
        switch (event.event_type) {
            case 'subscription.created':
            case 'subscription.activated': {
                const { custom_data, status } = event.data;
                const clerkUserId = custom_data?.clerkUserId;
                const planId = custom_data?.planId;

                if (clerkUserId && planId) {
                    await updateUserPlan(clerkUserId, {
                        plan: planId,
                        subscriptionId: event.data.id,
                        subscriptionStatus: status,
                    });
                }

                break;
            }

            case 'subscription.updated': {
                const { status, custom_data } = event.data;
                const clerkUserId = custom_data?.clerkUserId;
                const planId = custom_data?.planId;

                if (clerkUserId) {
                    await updateUserPlan(clerkUserId, {
                        plan: planId || 'pro',
                        subscriptionId: event.data.id,
                        subscriptionStatus: status,
                    });
                }

                break;
            }

            case 'subscription.canceled':
            case 'subscription.past_due': {
                const { custom_data, status } = event.data;
                const clerkUserId = custom_data?.clerkUserId;

                if (clerkUserId) {
                    await updateUserPlan(clerkUserId, {
                        plan: 'free',
                        subscriptionId: null,
                        subscriptionStatus: status,
                    });
                }

                break;
            }

            case 'transaction.completed': {
                break;
            }

            case 'transaction.payment_failed': {
                // Log the failed payment for monitoring
                const clerkUserId = event.data.custom_data?.clerkUserId;
                if (clerkUserId) {
                    console.error(
                        `[Webhook] Payment failed for user ${clerkUserId}, subscription ${event.data.id}`
                    );
                }
                break;
            }

            default:
                // Unhandled event type
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
