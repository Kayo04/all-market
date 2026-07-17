import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Proposal from '@/lib/models/Proposal';

// GET /api/proposals/stats — get pro-specific proposal metrics
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string };
        if (user.role !== 'pro') {
            return NextResponse.json({ error: 'Pro only' }, { status: 403 });
        }

        await dbConnect();

        const [totalSent, accepted, pending] = await Promise.all([
            Proposal.countDocuments({ proId: user.id }),
            Proposal.countDocuments({ proId: user.id, status: 'accepted' }),
            Proposal.countDocuments({ proId: user.id, status: 'pending' }),
        ]);

        const acceptanceRate = totalSent > 0
            ? Math.round((accepted / totalSent) * 100)
            : 0;

        return NextResponse.json({
            totalSent,
            accepted,
            pending,
            acceptanceRate,
        });
    } catch (error) {
        console.error('Error fetching proposal stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
