import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { appUrl, escapeHtml, sendEmail } from '@/lib/email';
import { clientIp, HOUR, MINUTE, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { email, parseBody } from '@/lib/validation';

const RESET_TTL_MS = HOUR;

const schema = z.object({
    email,
    locale: z.enum(['pt', 'en']).default('pt'),
});

// Always the same answer, whether or not the account exists, so this form can't be
// used to find out who is registered (same rule as login).
const OK = { message: 'If an account exists for this email, we sent a link to reset the password.' };

export async function POST(request: Request) {
    try {
        if (!(await rateLimit(`forgot-ip:${clientIp(request.headers)}`, 10, 15 * MINUTE))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }

        const { data, error } = await parseBody(request, schema);
        if (error) return error;
        const { email, locale } = data;

        // Per address too, so nobody can flood one person's inbox with reset emails.
        // Over the limit we answer OK as usual and simply don't send.
        if (!(await rateLimit(`forgot:${email}`, 3, HOUR))) return NextResponse.json(OK);

        await dbConnect();
        const user = await User.findOne({ email, isDeleted: { $ne: true } }).select('name');
        if (!user) return NextResponse.json(OK);

        // The raw token only ever exists in the email; the database keeps its hash.
        // A new request replaces any earlier link.
        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MS);
        await user.save();

        const link = appUrl(`/${locale}/auth/reset-password?token=${token}`);
        const pt = locale === 'pt';
        const name = escapeHtml(user.name);
        await sendEmail({
            to: email,
            subject: pt ? 'Repor a tua password do Needer' : 'Reset your Needer password',
            text: pt
                ? `Olá ${user.name},\n\nPara escolheres uma nova password, abre este link (válido durante 1 hora):\n${link}\n\nSe não foste tu a pedir, ignora este email — a tua password continua a mesma.\n\nEquipa Needer`
                : `Hi ${user.name},\n\nTo choose a new password, open this link (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, ignore this email — your password stays the same.\n\nThe Needer team`,
            html: pt
                ? `<p>Olá ${name},</p><p>Para escolheres uma nova password, carrega no botão abaixo. O link é válido durante 1 hora.</p><p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#2f9e5c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Repor password</a></p><p style="color:#666;font-size:13px">Se não foste tu a pedir, ignora este email — a tua password continua a mesma.</p><p>Equipa Needer</p>`
                : `<p>Hi ${name},</p><p>To choose a new password, click the button below. The link is valid for 1 hour.</p><p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#2f9e5c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a></p><p style="color:#666;font-size:13px">If you didn't ask for this, ignore this email — your password stays the same.</p><p>The Needer team</p>`,
        });

        return NextResponse.json(OK);
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
