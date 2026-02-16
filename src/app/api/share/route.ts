import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml, isValidEmail, createRateLimiter } from '@/lib/apiUtils';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SkySign <onboarding@resend.dev>';

// Rate limit: 10 shares per IP per 15 minutes
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

        const body = await request.json();
        const { email, documentName, pdfData, type } = body;

        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY not configured');
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 503 }
            );
        }

        if (type === 'email') {
            if (!email || !isValidEmail(email)) {
                return NextResponse.json(
                    { error: 'Valid email is required' },
                    { status: 400 }
                );
            }

            const safeDocName = escapeHtml(documentName || 'Document');

            const { error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: email,
                subject: `Signed Document: ${documentName || 'Document'}`,
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
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">SkySign</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px;">
        You've received a signed document
      </h2>
      <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6;">
        A signed copy of <strong>"${safeDocName}"</strong> has been shared with you via SkySign.
      </p>
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          The signed PDF is attached to this email.
        </p>
      </div>
      <p style="margin: 0; color: #a8a29e; font-size: 13px;">
        This document was signed and shared securely using SkySign with AES-256 encryption.
      </p>
    </div>
    <div style="background: #fafaf9; padding: 24px; text-align: center; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; color: #a8a29e; font-size: 12px;">
        Secured with AES-256 encryption &bull; SkySign
      </p>
    </div>
  </div>
</body>
</html>
                `,
                attachments: pdfData
                    ? [
                          {
                              filename: documentName || 'signed-document.pdf',
                              content: pdfData,
                          },
                      ]
                    : undefined,
            });

            if (error) {
                console.error('[SHARE] Resend error:', error);
                return NextResponse.json(
                    { error: 'Failed to send email' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, message: 'Email sent' });
        }

        return NextResponse.json({ error: 'Invalid share type' }, { status: 400 });
    } catch (error) {
        console.error('Share API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
