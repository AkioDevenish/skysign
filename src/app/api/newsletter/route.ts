import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Newsletter subscription endpoint using Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SkySign <onboarding@resend.dev>';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY not configured');
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 503 }
            );
        }

        // Send welcome email to the subscriber
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Welcome to SkySign! ✍️',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    <div style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">✍️ SkySign</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px;">Welcome to SkySign!</h2>
      <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6;">
        Thanks for subscribing to our newsletter! You'll be the first to know about:
      </p>
      <ul style="color: #57534e; line-height: 2; padding-left: 20px;">
        <li>New AR signature features</li>
        <li>Product updates and improvements</li>
        <li>Tips for creating the perfect digital signature</li>
        <li>Exclusive early access to new plans</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://skysign.io'}/create" style="display: inline-block; background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); color: white; padding: 14px 32px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Start Signing Free →
        </a>
      </div>
    </div>
    <div style="background: #fafaf9; padding: 24px; text-align: center; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; color: #a8a29e; font-size: 12px;">
        You're receiving this because you subscribed at SkySign. If this wasn't you, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Resend newsletter error:', error);
            return NextResponse.json(
                { error: 'Failed to subscribe' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Successfully subscribed!' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}
