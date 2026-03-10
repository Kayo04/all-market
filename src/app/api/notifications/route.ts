import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';

// GET: Fetch user's notifications
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === '1';
        const limit = parseInt(searchParams.get('limit') || '20');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { userId };
        if (unreadOnly) query.readStatus = false;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await Notification.countDocuments({
            userId,
            readStatus: false,
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;

        await dbConnect();

        const body = await request.json();
        const { ids, markAll } = body;

        if (markAll) {
            await Notification.updateMany(
                { userId, readStatus: false },
                { readStatus: true }
            );
        } else if (ids && Array.isArray(ids)) {
            await Notification.updateMany(
                { _id: { $in: ids }, userId },
                { readStatus: true }
            );
        }

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
