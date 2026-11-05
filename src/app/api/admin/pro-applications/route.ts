import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ProApplication from '@/lib/models/ProApplication';

// GET: Pro applications awaiting a decision, oldest first (admin only).
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
        const applications = await ProApplication.find({ status: 'pending' })
            .populate('userId', 'name email createdAt')
            .sort({ submittedAt: 1 })
            .lean();

        return NextResponse.json({ applications });
    } catch (error) {
        console.error('Error listing pro applications:', error);
        return NextResponse.json({ error: 'Failed to list applications' }, { status: 500 });
    }
}
