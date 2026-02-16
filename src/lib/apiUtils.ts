/**
 * Sanitize user input for safe HTML embedding in email templates.
 * Escapes characters that could be used for HTML injection / XSS.
 */
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Validate an email address using a basic RFC 5322 pattern.
 * More robust than a simple `includes('@')` check.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP within a sliding time window.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
 *   // In your route handler:
 *   if (!limiter.check(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */
export function createRateLimiter({
    windowMs,
    maxRequests,
}: {
    windowMs: number;
    maxRequests: number;
}) {
    const hits = new Map<string, { count: number; resetAt: number }>();

    return {
        /**
         * Returns true if the request is allowed, false if rate-limited.
         */
        check(identifier: string): boolean {
            const now = Date.now();
            const entry = hits.get(identifier);

            if (!entry || now > entry.resetAt) {
                hits.set(identifier, { count: 1, resetAt: now + windowMs });
                return true;
            }

            if (entry.count >= maxRequests) {
                return false;
            }

            entry.count++;
            return true;
        },
    };
}
