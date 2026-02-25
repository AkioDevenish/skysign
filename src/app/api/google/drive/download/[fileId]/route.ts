import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth, clerkClient } from '@clerk/nextjs/server';

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
        const client = await clerkClient();
        
        // Fetch the Google OAuth token stored by Clerk
        const tokenResponse = await client.users.getUserOauthAccessToken(
            userId, 
            'oauth_google'
        );
        
        if (!tokenResponse || !tokenResponse.data || tokenResponse.data.length === 0) {
            return NextResponse.json(
                { error: 'Google Drive not connected' }, 
                { status: 400 }
            );
        }

        const googleToken = tokenResponse.data[0].token;

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            access_token: googleToken,
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Get file metadata
        const fileMeta = await drive.files.get({
            fileId,
            fields: 'name, mimeType',
        });

        // Download file content via stream
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        // Convert the Node.js Readable stream to a Web ReadableStream
        const stream = new ReadableStream({
            start(controller) {
                const nodeStream = response.data as any; // Cast to access stream events
                nodeStream.on('data', (chunk: Buffer) => {
                    controller.enqueue(new Uint8Array(chunk));
                });
                nodeStream.on('end', () => {
                    controller.close();
                });
                nodeStream.on('error', (err: any) => {
                    controller.error(err);
                });
            }
        });

        return new NextResponse(stream, {
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
