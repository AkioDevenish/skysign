import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Readable } from 'stream';

// Helper to create authenticated Drive client
async function getDriveClient(userId: string) {
    const client = await clerkClient();
    
    try {
        // Fetch the Google OAuth token stored by Clerk
        const tokenResponse = await client.users.getUserOauthAccessToken(
            userId, 
            'oauth_google'
        );
        
        // Ensure tokens exist 
        if (!tokenResponse || !tokenResponse.data || tokenResponse.data.length === 0) {
            return null;
        }

        const googleToken = tokenResponse.data[0].token;
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: googleToken,
        });

        return google.drive({ version: 'v3', auth: oauth2Client });
    } catch (err) {
        console.error("Error fetching Google token from Clerk:", err);
        return null;
    }
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
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const drive = await getDriveClient(userId);
        if (!drive) {
            return NextResponse.json(
                { error: 'Google Drive not connected' }, 
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Drive
        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                mimeType: file.type || 'application/pdf',
            },
            media: {
                mimeType: file.type || 'application/pdf',
                body: Readable.from(buffer),
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
