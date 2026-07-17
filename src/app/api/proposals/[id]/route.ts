import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Proposal from '@/lib/models/Proposal';
import RequestModel from '@/lib/models/Request';
import User from '@/lib/models/User';
import { createNotification } from '@/lib/notifications';

// PUT /api/proposals/[id] — accept or reject a proposal
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
        const body = await request.json();
        const { action } = body; // 'accept' | 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await dbConnect();

        const proposal = await Proposal.findById(id).lean();
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        const proposalData = proposal as {
            _id: { toString(): string };
            requestId: { toString(): string };
            proId: { toString(): string };
            status: string;
        };

        // Verify the current user owns the request
        const req = await RequestModel.findById(proposalData.requestId).lean();
        if (!req) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const reqData = req as { userId: { toString(): string }; status: string };
        const currentUserId = (session.user as { id: string }).id;

        if (reqData.userId.toString() !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (action === 'accept') {
            // Update proposal status
            await Proposal.findByIdAndUpdate(id, { status: 'accepted' });

            // Reject all other pending proposals for this request
            await Proposal.updateMany(
                { requestId: proposalData.requestId, _id: { $ne: proposalData._id }, status: 'pending' },
                { status: 'rejected' }
            );

            // Update request status
            await RequestModel.findByIdAndUpdate(proposalData.requestId, {
                status: 'accepted',
                acceptedByProId: proposalData.proId,
            });

            // Notify the pro
            const pro = await User.findById(proposalData.proId).select('name').lean();
            const proName = (pro as { name?: string })?.name ?? 'Professional';
            await createNotification(
                proposalData.proId.toString(),
                'proposal_accepted',
                `Your proposal has been accepted! The client chose you for this job.`,
                proposalData.requestId.toString()
            );

            return NextResponse.json({
                success: true,
                message: `Proposal accepted. ${proName} will be notified.`,
            });
        } else {
            // Reject
            await Proposal.findByIdAndUpdate(id, { status: 'rejected' });

            await createNotification(
                proposalData.proId.toString(),
                'system',
                `Your proposal was not selected. Keep an eye out for new requests!`,
                proposalData.requestId.toString()
            );

            return NextResponse.json({
                success: true,
                message: 'Proposal rejected.',
            });
        }
    } catch (error) {
        console.error('Error updating proposal:', error);
        return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
    }
}
