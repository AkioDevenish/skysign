
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    signatures: defineTable({
        userId: v.string(), // Clerk user ID
        name: v.string(),
        dataUrl: v.string(),
        style: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        createdAt: v.string(), // ISO string
        updatedAt: v.string(), // ISO string
    }).index("by_user", ["userId"]),

    auditTrail: defineTable({
        userId: v.string(),
        action: v.string(), // 'created' | 'exported' | 'deleted' | 'signed' | etc
        signatureId: v.optional(v.string()), // ID of the signature if applicable
        signatureName: v.optional(v.string()),
        timestamp: v.string(),
        userAgent: v.string(),
        ipHash: v.optional(v.string()),
        metadata: v.optional(v.any()), // JSON object
    }).index("by_user", ["userId"]),

    teamMembers: defineTable({
        ownerUserId: v.string(), // The pro user who owns the team
        name: v.string(),
        email: v.string(),
        role: v.string(), // 'member' | 'admin'
        joinedAt: v.string(),
        status: v.string(), // 'active' | 'pending'
    }).index("by_owner", ["ownerUserId"]),

    apiKeys: defineTable({
        userId: v.string(),
        name: v.string(),
        key: v.string(), // Hashed or raw? For now likely raw as per existing simple impl
        createdAt: v.string(),
        lastUsed: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    userSettings: defineTable({
        userId: v.string(),
        autoSave: v.boolean(),
        defaultFormat: v.string(), // 'png', 'svg', 'pdf'
        darkMode: v.optional(v.boolean()),
    }).index("by_user", ["userId"]),

    newsletter: defineTable({
        email: v.string(),
        subscribedAt: v.string(),
        active: v.boolean(),
    }).index("by_email", ["email"]),
});
