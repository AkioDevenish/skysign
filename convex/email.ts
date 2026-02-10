
'use node';

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

const APP_NAME = "SkySign";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SkySign <onboarding@resend.dev>";

// Helper to create consistent email styling
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">✍️ ${APP_NAME}</h1>
    </div>
    <!-- Content -->
    <div style="padding: 32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background: #fafaf9; padding: 24px; text-align: center; border-top: 1px solid #e7e5e4;">
      <p style="margin: 0; color: #a8a29e; font-size: 12px;">
        Secured with AES-256 encryption • ${APP_NAME}
      </p>
    </div>
  </div>
</body>
</html>
`;

// Email template: New signature request
const signatureRequestEmail = (args: {
  recipientName: string;
  senderName: string;
  documentName: string;
  message?: string;
  signingUrl: string;
}) => emailWrapper(`
  <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px;">
    You've been invited to sign a document
  </h2>
  <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6;">
    <strong>${args.senderName}</strong> has requested your signature on <strong>"${args.documentName}"</strong>.
  </p>
  ${args.message ? `
    <div style="background: #fafaf9; border-left: 3px solid #1c1917; padding: 16px; margin: 0 0 24px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #57534e; font-style: italic;">"${args.message}"</p>
      <p style="margin: 8px 0 0; color: #a8a29e; font-size: 13px;">— ${args.senderName}</p>
    </div>
  ` : ''}
  <div style="text-align: center; margin: 32px 0;">
    <a href="${args.signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); color: white; padding: 14px 32px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 15px;">
      ✍️ Review & Sign
    </a>
  </div>
  <p style="margin: 0; color: #a8a29e; font-size: 13px; text-align: center;">
    This link expires in 30 days
  </p>
`);

// Email template: Reminder
const reminderEmail = (args: {
  recipientName: string;
  senderName: string;
  documentName: string;
  signingUrl: string;
  daysRemaining: number;
}) => emailWrapper(`
  <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px;">
    ⏰ Reminder: Signature needed
  </h2>
  <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6;">
    <strong>${args.senderName}</strong> is still waiting for your signature on <strong>"${args.documentName}"</strong>.
  </p>
  <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 0 0 24px; text-align: center;">
    <p style="margin: 0; color: #92400e; font-weight: 600;">
      ⚠️ Only ${args.daysRemaining} days left before this link expires
    </p>
  </div>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${args.signingUrl}" style="display: inline-block; background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); color: white; padding: 14px 32px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 15px;">
      ✍️ Sign Now
    </a>
  </div>
