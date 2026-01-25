
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("apiKeys")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});

export const create = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const key = `sk_live_${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;

        const id = await ctx.db.insert("apiKeys", {
            userId: identity.subject,
            name: args.name,
            key: key,
            createdAt: new Date().toISOString(),
        });

        return { id, key };
    },
});

export const remove = mutation({
    args: { id: v.id("apiKeys") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== identity.subject) {
            throw new Error("Key not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
