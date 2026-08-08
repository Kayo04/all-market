import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { createNotification } from '@/lib/notifications';

// PUT: Approve or reject a pending pro verification (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((session.user as { role: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const action: string | undefined = body?.action;

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
        }

        await dbConnect();

        const target = await User.findById(id).select('verificationStatus role');
        if (!target) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (target.verificationStatus !== 'pending') {
            return NextResponse.json({ error: 'This verification is not pending review' }, { status: 409 });
        }

        target.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
        target.isVerified = action === 'approve';
        await target.save();

        await createNotification(
            id,
            'system',
            action === 'approve'
                ? 'Your verification was approved! The trust badge is now live on your profile.'
                : 'Your verification request was not approved. You can review your details and resubmit.',
            undefined
        );

        const verb = action === 'approve' ? 'approved' : 'rejected';
        return NextResponse.json({ message: `Verification ${verb}`, status: target.verificationStatus });
    } catch (error) {
        console.error('Error reviewing verification:', error);
        return NextResponse.json({ error: 'Failed to review verification' }, { status: 500 });
    }
}
