
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all signatures for the current user
export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("signatures")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();
    },
});

// Create a new signature
export const create = mutation({
    args: {
        name: v.string(),
        dataUrl: v.string(),
        style: v.optional(v.string()),
        plan: v.string(), // 'free', 'pro', etc. to enforce limits
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        // Check limits for free plan
        if (args.plan === "free") {
            const count = await ctx.db
                .query("signatures")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            if (count.length >= 5) {
                throw new Error("Free plan limit reached (5 signatures). Upgrade to Pro for unlimited.");
            }
        }

        const now = new Date().toISOString();

        // Create the signature
        const signatureId = await ctx.db.insert("signatures", {
            userId,
            name: args.name,
            dataUrl: args.dataUrl,
            style: args.style,
            createdAt: now,
            updatedAt: now,
        });

        // Automatically log audit entry (internal logic inside mutation for consistency)
        await ctx.db.insert("auditTrail", {
            userId,
            action: "created",
            signatureId: signatureId,
            signatureName: args.name,
            timestamp: now,
            userAgent: "Server/Convex", // Can't easily get client UA here safely without passing it
        });

        return signatureId;
    },
});

// Update a signature
export const update = mutation({
    args: {
        id: v.id("signatures"),
        name: v.optional(v.string()),
        style: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Verify ownership
        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== identity.subject) {
            throw new Error("Signature not found or unauthorized");
        }

        await ctx.db.patch(args.id, {
            ...(args.name && { name: args.name }),
            ...(args.style && { style: args.style }),
            updatedAt: new Date().toISOString(),
        });
    },
});

// Delete a signature
export const remove = mutation({
    args: { id: v.id("signatures") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== identity.subject) {
            throw new Error("Signature not found or unauthorized");
        }

        await ctx.db.delete(args.id);

        // Log audit
        await ctx.db.insert("auditTrail", {
            userId: identity.subject,
            action: "deleted",
            signatureId: args.id,
            signatureName: existing.name,
            timestamp: new Date().toISOString(),
            userAgent: "Server/Convex",
        });
    },
});

// Get signature count (for subscription checks)
export const getCount = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const results = await ctx.db
            .query("signatures")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();

        return results.length;
    }
});
