import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import ProApplication from '@/lib/models/ProApplication';
import { isObjectId, parseBody, text } from '@/lib/validation';
import { createNotification } from '@/lib/notifications';
import { appUrl, noticeEmail, sendEmail } from '@/lib/email';

// The admin's message is shown to the applicant as written; it is required when
// asking for more information or rejecting, so nobody gets a decision without a reason.
const decisionSchema = z
    .object({
        action: z.enum(['approve', 'needs_info', 'reject']),
        message: text(2000, 0).optional(),
    })
    .refine((d) => d.action === 'approve' || (d.message ?? '').length >= 10, {
        path: ['message'],
        message: 'A message (at least 10 characters) is required',
    });

const STATUS_FOR_ACTION = { approve: 'approved', needs_info: 'needs_info', reject: 'rejected' } as const;

const EMAIL = {
    approve: {
        subject: ['A tua candidatura a Pro foi aprovada', 'Your Pro application was approved'],
        body: [
            'Parabéns, a tua conta já é Pro! A partir de agora recebes os pedidos da tua área e podes enviar propostas.',
            'Congratulations, your account is now Pro! From now on you get the requests in your field and can send proposals.',
        ],
        cta: ['Ver pedidos', 'See requests'],
        path: '/requests',
    },
    needs_info: {
        subject: ['Precisamos de mais informação na tua candidatura', 'We need more information on your application'],
        body: [
            'Analisámos a tua candidatura a Pro e precisamos que completes ou corrijas alguns dados antes de decidirmos.',
            'We reviewed your Pro application and need you to complete or correct some details before we decide.',
        ],
        cta: ['Atualizar candidatura', 'Update application'],
        path: '/pro/apply',
    },
    reject: {
        subject: ['A tua candidatura a Pro não foi aprovada', 'Your Pro application was not approved'],
        body: [
            'Analisámos a tua candidatura a Pro e, por agora, não a pudemos aprovar.',
            'We reviewed your Pro application and could not approve it for now.',
        ],
        cta: ['Ver candidatura', 'View application'],
        path: '/pro',
    },
} as const;

// PUT: decide on a pending application (admin only). Approving makes the account a
// Pro immediately — the session re-reads the role from the DB on every request.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if ((session.user as { role: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        if (!isObjectId(id)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const { data, error } = await parseBody(request, decisionSchema);
        if (error) return error;
        const message = data.message?.trim() ?? '';
        const adminId = (session.user as { id: string }).id;

        await dbConnect();
        const app = await ProApplication.findById(id);
        if (!app) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (app.status !== 'pending') {
            return NextResponse.json({ error: 'This application is not pending review' }, { status: 409 });
        }
        const user = await User.findById(app.userId);
        if (!user || user.isDeleted) {
            return NextResponse.json({ error: 'The applicant no longer has an account' }, { status: 409 });
        }

        const now = new Date();
        app.status = STATUS_FOR_ACTION[data.action];
        app.adminMessage = message;
        app.reviewedAt = now;
        app.reviewedBy = adminId;
        app.history.push({ status: app.status, message, at: now, by: adminId });
        await app.save();

        if (data.action === 'approve' && user.role === 'client') {
            user.role = 'pro';
            user.proCategory = app.subcategory || app.category;
            user.isVerified = true;
            user.verificationStatus = 'approved';
            user.verificationData = {
                businessName: app.businessName || app.fullName,
                taxId: app.nif,
                website: app.website,
                submittedAt: app.submittedAt,
            };
            if (!user.phone) user.phone = app.phone;
            await user.save();
        }

        const pt = user.locale !== 'en';
        const i = pt ? 0 : 1;
        const tpl = EMAIL[data.action];
        const paragraphs: string[] = [tpl.body[i]];
        if (message) paragraphs.push(`${pt ? 'Mensagem da equipa Needer' : 'Message from the Needer team'}: ${message}`);
        const mail = noticeEmail({
            pt,
            name: user.name,
            paragraphs,
            link: appUrl(`/${pt ? 'pt' : 'en'}${tpl.path}`),
            cta: tpl.cta[i],
        });
        await sendEmail({ to: user.email, subject: tpl.subject[i], ...mail });
        await createNotification(String(user._id), 'system', `${tpl.subject[i]}${message ? `: ${message.slice(0, 120)}` : ''}`);

        return NextResponse.json({ message: 'Decision saved', status: app.status });
    } catch (error) {
        console.error('Error reviewing pro application:', error);
        return NextResponse.json({ error: 'Failed to save decision' }, { status: 500 });
    }
}
