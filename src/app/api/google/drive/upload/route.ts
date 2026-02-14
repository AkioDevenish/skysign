import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper to create authenticated Drive client
async function getDriveClient(userId: string) {
    // Get stored tokens from Convex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await convex.query(api.settings.get) as any;
    
    if (!settings?.googleAccessToken) {
        return null;
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        access_token: settings.googleAccessToken,
        refresh_token: settings.googleRefreshToken,
    });

    // Handle token refresh if needed
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            // Update stored tokens
            await convex.mutation(api.settings.saveGoogleTokens, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || settings.googleRefreshToken,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined,
                email: settings.googleEmail,
            });
        }
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
}

// POST /api/google/drive/upload - Upload file to Drive
export async function POST(request: NextRequest) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileName = formData.get('fileName') as string;
        const folderId = formData.get('folderId') as string | null;

        if (!file || !fileName) {
            return NextResponse.json({ error: 'Missing file or fileName' }, { status: 400 });
        }

        const drive = await getDriveClient(userId);
        if (!drive) {
            return NextResponse.json(
                { error: 'Google Drive not connected' }, 
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        const { Readable } = await import('stream');
        const stream = Readable.from(buffer);

        // Create file metadata
        const fileMetadata: { name: string; parents?: string[] } = {
            name: fileName,
        };

        // If folderId provided, put in that folder
        if (folderId) {
            fileMetadata.parents = [folderId];
        }

        // Upload to Drive
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType: file.type || 'application/pdf',
                body: stream,
            },
            fields: 'id, name, webViewLink, webContentLink',
        });


        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            name: response.data.name,
            webViewLink: response.data.webViewLink,
            downloadLink: response.data.webContentLink,
        });
    } catch (error) {
        console.error('[Drive] Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload to Google Drive' }, 
            { status: 500 }
        );
    }
}

// GET /api/google/drive/upload - List files from Drive
export async function GET(request: NextRequest) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const drive = await getDriveClient(userId);
        if (!drive) {
            return NextResponse.json(
                { error: 'Google Drive not connected' }, 
                { status: 400 }
            );
        }

        // Get query params
        const searchParams = request.nextUrl.searchParams;
        const pageToken = searchParams.get('pageToken');
        const query = searchParams.get('query') || '';

        // List PDF files
        const response = await drive.files.list({
            pageSize: 20,
            pageToken: pageToken || undefined,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, thumbnailLink)',
            q: `mimeType='application/pdf' ${query ? `and name contains '${query}'` : ''} and trashed=false`,
            orderBy: 'modifiedTime desc',
        });

        return NextResponse.json({
            files: response.data.files || [],
            nextPageToken: response.data.nextPageToken,
        });
    } catch (error) {
        console.error('[Drive] List error:', error);
        return NextResponse.json(
            { error: 'Failed to list Google Drive files' }, 
            { status: 500 }
        );
    }
}
