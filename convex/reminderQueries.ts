import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get pending requests that need reminders
export const getPendingRequestsForReminder = internalQuery({
    args: {},
    handler: async (ctx) => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        // Get all pending/viewed requests
        const requests = await ctx.db
            .query("signatureRequests")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        const viewedRequests = await ctx.db
            .query("signatureRequests")
            .withIndex("by_status", (q) => q.eq("status", "viewed"))
            .collect();

        const allPending = [...requests, ...viewedRequests];

        // Filter out recently reminded ones
        return allPending.filter(req => {
            if (!req.reminderSentAt) return true;
            return req.reminderSentAt < oneDayAgo;
        });
    },
});

// Mark a request as having been reminded
export const markReminderSent = internalMutation({
    args: { requestId: v.id("signatureRequests") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, {
            reminderSentAt: new Date().toISOString(),
        });
    },
});
