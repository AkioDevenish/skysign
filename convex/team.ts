
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { z } from "zod";
import { PLAN_LIMITS } from "./config";

export const getMembers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("teamMembers")
            .withIndex("by_owner", (q) => q.eq("ownerUserId", identity.subject))
            .collect();
    },
});

// Define validation schema
const addMemberSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
});

export const addMember = mutation({
    args: {
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Zod Validation
        const validation = addMemberSchema.safeParse(args);
        if (!validation.success) {
            throw new Error(validation.error.issues[0].message);
        }

        // Check limits
        const currentMembers = await ctx.db
            .query("teamMembers")
            .withIndex("by_owner", (q) => q.eq("ownerUserId", identity.subject))
            .collect();

        const limit = PLAN_LIMITS.proplus.teamMembers;
        if (currentMembers.length >= limit) {
            throw new Error(`Team limit reached (${limit} members).`);
        }

        const _memberId = await ctx.db.insert("teamMembers", {
            ownerUserId: identity.subject,
            name: args.name,
            email: args.email,
            role: 'member',
            joinedAt: new Date().toISOString(),
            status: 'pending',
        });

        // Schedule email invite
        await ctx.scheduler.runAfter(0, internal.actions.sendTeamInvite, {
            email: args.email,
            teamName: "Sky Sign Team",
            inviterName: identity.name || "A team member",
        });
    },
});

export const removeMember = mutation({
    args: { id: v.id("teamMembers") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.ownerUserId !== identity.subject) {
            throw new Error("Member not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
