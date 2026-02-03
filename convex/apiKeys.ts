
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkRateLimit } from "./rateLimit";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("apiKeys")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect()
            .then((keys) => keys.map((k) => ({
                _id: k._id,
                name: k.name,
                last4: k.last4,
                createdAt: k.createdAt,
            })));
    },
});

export const create = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Rate Limit Check (5 keys / min)
        await checkRateLimit(ctx, "apiKeys", identity.subject, 5);

        const unhashedKey = `sk_live_${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;

        // Hash the key
        const encoder = new TextEncoder();
        const data = encoder.encode(unhashedKey);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const last4 = unhashedKey.slice(-4);

        const id = await ctx.db.insert("apiKeys", {
            userId: identity.subject,
            name: args.name,
            hashedKey: hashedKey,
            last4: last4,
            createdAt: new Date().toISOString(),
        });

        return { id, key: unhashedKey };
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
