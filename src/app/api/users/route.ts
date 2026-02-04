import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const client = await clerkClient();
        
        // Fetch recent users (limited to 10 for display)
        const usersResponse = await client.users.getUserList({
            limit: 10,
            orderBy: '-created_at',
        });
        
        // Get total user count
        const totalCount = usersResponse.totalCount || usersResponse.data.length;
        
        // Extract relevant user info for display
        const users = usersResponse.data.map((user) => ({
            id: user.id,
            imageUrl: user.imageUrl,
            firstName: user.firstName,
        }));
        
        return NextResponse.json({
            users,
            totalCount,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', users: [], totalCount: 0 },
            { status: 500 }
        );
    }
}
