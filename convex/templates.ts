
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        category: v.string(),
        content: v.string(),
        fields: v.any(),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const templateId = await ctx.db.insert("customTemplates", {
            userId: identity.subject,
            name: args.name,
            description: args.description,
            category: args.category,
            content: args.content,
            fields: args.fields,
            isPublic: args.isPublic ?? false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return templateId;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const templates = await ctx.db
            .query("customTemplates")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .collect();

        return templates;
    },
});

export const update = mutation({
    args: {
        id: v.id("customTemplates"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        content: v.optional(v.string()),
        fields: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const template = await ctx.db.get(args.id);
        if (!template || template.userId !== identity.subject) {
            throw new Error("Template not found or unauthorized");
        }

        const { id, ...fields } = args;
        await ctx.db.patch(id, {
            ...fields,
            updatedAt: new Date().toISOString(),
        });
    },
});

export const deleteTemplate = mutation({
    args: { id: v.id("customTemplates") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const template = await ctx.db.get(args.id);
        if (!template || template.userId !== identity.subject) {
            throw new Error("Template not found or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
