import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// GET: List pending pro verifications (admin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((session.user as { role: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const pending = await User.find({ verificationStatus: 'pending' })
            .select('name email proCategory verificationData createdAt')
            .sort({ 'verificationData.submittedAt': 1 })
            .lean();

        return NextResponse.json({ pending });
    } catch (error) {
        console.error('Error listing pending verifications:', error);
        return NextResponse.json({ error: 'Failed to list pending verifications' }, { status: 500 });
    }
}
