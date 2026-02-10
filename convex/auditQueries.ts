import { query } from "./_generated/server";

// Get all audit entries for the current user
export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const entries = await ctx.db
            .query("auditTrail")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(100);

        return entries;
    },
});
