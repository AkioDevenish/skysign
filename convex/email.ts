
'use node';

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from 'resend';

export const sendInvite = action({
    args: {
        email: v.string(),
        documentName: v.string(),
        inviterName: v.string(),
    },
    handler: async (ctx, args) => {
        // Only proceed if API key exists
        if (!process.env.RESEND_API_KEY) {
            console.log('Resend API Key missing, skipping email send.');
            return { success: false, error: 'Configuration missing' };
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
            const { data, error } = await resend.emails.send({
                from: 'Sky Sign <onboarding@resend.dev>', // Default testing domain
                to: args.email,
                subject: `${args.inviterName} invited you to sign ${args.documentName}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to sign a document</h2>
            <p><strong>${args.inviterName}</strong> has requested your signature on <strong>${args.documentName}</strong>.</p>
            <div style="margin: 30px 0;">
              <a href="#" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: bold;">Review and Sign</a>
            </div>
            <p style="color: #666; font-size: 12px;">Powered by Sky Sign</p>
          </div>
        `,
            });

            if (error) {
                throw new Error(error.message);
            }

            return { success: true, data };
        } catch (err: unknown) {
            console.error('Email sending failed:', err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    },
});
