import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';
import Proposal from '@/lib/models/Proposal';
import Message from '@/lib/models/Message';

// GET: Self-service data export (GDPR Art. 20 — right to data portability).
// Self-only, same auth pattern as DELETE in the parent route.
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
        const currentUser = session.user as { id: string };

        if (currentUser.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const [user, requests, proposals, messages] = await Promise.all([
            User.findById(id).select('-password').lean(),
            RequestModel.find({ userId: id }).lean(),
            Proposal.find({ proId: id }).lean(),
            Message.find({ $or: [{ senderId: id }, { receiverId: id }] }).lean(),
        ]);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            exportedAt: new Date().toISOString(),
            account: user,
            requestsPosted: requests,
            proposalsSubmitted: proposals,
            messages,
        }, {
            headers: {
                'Content-Disposition': `attachment; filename="needer-data-export-${id}.json"`,
            },
        });
    } catch (error) {
        console.error('Error exporting user data:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
