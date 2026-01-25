
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

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

export const addMember = mutation({
    args: {
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Check limits (e.g. max 10 for pro plus) - this logic ideally checks plan properly
        // For now we assume the frontend checked the "Pro Plus" gate, backend check is good too
        const currentMembers = await ctx.db
            .query("teamMembers")
            .withIndex("by_owner", (q) => q.eq("ownerUserId", identity.subject))
            .collect();

        if (currentMembers.length >= 10) {
            throw new Error("Team limit reached (10 members).");
        }

        const memberId = await ctx.db.insert("teamMembers", {
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
            teamName: "Sky Sign Team", // Placeholder or fetch actual team name if exists
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
