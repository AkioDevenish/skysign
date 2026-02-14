import { NextResponse } from 'next/server';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;


/**
 * Hash an API key using SHA-256 to match against stored hashed keys.
 * This mirrors the hashing logic in convex/apiKeys.ts.
 */
async function hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate the API key from the Authorization header.
 * Returns the userId associated with the key, or null if invalid.
 */
async function authenticateApiKey(
    request: Request
): Promise<{ userId: string } | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const apiKey = authHeader.slice(7); // Remove "Bearer " prefix
    if (!apiKey || !apiKey.startsWith('sk_live_')) {
        return null;
    }

    const hashedKey = await hashApiKey(apiKey);

    // Query Convex for the matching API key using the by_hashed_key index
    try {
        const response = await fetch(
            `${CONVEX_URL}/api/query`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: 'apiKeys:getByHashedKey',
                    args: { hashedKey },
                }),
            }
        );

        if (!response.ok) return null;

        const result = await response.json();
        if (result.value) {
            return { userId: result.value.userId };
        }
    } catch {
        // Fall through to null
    }

    return null;
}

/**
 * GET /api/v1/signatures
 * List all signatures for the authenticated user.
 *
 * Headers:
 *   Authorization: Bearer sk_live_xxxxx
 *
 * Query params:
 *   limit (optional): Max number of results (default: 50, max: 100)
 *
 * Response: { signatures: [...], total: number }
 */
export async function GET(request: Request) {
    try {
        const auth = await authenticateApiKey(request);
        if (!auth) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message:
                        'Valid API key required. Pass via Authorization: Bearer sk_live_xxxxx',
                },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(
            parseInt(searchParams.get('limit') || '50', 10),
            100
        );

        const response = await fetch(
            `${CONVEX_URL}/api/query`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: 'signatures:listByUser',
                    args: { userId: auth.userId, limit },
                }),
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch signatures' },
                { status: 502 }
            );
        }

        const result = await response.json();
        const signatures = (result.value || []).map(
            (sig: Record<string, unknown>) => ({
                id: sig._id,
                name: sig.name,
                style: sig.style || null,
                createdAt: sig.createdAt,
                updatedAt: sig.updatedAt,
            })
        );

        return NextResponse.json({
            signatures,
            total: signatures.length,
            limit,
        });
    } catch (error) {
        console.error('[API v1] GET /signatures error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/signatures
 * Create a new signature via the public API.
 *
 * Headers:
 *   Authorization: Bearer sk_live_xxxxx
 *   Content-Type: application/json
 *
 * Body:
 *   { name: string, dataUrl: string, style?: string }
 *
 * Response: { id: string, name: string, createdAt: string }
 */
export async function POST(request: Request) {
    try {
        const auth = await authenticateApiKey(request);
        if (!auth) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message:
                        'Valid API key required. Pass via Authorization: Bearer sk_live_xxxxx',
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, dataUrl, style } = body;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Validation error', message: '"name" is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        if (
            !dataUrl ||
            typeof dataUrl !== 'string' ||
            !dataUrl.startsWith('data:image/')
        ) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    message:
                        '"dataUrl" is required and must be a valid base64 image data URL (data:image/...)',
                },
                { status: 400 }
            );
        }

        if (name.length > 100) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    message: '"name" must be 100 characters or fewer',
                },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const response = await fetch(
            `${CONVEX_URL}/api/mutation`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: 'signatures:createViaApi',
                    args: {
                        userId: auth.userId,
                        name: name.trim(),
                        dataUrl,
                        style: style || undefined,
                        createdAt: now,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[API v1] Convex mutation error:', errBody);
            return NextResponse.json(
                { error: 'Failed to create signature' },
                { status: 502 }
            );
        }

        const result = await response.json();

        return NextResponse.json(
            {
                id: result.value,
                name: name.trim(),
                createdAt: now,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('[API v1] POST /signatures error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
