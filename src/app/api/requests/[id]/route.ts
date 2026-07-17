import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import RequestModel from '@/lib/models/Request';
import { createNotification } from '@/lib/notifications';

// GET /api/requests/[id] — fetch a single request by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const doc = await RequestModel.findById(id)
            .populate('userId', 'name avatar')
            .populate('acceptedByProId', 'name avatar')
            .lean();

        if (!doc) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
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
        const body = await request.json();
        const { action } = body; // 'complete'

        await dbConnect();

        const doc = await RequestModel.findById(id).lean();
        if (!doc) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const reqData = doc as { userId: { toString(): string }; status: string; acceptedByProId?: { toString(): string } };
        const currentUserId = (session.user as { id: string }).id;

        if (reqData.userId.toString() !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (action === 'complete') {
            if (reqData.status !== 'accepted') {
                return NextResponse.json({ error: 'Can only complete accepted jobs' }, { status: 400 });
            }

            await RequestModel.findByIdAndUpdate(id, { status: 'closed' });

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

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
