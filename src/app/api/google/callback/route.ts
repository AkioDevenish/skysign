import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Google OAuth2 configuration
// Google OAuth2 configuration will be dynamically instantiated on each request

// GET /api/google/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle errors from Google
    if (error) {
        console.error('[Google OAuth] Error:', error);
        return NextResponse.redirect(
            new URL('/dashboard?google=error&message=' + encodeURIComponent(error), request.url)
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            new URL('/dashboard?google=error&message=missing_params', request.url)
        );
    }

    try {
        // Decode state to get user ID
        const { userId: stateUserId } = JSON.parse(
            Buffer.from(state, 'base64').toString()
        );

        // Verify current user matches state
        const { userId, getToken } = await auth();
        if (!userId || userId !== stateUserId) {
            return NextResponse.redirect(
                new URL('/dashboard?google=error&message=auth_mismatch', request.url)
            );
        }

        // Exchange code for tokens
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${request.nextUrl.origin}/api/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        
        if (!tokens.access_token) {
            throw new Error('No access token received');
        }

        // Get user email from Google
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();

        // Store tokens in Convex (encrypted in production)
        // For simplicity, we'll use the settings mutation
        // In production, you'd want to encrypt these tokens
        const token = await getToken({ template: 'convex' });
        if (token) {
            convex.setAuth(token);
        }
        await convex.mutation(api.settings.saveGoogleTokens, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined,
            email: userInfo.email || undefined,
        });


        // Redirect back to dashboard with success
        return NextResponse.redirect(
            new URL('/create?google=connected', request.url)
        );
    } catch (err: any) {
        console.error('[Google OAuth] Callback error:', err);
        return NextResponse.redirect(
            new URL('/dashboard?google=error&message=' + encodeURIComponent(err.message || 'unknown_error'), request.url)
        );
    }
}
