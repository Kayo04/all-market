import { NextResponse } from 'next/server';
import { isObjectId, PASSWORD_MIN } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { rateLimit } from '@/lib/rateLimit';

const MIN_LENGTH = PASSWORD_MIN; // same rule as registration (src/lib/validation.ts)

// PUT: Change own password (requires the current one)
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
        if (!isObjectId(id)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if ((session.user as { id: string }).id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Throttled like login: this endpoint also verifies a password, so without a
        // limit it's an oracle for guessing the current one from a hijacked session.
        if (!rateLimit(`password-change:${id}`, 10, 15 * 60 * 1000)) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again in a few minutes.' },
                { status: 429 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current and new password are required' },
                { status: 400 }
            );
        }

        if (typeof newPassword !== 'string' || typeof currentPassword !== 'string' || newPassword.length < MIN_LENGTH || newPassword.length > 72) {
            return NextResponse.json(
                { error: `New password must be between ${MIN_LENGTH} and 72 characters` },
                { status: 400 }
            );
        }

        if (newPassword === currentPassword) {
            return NextResponse.json(
                { error: 'New password must be different from the current one' },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findById(id).select('password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return NextResponse.json({ message: 'Password updated' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
