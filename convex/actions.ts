"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendTeamInvite = action({
    args: {
        email: v.string(),
        teamName: v.string(),
        inviterName: v.string(),
    },
    handler: async (ctx, args) => {
        // If no key is set, log a warning but don't fail, to avoid breaking the UI for users without keys
        if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not set. Skipping email send.");
            return { success: false, error: "Configuration missing" };
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
            const { data, error } = await resend.emails.send({
                from: "Sky Sign <onboarding@resend.dev>", // Default Resend test domain or verified domain
                to: [args.email],
                subject: `Join ${args.teamName} on Sky Sign`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #1c1917;">You've been invited!</h1>
                        <p style="color: #57534e; font-size: 16px; line-height: 1.5;">
                            <strong>${args.inviterName}</strong> has invited you to join their team <strong>"${args.teamName}"</strong> on Sky Sign.
                        </p>
                        <div style="margin-top: 32px;">
                            <a href="http://localhost:3000" style="background-color: #1c1917; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Accept Invitation
                            </a>
                        </div>
                        <p style="color: #a8a29e; font-size: 14px; margin-top: 32px;">
                            If you didn't expect this, you can ignore this email.
                        </p>
                    </div>
                `,
            });

            if (error) {
                console.error("Resend error:", error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (err: unknown) {
            console.error("Failed to send email:", err);
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    },
});
