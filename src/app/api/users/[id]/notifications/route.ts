import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

const PREF_KEYS = ['proposals', 'messages', 'newRequests', 'reviews'] as const;

const DEFAULT_PREFS: Record<string, boolean> = {
    proposals: true,
    messages: true,
    newRequests: true,
    reviews: true,
};

// GET: Read own notification preferences
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if ((session.user as { id: string }).id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const user = await User.findById(id).select('notificationPrefs').lean();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const stored = (user as { notificationPrefs?: Record<string, boolean> }).notificationPrefs;
        // Merge over defaults so accounts created before this field return a full object.
        return NextResponse.json({ notificationPrefs: { ...DEFAULT_PREFS, ...(stored ?? {}) } });
    } catch (error) {
        console.error('Error reading notification preferences:', error);
        return NextResponse.json({ error: 'Failed to read preferences' }, { status: 500 });
    }
}

// PUT: Update own notification preferences
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if ((session.user as { id: string }).id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));

        // Only accept known keys with boolean values — ignore anything else rather than
        // writing arbitrary client-supplied fields into the subdocument.
        const updates: Record<string, boolean> = {};
        for (const key of PREF_KEYS) {
            if (typeof body?.[key] === 'boolean') {
                updates[`notificationPrefs.${key}`] = body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid preferences provided' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true })
            .select('notificationPrefs')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const stored = (user as { notificationPrefs?: Record<string, boolean> }).notificationPrefs;
        return NextResponse.json({
            message: 'Preferences updated',
            notificationPrefs: { ...DEFAULT_PREFS, ...(stored ?? {}) },
        });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}
