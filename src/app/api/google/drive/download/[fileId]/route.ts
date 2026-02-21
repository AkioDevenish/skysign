import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET /api/google/drive/download/[fileId] - Download file from Drive
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { userId } = await auth();
    
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = await params;

    if (!fileId) {
        return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    try {
        const { getToken } = await auth();
        const token = await getToken({ template: 'convex' });
        if (token) {
            convex.setAuth(token);
        }

        // Get stored tokens
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settings = await convex.query(api.settings.get) as any;
        
        if (!settings?.googleAccessToken) {
            return NextResponse.json(
                { error: 'Google Drive not connected' }, 
                { status: 400 }
            );
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: settings.googleAccessToken,
            refresh_token: settings.googleRefreshToken,
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Get file metadata
        const fileMeta = await drive.files.get({
            fileId,
            fields: 'name, mimeType',
        });

        // Download file content
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const buffer = Buffer.from(response.data as ArrayBuffer);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': fileMeta.data.mimeType || 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileMeta.data.name}"`,
            },
        });
    } catch (error) {
        console.error('[Drive] Download error:', error);
        return NextResponse.json(
            { error: 'Failed to download from Google Drive' }, 
            { status: 500 }
        );
    }
}
