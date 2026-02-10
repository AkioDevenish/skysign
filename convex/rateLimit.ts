import { MutationCtx } from "./_generated/server";

/**
 * Checks if a user has exceeded a rate limit for a specific action.
 * Counts documents in a table created by the user within a time window.
 * 
 * @param ctx Mutation Context
 * @param tableName Table to check (e.g. "signatures")
 * @param userId User ID to check
 * @param limit Max allowed items
 * @param windowMs Time window in milliseconds (default 1 minute)
 */
export async function checkRateLimit(
    ctx: MutationCtx,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tableName: "signatures" | "auditTrail" | "apiKeys",
    userId: string,
    limit: number = 10,
    windowMs: number = 60 * 1000
) {
    const now = Date.now();
    const windowStart = new Date(now - windowMs).toISOString();

    // Query mostly recent items
    // This assumes the table has a standard schema with "userId" and "createdAt"
    // and an index "by_user" on "userId"
    const recentItems = await ctx.db
        .query(tableName)
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.gt(q.field("createdAt"), windowStart))
        .take(limit + 1);

    if (recentItems.length > limit) {
        throw new Error(`Rate limit exceeded. Please wait a moment before trying again.`);
    }
}

