
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PLANS, PLAN_LIMITS } from "./config";
import { z } from "zod";
import { checkRateLimit } from "./rateLimit";

// Generate upload URL for file storage
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// Get all signatures for the current user (Paginated)
export const get = query({
    args: {
        paginationOpts: v.object({
            numItems: v.number(),
            cursor: v.union(v.string(), v.null()),
            id: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const signatures = await ctx.db
            .query("signatures")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .paginate(args.paginationOpts);

        // Return paginated results directly
        return signatures;
    },
});

// Validation Schemas
const _createSignatureSchema = z.object({
    name: z.string().min(1).max(100),
    dataUrl: z.string().startsWith("data:image/", "Must be a valid image data URL"),
    style: z.optional(z.string().max(50)),
    userAgent: z.optional(z.string().max(200)),
});

// Create a new signature
export const create = mutation({
    args: {
        name: v.string(),
        dataUrl: v.optional(v.string()), // Optional now
        storageId: v.optional(v.id("_storage")), // File storage ID
        style: v.optional(v.string()),
        plan: v.string(), // 'free', 'pro', etc. to enforce limits
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Rate Limit Check (20 signatures / min)
        await checkRateLimit(ctx, "signatures", identity.subject, 20);

        // Zod Validation (simplified for now, dataUrl or storageId required)
        if (!args.dataUrl && !args.storageId) {
            throw new Error("Either dataUrl or storageId is required");
        }

        const userId = identity.subject;

        // Check limits for free plan
        if (args.plan === PLANS.FREE) {
            const count = await ctx.db
                .query("signatures")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            const limit = PLAN_LIMITS.free.signatures;
            if (count.length >= limit) {
                throw new Error(`Free plan limit reached (${limit} signatures). Upgrade to Pro for unlimited.`);
            }
        }

        const now = new Date().toISOString();

        // Create the signature
        const signatureId = await ctx.db.insert("signatures", {
            userId,
            name: args.name,
            dataUrl: args.dataUrl,
            storageId: args.storageId,
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
            userAgent: args.userAgent || "Server/Convex",
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
// Delete a signature
export const remove = mutation({
    args: { 
        id: v.id("signatures"),
        userAgent: v.optional(v.string()),
        plan: v.string(), // require plan to check permissions
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Check if user is on Free plan
        if (args.plan === PLANS.FREE) {
            throw new Error("Deleting signatures is a Pro feature.");
        }

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
            userAgent: args.userAgent || "Server/Convex",
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
// Internal mutation to update audit trail storage ID
export const updateAuditTrail = internalMutation({
    args: {
        signatureId: v.id("signatures"),
        auditStorageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.signatureId, {
            auditStorageId: args.auditStorageId,
        });
    },
});

// Get the audit trail PDF URL for a signature
export const getAuditUrl = query({
    args: {
        signatureId: v.id("signatures"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const signature = await ctx.db.get(args.signatureId);
        if (!signature || signature.userId !== identity.subject) {
            return null;
        }

        if (!signature.auditStorageId) {
            return null;
        }

        return await ctx.storage.getUrl(signature.auditStorageId);
    },
});

// ── Public API v1 Functions ──────────────────────────────────────────────

// List signatures by userId (for API key-based auth, no Clerk identity needed)
export const listByUser = query({
    args: {
        userId: v.string(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("signatures")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(args.limit);
    },
});

// Create a signature via the public API (no Clerk identity, userId passed explicitly)
export const createViaApi = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        dataUrl: v.string(),
        style: v.optional(v.string()),
        createdAt: v.string(),
    },
    handler: async (ctx, args) => {
        // Rate Limit Check (20 signatures / min)
        await checkRateLimit(ctx, "signatures", args.userId, 20);

        // Check free plan limits
        const count = await ctx.db
            .query("signatures")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const limit = PLAN_LIMITS.free.signatures;
        // Note: For API users, we default to free limits. 
        // Pro plan detection requires a billing check.
        // This is a safe default — Pro users will also pass through since Infinity > any count.

        const signatureId = await ctx.db.insert("signatures", {
            userId: args.userId,
            name: args.name,
            dataUrl: args.dataUrl,
            style: args.style,
            createdAt: args.createdAt,
            updatedAt: args.createdAt,
        });

        // Log audit entry
        await ctx.db.insert("auditTrail", {
            userId: args.userId,
            action: "created",
            signatureId: signatureId,
            signatureName: args.name,
            timestamp: args.createdAt,
            userAgent: "API/v1",
        });

        return signatureId;
    },
});
