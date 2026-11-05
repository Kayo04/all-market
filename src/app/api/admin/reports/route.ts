import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Report from '@/lib/models/Report';

// GET: open reports, oldest first (admin only).
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
        const reports = await Report.find({ status: 'open' })
            .populate('reporterId', 'name email')
            .populate('targetOwnerId', 'name email')
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error listing reports:', error);
        return NextResponse.json({ error: 'Failed to list reports' }, { status: 500 });
    }
}
