import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { createNotification } from '@/lib/notifications';

// GET: Check verification status
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        await dbConnect();

        const user = await User.findById(userId).select('isVerified verificationStatus').lean();

        return NextResponse.json({
            isVerified: (user as { isVerified?: boolean })?.isVerified || false,
            verificationStatus: (user as { verificationStatus?: string })?.verificationStatus || 'none',
        });
    } catch (error) {
        console.error('Error checking verification:', error);
        return NextResponse.json({ error: 'Failed to check verification' }, { status: 500 });
    }
}

// POST: Request verification (pro only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string };
        if (user.role !== 'pro') {
            return NextResponse.json({ error: 'Only professionals can request verification' }, { status: 403 });
        }

        await dbConnect();

        const body = await request.json();
        const { businessName, taxId, website } = body;

        if (!businessName || !taxId) {
            return NextResponse.json({ error: 'Business name and tax ID are required' }, { status: 400 });
        }

        // Auto-approve on submit (no admin review flow exists yet)
        await User.findByIdAndUpdate(user.id, {
            verificationStatus: 'approved',
            isVerified: true,
            verificationData: {
                businessName,
                taxId,
                website: website || '',
                submittedAt: new Date(),
            },
        });

        // Notification
        await createNotification(
            user.id,
            'system',
            'Your verification was approved! The trust badge is now live on your profile.',
            undefined
        );

        return NextResponse.json(
            { message: 'Verification approved', status: 'approved' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error requesting verification:', error);
        return NextResponse.json({ error: 'Failed to submit verification request' }, { status: 500 });
    }
}
