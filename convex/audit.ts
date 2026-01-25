
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("auditTrail")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc") // Newest first
            .take(100); // Limit to last 100 for performance
    },
});

export const log = mutation({
    args: {
        action: v.string(),
        signatureId: v.optional(v.string()),
        signatureName: v.optional(v.string()),
        metadata: v.optional(v.any()),
        userAgent: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        await ctx.db.insert("auditTrail", {
            userId: identity.subject,
            action: args.action,
            signatureId: args.signatureId,
            signatureName: args.signatureName,
            timestamp: new Date().toISOString(),
            userAgent: args.userAgent,
            metadata: args.metadata,
        });
    },
});
