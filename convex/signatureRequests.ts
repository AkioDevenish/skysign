import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_LIMITS } from "./config";
import { api, internal } from "./_generated/api";

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
        recipientEmail: v.optional(v.string()), // Deprecated / fallback
        recipientName: v.optional(v.string()),  // Deprecated / fallback
        signers: v.optional(v.array(v.object({
            email: v.string(),
            name: v.optional(v.string()),
        }))),
        documentStorageId: v.id("_storage"),
        documentName: v.string(),
        message: v.optional(v.string()),
        expiresInDays: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Normalize signers
        let signersList = args.signers || [];
        if (signersList.length === 0 && args.recipientEmail) {
            signersList.push({ 
                email: args.recipientEmail, 
                name: args.recipientName 
            });
        }
        if (signersList.length === 0) throw new Error("At least one signer required");

        const now = new Date();
        // Calculate expiration (default 30 days)
        const expiresAt = args.expiresInDays 
            ? new Date(now.getTime() + args.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Check plan limits (optional - skipped for now)

        // Generate tokens for all signers
        const signersWithTokens = signersList.map((signer, index) => ({
            ...signer,
            token: generateAccessToken(),
            order: index + 1,
        }));

        const firstSigner = signersWithTokens[0];

        // Create the main request request
        const requestId = await ctx.db.insert("signatureRequests", {
            senderId: identity.subject,
            recipientEmail: firstSigner.email, // Backward compat
            recipientName: firstSigner.name,   // Backward compat
            documentStorageId: args.documentStorageId,
            documentName: args.documentName,
            status: "pending", // OR "in_progress"
            message: args.message,
            expiresAt,
            accessToken: firstSigner.token, // Backward compat: Signer 1 token
            createdAt: now.toISOString(),
        });

        // Create requestSigners records
        for (const signer of signersWithTokens) {
            await ctx.db.insert("requestSigners", {
                requestId,
                email: signer.email,
                name: signer.name,
                order: signer.order,
                status: signer.order === 1 ? "sent" : "pending",
                accessToken: signer.token,
            });
        }

        // Log audit trail
        await ctx.db.insert("auditTrail", {
            userId: identity.subject,
            action: "signature_request_created",
            signatureName: args.documentName,
            timestamp: now.toISOString(),
            userAgent: "Server/Convex",
            metadata: {
                recipientEmail: signersList.map(s => s.email).join(", "),
                requestId: requestId,
                signerCount: signersList.length,
            },
        });

        // Send email to the FIRST signer
        await ctx.scheduler.runAfter(0, api.email.sendSignatureRequest, {
            recipientEmail: firstSigner.email,
            recipientName: firstSigner.name,
            senderName: identity.name || identity.email || 'Someone',
            documentName: args.documentName,
            message: args.message,
            signingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://skysign.io'}/sign/${firstSigner.token}`,
        });

        return { requestId, accessToken: firstSigner.token };
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
// Get a signature request by access token (public - no auth required)
export const getByToken = query({
    args: { accessToken: v.string() },
    handler: async (ctx, args) => {
        // 1. Try finding in requestSigners (Multi-party)
        const signer = await ctx.db
            .query("requestSigners")
            .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
            .first();

        let request;
        let currentSigner = signer;

        if (signer) {
            request = await ctx.db.get(signer.requestId);
            if (!request) return null;

            // Enforce Order logic
            // If order > 1, check if previous signer is signed
            if (signer.order > 1) {
                const previousSigner = await ctx.db
                    .query("requestSigners")
                    .withIndex("by_request", (q) => q.eq("requestId", signer.requestId))
                    .filter((q) => q.eq(q.field("order"), signer.order - 1))
                    .first(); // Use filter or separate index. Better to query all?
                
                // Optimization: Just query all signers for this request to check status
                const allSigners = await ctx.db
                    .query("requestSigners")
                    .withIndex("by_request", (q) => q.eq("requestId", signer.requestId))
                    .collect();
                
                const prev = allSigners.find(s => s.order === signer.order - 1);
                if (prev && prev.status !== "signed") {
                    // Previous signer hasn't signed yet!
                    // Return specific error or specific status?
                    // For now, return null or a specific "wait_your_turn" status?
                    // Let's just return the request but frontend might show "Pending".
                    // But if we return it, they can sign.
                    // We must BLOCK signing in submitSignature.
                    // Here, we can perhaps add a flag.
                }
            }
        } else {
            // 2. Fallback: Try finding in signatureRequests (Legacy / Signer 1)
            request = await ctx.db
                .query("signatureRequests")
                .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
                .first();
            
            if (!request) return null;
            
            // Mock a signer object for legacy
            currentSigner = {
                _id: "legacy" as any,
                _creationTime: 0,
                requestId: request._id,
                email: request.recipientEmail!,
                name: request.recipientName,
                order: 1,
                status: request.status === "signed" ? "signed" : "pending",
                accessToken: args.accessToken,
            };
        }

        if (!request) return null;

        // Check overall expiration
        if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
            return { ...request, status: "expired", documentUrl: null };
        }

        // Return valid document URL (prefer signed version for sequential signing)
        const storageId = request.signedStorageId || request.documentStorageId;
        const docUrl = await ctx.storage.getUrl(storageId);
        
        // Return request with OVERRIDDEN recipient details for the current signer
        return { 
            ...request, 
            documentUrl: docUrl,
            // Override with current signer's info
            recipientName: currentSigner?.name,
            recipientEmail: currentSigner?.email,
            // Add extra context if needed
            signerOrder: currentSigner?.order,
            signerStatus: currentSigner?.status,
        };
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
// Submit signature (signer provides signature image)
export const submitSignature = mutation({
    args: {
        accessToken: v.string(),
        signedStorageId: v.id("_storage"), // Currently this is the signature PNG from frontend
        signatureStorageId: v.optional(v.id("_storage")), // Also the PNG
        signerName: v.optional(v.string()), // Optional typed name
    },
    handler: async (ctx, args) => {
        // 1. Identify Signer
        const signer = await ctx.db
            .query("requestSigners")
            .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
            .first();

        // Check Legacy / Request directly if no signer record found
        let request;
        let currentSigner = signer;

        if (signer) {
            request = await ctx.db.get(signer.requestId);
            if (!request) throw new Error("Request not found");
            if (signer.status === 'signed') throw new Error("Already signed");
        } else {
            // Legacy / Single Signer fallback
            request = await ctx.db
                .query("signatureRequests")
                .withIndex("by_token", (q) => q.eq("accessToken", args.accessToken))
                .first();
            
            if (!request) throw new Error("Request not found");
            
            // Mock legacy signer for consistent handling
            currentSigner = {
                _id: "legacy" as any,
                requestId: request._id,
                email: request.recipientEmail!,
                name: request.recipientName,
                order: 1,
                accessToken: args.accessToken,
                status: request.status,
                _creationTime: 0,
            };
        }

        if (request.status === "signed") throw new Error("Already signed");
        if (request.status === "declined") throw new Error("Request was declined");
        if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
            throw new Error("Request has expired");
        }

        const now = new Date().toISOString();

        // 2. Mark Signer as "signed" to prevent double submission
        if (signer) {
            await ctx.db.patch(signer._id, {
                status: 'signed',
                signedAt: now,
                signatureStorageId: args.signatureStorageId, // Save the PNG reference
            });
        }
        // For legacy, we update the main request later in finalizeSignature?
        // Actually, let's update status now to block double-clicks.
        if (!signer) {
             await ctx.db.patch(request._id, {
                status: 'in_progress', // Temporary status? Or keep pending until finalize?
                // Legacy didn't have detailed status. We'll rely on finalizeSignature for final update.
             });
        }

        // 3. Trigger Async PDF Embedding
        // We pass the Current PDF (or signedStorageId if exists) + Signature Image
        // If sequential, use the latest signedStorageId.
        const currentPdfId = request.signedStorageId || request.documentStorageId;

        await ctx.scheduler.runAfter(0, api.documents.embedSignature, {
            requestId: request._id,
            documentStorageId: currentPdfId,
            signatureStorageId: args.signatureStorageId || args.signedStorageId, // Frontend passes PNG as signedStorageId currently? Use carefully.
            signerName: args.signerName || currentSigner?.name || 'Signer',
            signerEmail: currentSigner?.email || '',
        });

        return { success: true, message: "Signature received, processing document..." };
    },
});

// Finalize Signature (Internal - called after PDF generation)
export const finalizeSignature = internalMutation({
    args: {
        requestId: v.id("signatureRequests"),
        signedStorageId: v.id("_storage"), // The NEW PDF with signature
    },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");

        const now = new Date().toISOString();

        // 1. Update Request with New PDF
        await ctx.db.patch(request._id, {
            signedStorageId: args.signedStorageId,
            status: "in_progress", // Ensure it's active
        });

        // 2. Check for Next Signer (Multi-party logic)
        const allSigners = await ctx.db
            .query("requestSigners")
            .withIndex("by_request", (q) => q.eq("requestId", request._id))
            .collect();
        
        // Sort
        allSigners.sort((a, b) => a.order - b.order);

        const pendingSigners = allSigners.filter(s => s.status !== 'signed');
        
        if (pendingSigners.length === 0) {
            // ALL SIGNED (or Legacy Single Signer completed)
            await ctx.db.patch(request._id, {
                status: "signed",
                signedAt: now,
            });

            // Audit Log
            await ctx.db.insert("auditTrail", {
                userId: request.senderId,
                action: "signature_completed",
                signatureName: request.documentName,
                timestamp: now,
                userAgent: "Server/Convex",
                metadata: {
                    requestId: request._id,
                    status: "Completed",
                },
            });

            // Generate Certificate
            await ctx.scheduler.runAfter(0, api.certificates.generate, {
                requestId: request._id,
                documentName: request.documentName,
                signerName: 'Multiple Signers', // Summary
                signerEmail: '',
                signedAt: now,
                userAgent: "Server/Convex",
            });
            
            // Notify Sender
            await ctx.scheduler.runAfter(0, api.email.sendSignedNotification, {
                senderEmail: request.senderId,
                senderName: 'You',
                recipientName: "All Signers",
                documentName: request.documentName,
                signedAt: now,
            });

        } else {
            // NEXT SIGNER
            // The previous signer (who just signed) is effectively done.
            // We need to notify the FIRST pending signer.
            const nextSigner = pendingSigners[0];
            
            // Check if we already sent to them? (Might be retry)
            // If status is 'pending', send email.
            if (nextSigner.status === 'pending') {
                await ctx.db.patch(nextSigner._id, { status: 'sent' });
                
                await ctx.scheduler.runAfter(0, api.email.sendSignatureRequest, {
                    recipientEmail: nextSigner.email,
                    recipientName: nextSigner.name,
                    senderName: 'Signer (via SkySign)',
                    documentName: request.documentName,
                    message: request.message,
                    signingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://skysign.io'}/sign/${nextSigner.accessToken}`,
                });
            }
        }
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
            recipientName: request.recipientName || request.recipientEmail || 'Unknown',
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
