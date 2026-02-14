'use node';

import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Type for pending request from the query
type PendingRequest = {
    _id: string;
    recipientEmail: string;
    recipientName?: string;
    documentName: string;
    accessToken: string;
    expiresAt?: string;
    reminderSentAt?: string;
};

// Check pending requests and send reminders
export const checkAndSendReminders = internalAction({
    args: {},
    handler: async (ctx): Promise<{ processed: number }> => {
        // Query all pending/viewed requests that haven't been reminded recently
        const pendingRequests = await ctx.runQuery(internal.reminderQueries.getPendingRequestsForReminder) as PendingRequest[];
        

        for (const request of pendingRequests) {
            // Calculate days remaining
            const expiresAt = request.expiresAt ? new Date(request.expiresAt) : null;
            const now = new Date();
            const daysRemaining = expiresAt 
                ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 30;

            // Only send reminders if 7, 3, or 1 days remaining
            if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
                try {
                    await ctx.runAction(api.email.sendReminder, {
                        recipientEmail: request.recipientEmail,
                        recipientName: request.recipientName,
                        senderName: 'A SkySign User',
                        documentName: request.documentName,
                        signingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://skysign.io'}/sign/${request.accessToken}`,
                        daysRemaining,
                    });

                    // Mark reminder as sent (cast _id to the correct type)
                    await ctx.runMutation(internal.reminderQueries.markReminderSent, {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        requestId: request._id as any,
                    });

                } catch (error) {
                    console.error(`[Reminder] Failed to send reminder for ${request._id}:`, error);
                }
            }
        }

        return { processed: pendingRequests.length };
    },
});
