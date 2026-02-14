import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SkySign <onboarding@resend.dev>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'hello@skysign.io';

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!email.includes('@')) {
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

        // 1. Send notification to the support team
        const { error: supportError } = await resend.emails.send({
            from: FROM_EMAIL,
            to: SUPPORT_EMAIL,
            replyTo: email,
            subject: `[Support] ${subject}`,
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
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">📩 New Support Request</h1>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #a8a29e; font-size: 13px; font-weight: 600; vertical-align: top; width: 80px;">From</td>
          <td style="padding: 8px 0; color: #1c1917; font-size: 14px;">${name} &lt;${email}&gt;</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #a8a29e; font-size: 13px; font-weight: 600; vertical-align: top;">Subject</td>
          <td style="padding: 8px 0; color: #1c1917; font-size: 14px;">${subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #a8a29e; font-size: 13px; font-weight: 600; vertical-align: top;">Time</td>
          <td style="padding: 8px 0; color: #1c1917; font-size: 14px;">${new Date().toISOString()}</td>
        </tr>
      </table>
      <div style="background: #fafaf9; border-left: 3px solid #1c1917; padding: 16px; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #57534e; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>
      <p style="margin: 24px 0 0; color: #a8a29e; font-size: 12px;">
        Reply directly to this email to respond to the customer.
      </p>
    </div>
  </div>
</body>
</html>
            `,
        });

        if (supportError) {
            console.error('[Support] Failed to send to support:', supportError);
            return NextResponse.json(
                { error: 'Failed to send message' },
                { status: 500 }
            );
        }

        // 2. Send confirmation email to the user
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `We received your message — "${subject}"`,
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
      <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px;">
        We've got your message, ${name}!
      </h2>
      <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6;">
        Thanks for reaching out. We've received your support request and will get back to you within 24 hours.
      </p>
      <div style="background: #fafaf9; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0 0 8px; color: #a8a29e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your message</p>
        <p style="margin: 0 0 4px; color: #1c1917; font-size: 14px; font-weight: 600;">${subject}</p>
        <p style="margin: 0; color: #57534e; font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${message.length > 200 ? message.substring(0, 200) + '...' : message}</p>
      </div>
      <p style="margin: 0; color: #a8a29e; font-size: 13px;">
        If you need to add anything, just reply to this email.
      </p>
    </div>
    <div style="background: #fafaf9; padding: 24px; text-align: center; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; color: #a8a29e; font-size: 12px;">
        SkySign Support • hello@skysign.io
      </p>
    </div>
  </div>
</body>
</html>
            `,
        });

        return NextResponse.json(
            { success: true, message: 'Message sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Support form error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
