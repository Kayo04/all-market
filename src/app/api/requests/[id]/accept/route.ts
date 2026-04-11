import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import RequestModel from '@/lib/models/Request';

// POST: Pro instantly accepts a job — atomic, first-come-first-served
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as { role?: string })?.role;
        if (userRole !== 'pro') {
            return NextResponse.json(
                { error: 'Only verified professionals can accept jobs' },
                { status: 403 }
            );
        }

        await dbConnect();

        const proId = (session.user as { id: string }).id;
        const { id } = await params;

        // Atomic update: only succeeds if the job is still open
        // This prevents two pros hitting "Accept" at the same millisecond
        const updated = await RequestModel.findOneAndUpdate(
            { _id: id, status: 'open' },
            {
                $set: {
                    status: 'accepted',
                    acceptedByProId: proId,
                },
            },
            { new: true }
        );

        if (!updated) {
            // Job was already accepted by another pro
            return NextResponse.json(
                { success: false, message: 'Job already taken by another professional' },
                { status: 409 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Job accepted successfully',
            request: updated,
        });
    } catch (error) {
        console.error('Error accepting job:', error);
        return NextResponse.json(
            { error: 'Failed to accept job' },
            { status: 500 }
        );
    }
}