`);

// Email template: Signature completed (to sender)
const signatureCompletedEmail = (args: {
  senderName: string;
  recipientName: string;
  documentName: string;
  signedAt: string;
  downloadUrl?: string;
}) => emailWrapper(`
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #dcfce7; border-radius: 50%; padding: 16px;">
      <span style="font-size: 32px;">✅</span>
    </div>
  </div>
  <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px; text-align: center;">
    Document Signed!
  </h2>
  <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6; text-align: center;">
    <strong>${args.recipientName}</strong> has signed <strong>"${args.documentName}"</strong>.
  </p>
  <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
    <p style="margin: 0; color: #166534; font-size: 14px;">
      <strong>Signed:</strong> ${args.signedAt}
    </p>
  </div>
  ${args.downloadUrl ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${args.downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 14px 32px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 15px;">
        📄 Download Signed Document
      </a>
    </div>
  ` : ''}
`);

// Email template: Signature declined (to sender)
const signatureDeclinedEmail = (args: {
  senderName: string;
  recipientName: string;
  documentName: string;
}) => emailWrapper(`
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #fee2e2; border-radius: 50%; padding: 16px;">
      <span style="font-size: 32px;">❌</span>
    </div>
  </div>
  <h2 style="margin: 0 0 16px; color: #1c1917; font-size: 20px; text-align: center;">
    Signature Declined
  </h2>
  <p style="margin: 0 0 24px; color: #57534e; line-height: 1.6; text-align: center;">
    <strong>${args.recipientName}</strong> has declined to sign <strong>"${args.documentName}"</strong>.
  </p>
  <div style="background: #fef2f2; border-radius: 8px; padding: 16px; text-align: center;">
    <p style="margin: 0; color: #991b1b; font-size: 14px;">
      You may want to reach out to them directly to understand why.
    </p>
  </div>
`);

// === ACTIONS ===

// Send signature request email
export const sendSignatureRequest = action({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    senderName: v.string(),
    documentName: v.string(),
    message: v.optional(v.string()),
    signingUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] RESEND_API_KEY not set, skipping email');
      return { success: false, error: 'Email not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.recipientEmail,
        subject: `${args.senderName} requested your signature on "${args.documentName}"`,
        html: signatureRequestEmail({
          recipientName: args.recipientName || args.recipientEmail.split('@')[0],
          senderName: args.senderName,
          documentName: args.documentName,
          message: args.message,
          signingUrl: args.signingUrl,
        }),
      });

      if (error) throw new Error(error.message);
      console.log('[Email] Signature request sent to:', args.recipientEmail);
      return { success: true, id: data?.id };
    } catch (err) {
      console.error('[Email] Failed to send:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});

// Send reminder email
export const sendReminder = action({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    senderName: v.string(),
    documentName: v.string(),
    signingUrl: v.string(),
    daysRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.recipientEmail,
        subject: `⏰ Reminder: Please sign "${args.documentName}"`,
        html: reminderEmail({
          recipientName: args.recipientName || args.recipientEmail.split('@')[0],
          senderName: args.senderName,
          documentName: args.documentName,
          signingUrl: args.signingUrl,
          daysRemaining: args.daysRemaining,
        }),
      });

      if (error) throw new Error(error.message);
      console.log('[Email] Reminder sent to:', args.recipientEmail);
      return { success: true, id: data?.id };
    } catch (err) {
      console.error('[Email] Failed to send reminder:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});

// Send completion notification to sender
export const sendSignedNotification = action({
  args: {
    senderEmail: v.string(),
    senderName: v.string(),
    recipientName: v.string(),
    documentName: v.string(),
    signedAt: v.string(),
    downloadUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.senderEmail,
        subject: `✅ "${args.documentName}" has been signed by ${args.recipientName}`,
        html: signatureCompletedEmail({
          senderName: args.senderName,
          recipientName: args.recipientName,
          documentName: args.documentName,
          signedAt: new Date(args.signedAt).toLocaleString(),
          downloadUrl: args.downloadUrl,
        }),
      });

      if (error) throw new Error(error.message);
      console.log('[Email] Signed notification sent to:', args.senderEmail);
      return { success: true, id: data?.id };
    } catch (err) {
      console.error('[Email] Failed to send notification:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});

// Send declined notification to sender
export const sendDeclinedNotification = action({
  args: {
    senderEmail: v.string(),
    senderName: v.string(),
    recipientName: v.string(),
    documentName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: args.senderEmail,
        subject: `❌ "${args.documentName}" was declined by ${args.recipientName}`,
        html: signatureDeclinedEmail({
          senderName: args.senderName,
          recipientName: args.recipientName,
          documentName: args.documentName,
        }),
      });

      if (error) throw new Error(error.message);
      console.log('[Email] Declined notification sent to:', args.senderEmail);
      return { success: true, id: data?.id };
    } catch (err) {
      console.error('[Email] Failed to send notification:', err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});

// Internal action for scheduling reminders (called by scheduler)
export const sendScheduledReminder = internalAction({
  args: {
    requestId: v.id("signatureRequests"),
  },
  handler: async (ctx, args) => {
    // This will be called by the scheduler to send reminders
    // The actual implementation would fetch the request and send the reminder
    console.log('[Email] Scheduled reminder for request:', args.requestId);
    return { success: true };
  },
});

// Legacy sendInvite for backward compatibility
export const sendInvite = action({
    args: {
        email: v.string(),
        documentName: v.string(),
        inviterName: v.string(),
    },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.log('Resend API Key missing, skipping email send.');
            return { success: false, error: 'Configuration missing' };
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: args.email,
                subject: `${args.inviterName} invited you to sign ${args.documentName}`,
                html: signatureRequestEmail({
                    recipientName: args.email.split('@')[0],
                    senderName: args.inviterName,
                    documentName: args.documentName,
                    signingUrl: '#', // Placeholder - would need actual URL
                }),
            });

            if (error) throw new Error(error.message);
            return { success: true, data };
        } catch (err: unknown) {
            console.error('Email sending failed:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    },
});
