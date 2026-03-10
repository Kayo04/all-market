import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Proposal from '@/lib/models/Proposal';
import RequestModel from '@/lib/models/Request';
import { createNotification } from '@/lib/notifications';

// GET: Proposals for a specific request
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');

        if (!requestId) {
            return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
        }

        const proposals = await Proposal.find({ requestId })
            .sort({ createdAt: -1 })
            .populate('proId', 'name avatar isVerified ratings')
            .lean();

        return NextResponse.json({ proposals });
    } catch (error) {
        console.error('Error fetching proposals:', error);
        return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
    }
}

// POST: Submit a proposal (pro only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string; name?: string };
        if (user.role !== 'pro') {
            return NextResponse.json(
                { error: 'Only professionals can submit proposals' },
                { status: 403 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { requestId, message, price } = body;

        if (!requestId || !message || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if pro already submitted a proposal for this request
        const existing = await Proposal.findOne({ requestId, proId: user.id });
        if (existing) {
            return NextResponse.json(
                { error: 'You already submitted a proposal for this request' },
                { status: 409 }
            );
        }

        const proposal = await Proposal.create({
            requestId,
            proId: user.id,
            message,
            price,
        });

        // Notify the request owner about the new proposal
        const req = await RequestModel.findById(requestId).lean();
        if (req) {
            const reqOwner = (req as { userId: { toString: () => string } }).userId.toString();
            await createNotification(
                reqOwner,
                'new_proposal',
                `${user.name || 'A professional'} sent a proposal for €${price}`,
                requestId
            );
        }

        return NextResponse.json(
            { message: 'Proposal submitted', proposal },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating proposal:', error);
        return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 });
    }
}

