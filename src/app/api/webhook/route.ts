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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        if (!webhookSecret) {
            console.log('Webhook secret not configured');
            return NextResponse.json(
                { error: 'Webhook not configured' },
                { status: 503 }
            );
        }

        let event: Stripe.Event;

        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json(
                { error: 'Stripe not configured' },
                { status: 503 }
            );
        }

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const planId = session.metadata?.planId;
                const customerEmail = session.customer_email;

                console.log('Checkout completed:', {
                    planId,
                    customerEmail,
                    subscriptionId: session.subscription,
                });

                // TODO: Update user's subscription status in your database
                // Example with Clerk metadata:
                // await clerkClient.users.updateUserMetadata(userId, {
                //     publicMetadata: {
                //         subscriptionPlan: planId,
                //         subscriptionId: session.subscription,
                //     },
                // });

                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('Subscription updated:', {
                    id: subscription.id,
                    status: subscription.status,
                });

                // TODO: Update subscription status in database
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('Subscription cancelled:', subscription.id);

                // TODO: Downgrade user to free tier
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('Payment succeeded for invoice:', invoice.id);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('Payment failed for invoice:', invoice.id);

                // TODO: Notify user of failed payment
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
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
