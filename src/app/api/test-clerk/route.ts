import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ err: 'No user' });
    const client = await clerkClient();
    try {
        const tokensOAuth = await client.users.getUserOauthAccessToken(userId, 'oauth_google');
        const user = await client.users.getUser(userId);
        return NextResponse.json({ 
            oauth_google_tokens: tokensOAuth.data,
            externalAccounts: user.externalAccounts,
        });
    } catch(err: unknown) {
        return NextResponse.json({ err: err instanceof Error ? err.message : 'Unknown error' });
    }
}
