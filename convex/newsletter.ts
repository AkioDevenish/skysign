
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // Check if already subscribed
        const existing = await ctx.db
            .query("newsletter")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) return; // Idempotent

        await ctx.db.insert("newsletter", {
            email: args.email,
            subscribedAt: new Date().toISOString(),
            active: true,
        });
    },
});
