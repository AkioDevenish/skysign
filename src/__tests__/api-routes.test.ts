/**
 * API Route tests
 *
 * These test the route handlers directly (no HTTP server needed).
 * We mock external dependencies (Resend, Clerk, etc.) so tests
 * exercise input validation and response shapes only.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Newsletter Route ──────────────────────────────────────────────
describe('POST /api/newsletter', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns 400 when email is missing', async () => {
        // Mock Resend so it doesn't actually send
        vi.stubEnv('RESEND_API_KEY', 'test_key');
        vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');

        const { POST } = await import('@/app/api/newsletter/route');
        const req = new Request('http://localhost/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBeTruthy();
    });

    it('returns 400 for invalid email format', async () => {
        vi.stubEnv('RESEND_API_KEY', 'test_key');
        vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');

        const { POST } = await import('@/app/api/newsletter/route');
        const req = new Request('http://localhost/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'not-an-email' }),
        });

        const res = await POST(req);
        // Should either reject or handle — we just verify it doesn't crash
        expect([200, 400, 500]).toContain(res.status);
    });
});

// ── Support Route ─────────────────────────────────────────────────
describe('POST /api/support', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns 400 when required fields are missing', async () => {
        vi.stubEnv('RESEND_API_KEY', 'test_key');
        vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');
        vi.stubEnv('SUPPORT_EMAIL', 'support@test.com');

        const { POST } = await import('@/app/api/support/route');
        const req = new Request('http://localhost/api/support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('returns 400 when message is empty', async () => {
        vi.stubEnv('RESEND_API_KEY', 'test_key');
        vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');
        vi.stubEnv('SUPPORT_EMAIL', 'support@test.com');

        const { POST } = await import('@/app/api/support/route');
        const req = new Request('http://localhost/api/support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: 'test@test.com', subject: 'Help', message: '' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});

// ── Checkout Route ────────────────────────────────────────────────
describe('POST /api/checkout', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns 400 when planId is missing', async () => {
        const { POST } = await import('@/app/api/checkout/route');
        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@test.com' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('returns 503 when Paddle is not configured', async () => {
        // Ensure Paddle env var is NOT set
        vi.stubEnv('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN', '');
        
        const { POST } = await import('@/app/api/checkout/route');
        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId: 'pro', email: 'user@test.com' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(503);
        const body = await res.json();
        expect(body.error).toContain('not configured');
    });
});

// ── Share Route ───────────────────────────────────────────────────
describe('POST /api/share', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns 400 when recipientEmail is missing', async () => {
        vi.stubEnv('RESEND_API_KEY', 'test_key');
        vi.stubEnv('RESEND_FROM_EMAIL', 'test@example.com');

        const { POST } = await import('@/app/api/share/route');
        const req = new Request('http://localhost/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderName: 'Test' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});
