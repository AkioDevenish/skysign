
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user settings, or return default
export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { autoSave: false, defaultFormat: 'png', darkMode: false };

        const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        return settings || { autoSave: false, defaultFormat: 'png', darkMode: false };
    },
});

// Update user settings
export const update = mutation({
    args: {
        autoSave: v.optional(v.boolean()),
        defaultFormat: v.optional(v.string()),
        darkMode: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("userSettings")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...(args.autoSave !== undefined && { autoSave: args.autoSave }),
                ...(args.defaultFormat !== undefined && { defaultFormat: args.defaultFormat }),
                ...(args.darkMode !== undefined && { darkMode: args.darkMode }),
            });
        } else {
            await ctx.db.insert("userSettings", {
                userId: identity.subject,
                autoSave: args.autoSave ?? false,
                defaultFormat: args.defaultFormat ?? 'png',
                darkMode: args.darkMode ?? false,
            });
        }
    },
});


