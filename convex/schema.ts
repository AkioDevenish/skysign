
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    signatures: defineTable({
        userId: v.string(), // Clerk user ID
        name: v.string(),
        dataUrl: v.optional(v.string()), // Deprecated but kept for backward compatibility
        storageId: v.optional(v.id("_storage")), // New field for file storage
        auditStorageId: v.optional(v.id("_storage")), // For the generated Audit Trail PDF
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
        hashedKey: v.string(), // SHA-256 hash
        last4: v.string(), // Last 4 chars for identification
        createdAt: v.string(),
        lastUsed: v.optional(v.string()),
    }).index("by_user", ["userId"])
      .index("by_hashed_key", ["hashedKey"]),

    userSettings: defineTable({
        userId: v.string(),
        autoSave: v.boolean(),
        defaultFormat: v.string(), // 'png', 'svg', 'pdf'
        darkMode: v.optional(v.boolean()),
        // Google Drive integration
        googleAccessToken: v.optional(v.string()),
        googleRefreshToken: v.optional(v.string()),
        googleTokenExpiry: v.optional(v.string()),
        googleEmail: v.optional(v.string()),
        googleConnectedAt: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    newsletter: defineTable({
        email: v.string(),
        subscribedAt: v.string(),
        active: v.boolean(),
    }).index("by_email", ["email"]),

    // Signature Requests - for sending documents to others for signing
    signatureRequests: defineTable({
        senderId: v.string(),                           // Clerk user ID of sender
        // Deprecated fields (kept for backward compatibility with single-signer data)
        recipientEmail: v.optional(v.string()),
        recipientName: v.optional(v.string()),
        
        documentStorageId: v.id("_storage"),            // Original PDF
        documentName: v.string(),
        status: v.string(),                             // 'pending' | 'in_progress' | 'completed' | 'declined' | 'expired'
        message: v.optional(v.string()),                // Optional message to signer
        expiresAt: v.optional(v.string()),              // ISO date string
        signedAt: v.optional(v.string()),               // When ALL signers finished
        signedStorageId: v.optional(v.id("_storage")),  // Final Signed PDF
        signatureStorageId: v.optional(v.id("_storage")), // Deprecated: Use requestSigners table
        accessToken: v.string(),                        // Deprecated: Top-level token or View-only token
        createdAt: v.string(),
        reminderSentAt: v.optional(v.string()),
        auditCertificateStorageId: v.optional(v.id("_storage")), // PDF Certificate of Completion
    }).index("by_sender", ["senderId"])
      .index("by_token", ["accessToken"])
      .index("by_status", ["status"])
      .index("by_recipient", ["recipientEmail"]),

    requestSigners: defineTable({
        requestId: v.id("signatureRequests"),
        email: v.string(),
        name: v.optional(v.string()),
        order: v.number(),              // 1 (first), 2 (second), etc.
        status: v.string(),             // 'pending', 'sent', 'viewed', 'signed', 'declined'
        accessToken: v.string(),        // Unique token for this signer
        signedAt: v.optional(v.string()),
        signatureStorageId: v.optional(v.id("_storage")),
    }).index("by_request", ["requestId"])
      .index("by_token", ["accessToken"])
      .index("by_email", ["email"]),
});
