import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isObjectId, parseBody } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import RequestModel from '@/lib/models/Request';
import { createNotification } from '@/lib/notifications';
import { newExpiryDate } from '@/lib/requestExpiry';

const requestActionSchema = z.object({ action: z.enum(['complete', 'renew']) });

// GET /api/requests/[id] — fetch a single request by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        if (!isObjectId(id)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const doc = await RequestModel.findById(id)
            .populate('userId', 'name avatar')
            .populate('acceptedByProId', 'name avatar')
            .lean();

        if (!doc) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }
        if ((doc as { removedAt?: Date }).removedAt) {
            const session = await getServerSession(authOptions);
            const viewer = session?.user as { id?: string; role?: string } | undefined;
            const ownerId = String((doc as { userId?: { _id?: unknown } }).userId?._id ?? '');
            if (viewer?.role !== 'admin' && viewer?.id !== ownerId) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 });
            }
        }

        return NextResponse.json({ request: doc });
    } catch (error) {
        console.error('Error fetching request:', error);
        return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
    }
}

// PATCH /api/requests/[id] — transition request status (e.g. mark as complete)
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
        if (!isObjectId(id)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const { data, error } = await parseBody(request, requestActionSchema);
        if (error) return error;
        const { action } = data;

        await dbConnect();

        const doc = await RequestModel.findById(id).lean();
        if (!doc) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const reqData = doc as { userId: { toString(): string }; status: string; acceptedByProId?: { toString(): string }; removedAt?: Date };
        const currentUserId = (session.user as { id: string }).id;

        if (reqData.userId.toString() !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (action === 'complete') {
            if (reqData.status !== 'accepted') {
                return NextResponse.json({ error: 'Can only complete accepted jobs' }, { status: 400 });
            }

            await RequestModel.updateOne({ _id: id, status: 'accepted' }, { status: 'closed' });

            // Notify the assigned pro
            if (reqData.acceptedByProId) {
                await createNotification(
                    reqData.acceptedByProId.toString(),
                    'request_closed',
                    'The client has marked the job as complete. Please check if everything is done!',
                    id
                );
            }

            return NextResponse.json({ success: true, message: 'Job marked as complete' });
        }

        if (action === 'renew') {
            // Keeps an open request alive for another full lifetime, or reopens an expired one.
            // Pros are not pinged again: they were told when it was first posted.
            if (reqData.removedAt || !['open', 'expired'].includes(reqData.status)) {
                return NextResponse.json({ error: 'Only open or expired requests can be renewed' }, { status: 400 });
            }
            const expiresAt = newExpiryDate();
            await RequestModel.updateOne(
                { _id: id, status: { $in: ['open', 'expired'] } },
                { status: 'open', expiresAt, $unset: { expiryWarnedAt: 1 } },
            );
            return NextResponse.json({ success: true, expiresAt });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
