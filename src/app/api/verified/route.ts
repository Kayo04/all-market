import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { z } from 'zod';
import { isValidNif, parseBody, text } from '@/lib/validation';

const verificationSchema = z.object({
    businessName: text(120, 2),
    taxId: z
        .string()
        .trim()
        .refine(isValidNif, 'Invalid Portuguese NIF')
        .transform((v) => v.replace(/^PT/i, '').replace(/\s/g, '')),
    website: z.union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Invalid website URL' }).max(200)]).optional(),
});

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

        const { data, error } = await parseBody(request, verificationSchema);
        if (error) return error;
        const { businessName, taxId, website } = data;

        await dbConnect();

        await User.findByIdAndUpdate(user.id, {
            verificationStatus: 'pending',
            isVerified: false,
            verificationData: {
                businessName,
                taxId,
                website: website || '',
                submittedAt: new Date(),
            },
        });

        return NextResponse.json(
            { message: 'Verification submitted for review', status: 'pending' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error requesting verification:', error);
        return NextResponse.json({ error: 'Failed to submit verification request' }, { status: 500 });
    }
}
