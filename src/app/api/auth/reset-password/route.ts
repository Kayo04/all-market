import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { clientIp, MINUTE, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { parseBody, password } from '@/lib/validation';

const schema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/, 'Invalid or expired link'),
    password,
});

// Sets a new password from the emailed link (see api/auth/forgot-password).
// The link works once: the token is cleared as soon as it's used.
export async function POST(request: Request) {
    try {
        if (!(await rateLimit(`reset-ip:${clientIp(request.headers)}`, 10, 15 * MINUTE))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }

        const { data, error } = await parseBody(request, schema);
        if (error) return error;

        await dbConnect();
        const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');
        const user = await User.findOne({
            passwordResetTokenHash: tokenHash,
            passwordResetExpires: { $gt: new Date() },
            isDeleted: { $ne: true },
        });
        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
        }

        user.password = await bcrypt.hash(data.password, 12);
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Password updated' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
