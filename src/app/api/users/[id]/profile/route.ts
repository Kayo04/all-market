import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// PATCH /api/users/[id]/profile — update profile fields (onboarding + settings)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const currentUserId = (session.user as { id: string }).id;

        // Users can only update their own profile
        if (currentUserId !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = [
            'bio', 'skills', 'proCategory', 'locationLabel', 'phone', 'avatar',
        ];

        // Only pick allowed fields from the body
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: Record<string, any> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                update[field] = body[field];
            }
        }

        // Self-service role change is only ever an upgrade to 'pro' (see /pro page) —
        // never allow this endpoint to be used to set any other role value.
        if (body.role === 'pro') {
            update.role = 'pro';
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findByIdAndUpdate(id, update, { new: true })
            .select('name email role bio skills proCategory locationLabel phone avatar isVerified')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
