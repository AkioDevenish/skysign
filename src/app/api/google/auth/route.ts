import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';

// Google OAuth2 configuration will be instantiated in the route handler
// Scopes required for Google Drive access

// Scopes required for Google Drive access
const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',  // Access to files created by app
    'https://www.googleapis.com/auth/userinfo.email',
];

// GET /api/google/auth - Start OAuth flow
export async function GET(request: NextRequest) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return NextResponse.json(
            { error: 'Google OAuth not configured' }, 
            { status: 500 }
        );
    }

    // Generate auth URL with state for security
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    
    // Create the OAuth client dynamically based on the current request domain
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${request.nextUrl.origin}/api/google/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state,
        prompt: 'consent', // Force consent to get refresh token
    });

    return NextResponse.redirect(authUrl);
}
