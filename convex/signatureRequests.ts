import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS } from "./config";
import { api } from "./_generated/api";

// Generate a secure random token for signing links
function generateAccessToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Create a new signature request
export const create = mutation({
    args: {
        recipientEmail: v.string(),
        recipientName: v.optional(v.string()),
        documentStorageId: v.id("_storage"),
        documentName: v.string(),
        message: v.optional(v.string()),
        expiresInDays: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const accessToken = generateAccessToken();
        const now = new Date();
        
        // Calculate expiration (default 30 days)
        const expiresAt = args.expiresInDays 
            ? new Date(now.getTime() + args.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const requestId = await ctx.db.insert("signatureRequests", {
            senderId: identity.subject,
            recipientEmail: args.recipientEmail,
            recipientName: args.recipientName,
            documentStorageId: args.documentStorageId,
            documentName: args.documentName,
            status: "pending",
            message: args.message,
            expiresAt,
            accessToken,
            createdAt: now.toISOString(),
        });

        // Log audit trail
        await ctx.db.insert("auditTrail", {
            userId: identity.subject,
            action: "signature_request_created",
            signatureName: args.documentName,
            timestamp: now.toISOString(),
            userAgent: "Server/Convex",
            metadata: {
                recipientEmail: args.recipientEmail,
                requestId: requestId,
            },
        });

        // Schedule email notification to recipient
        await ctx.scheduler.runAfter(0, api.email.sendSignatureRequest, {
            recipientEmail: args.recipientEmail,
            recipientName: args.recipientName,
            senderName: identity.name || identity.email || 'Someone',
            documentName: args.documentName,
            message: args.message,
            signingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://skysign.io'}/sign/${accessToken}`,
        });

        return { requestId, accessToken };
    },
});

// Get all requests sent by the current user
export const getMySent = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const requests = await ctx.db
            .query("signatureRequests")
            .withIndex("by_sender", (q) => q.eq("senderId", identity.subject))
            .order("desc")
            .collect();

        // Add document URLs
        return Promise.all(requests.map(async (req) => {
            const docUrl = await ctx.storage.getUrl(req.documentStorageId);
            const signedUrl = req.signedStorageId 
                ? await ctx.storage.getUrl(req.signedStorageId)
                : null;
            const auditUrl = req.auditCertificateStorageId
                ? await ctx.storage.getUrl(req.auditCertificateStorageId)
                : null;
            return { ...req, documentUrl: docUrl, signedDocumentUrl: signedUrl, auditCertificateUrl: auditUrl };
        }));
    },
});

// Get a signature request by access token (public - no auth required)
export const getByToken = query({
    args: { accessToken: v.string() },
    handler: async (ctx, args) => {
        const request = await ctx.db
            .query("signatureRequests")
            .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
            .first();

        if (!request) return null;

        // Check if expired
        if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
            return { ...request, status: "expired", documentUrl: null };
        }

        const docUrl = await ctx.storage.getUrl(request.documentStorageId);
        return { ...request, documentUrl: docUrl };
    },
});

// Mark request as viewed (when signer opens the page)
export const markViewed = mutation({
    args: { accessToken: v.string() },
    handler: async (ctx, args) => {
        const request = await ctx.db
            .query("signatureRequests")
            .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
            .first();

        if (!request) throw new Error("Request not found");
        if (request.status === "pending") {
            await ctx.db.patch(request._id, { status: "viewed" });
        }
    },
});

// Submit signature (signer completes signing)
export const submitSignature = mutation({
    args: {
        accessToken: v.string(),
        signedStorageId: v.id("_storage"),
        signatureStorageId: v.optional(v.id("_storage")),
        signerName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db
            .query("signatureRequests")
            .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
            .first();

        if (!request) throw new Error("Request not found");
        if (request.status === "signed") throw new Error("Already signed");
        if (request.status === "declined") throw new Error("Request was declined");
        
        // Check expiration
        if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
            throw new Error("Request has expired");
        }

        const now = new Date().toISOString();

        await ctx.db.patch(request._id, {
            status: "signed",
            signedAt: now,
            signedStorageId: args.signedStorageId,
            signatureStorageId: args.signatureStorageId,
        });

        // Log audit trail
        await ctx.db.insert("auditTrail", {
            userId: request.senderId,
            action: "signature_completed",
            signatureName: request.documentName,
            timestamp: now,
            userAgent: "Signer/Web",
            metadata: {
                recipientEmail: request.recipientEmail,
                signerName: args.signerName || request.recipientName,
            },
        });

        // Schedule email notification to sender
        await ctx.scheduler.runAfter(0, api.email.sendSignedNotification, {
            senderEmail: request.senderId, // Will need user email lookup in production
            senderName: 'You',
            recipientName: args.signerName || request.recipientName || request.recipientEmail,
            documentName: request.documentName,
            signedAt: now,
        });

        // 5. Generate Certificate of Completion
        await ctx.scheduler.runAfter(0, api.certificates.generate, {
            requestId: request._id,
            documentName: request.documentName,
            signerName: args.signerName || request.recipientName || 'Signer',
            signerEmail: request.recipientEmail,
            signedAt: now,
            userAgent: "Signer/Web",
        });

        return { success: true };
    },
});

// Decline signature request
export const decline = mutation({
    args: {
        accessToken: v.string(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db
            .query("signatureRequests")
            .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
            .first();

        if (!request) throw new Error("Request not found");
        if (request.status === "signed") throw new Error("Already signed");

        await ctx.db.patch(request._id, { status: "declined" });

        // Log audit trail
        await ctx.db.insert("auditTrail", {
            userId: request.senderId,
            action: "signature_declined",
            signatureName: request.documentName,
            timestamp: new Date().toISOString(),
            userAgent: "Signer/Web",
            metadata: {
                recipientEmail: request.recipientEmail,
                reason: args.reason,
            },
        });

        // Schedule email notification to sender
        await ctx.scheduler.runAfter(0, api.email.sendDeclinedNotification, {
            senderEmail: request.senderId, // Will need user email lookup in production
            senderName: 'You',
            recipientName: request.recipientName || request.recipientEmail,
            documentName: request.documentName,
        });

        return { success: true };
    },
});

// Get request count (for dashboard stats)
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { pending: 0, signed: 0, total: 0 };

        const requests = await ctx.db
            .query("signatureRequests")
            .withIndex("by_sender", (q) => q.eq("senderId", identity.subject))
            .collect();

        return {
            pending: requests.filter(r => r.status === "pending" || r.status === "viewed").length,
            signed: requests.filter(r => r.status === "signed").length,
            declined: requests.filter(r => r.status === "declined").length,
            total: requests.length,
        };
    },
});

// Delete a request (only sender can delete)
export const remove = mutation({
    args: { id: v.id("signatureRequests") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const request = await ctx.db.get(args.id);
        if (!request || request.senderId !== identity.subject) {
            throw new Error("Request not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

// Internal mutation to save the generated certificate storage ID
export const saveCertificate = internalMutation({
    args: {
        requestId: v.id("signatureRequests"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, {
            auditCertificateStorageId: args.storageId,
        });
    },
});
