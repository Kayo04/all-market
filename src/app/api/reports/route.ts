import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';
import Proposal from '@/lib/models/Proposal';
import Report, { REPORT_REASONS, REPORT_TARGETS } from '@/lib/models/Report';
import { objectId, parseBody, text } from '@/lib/validation';
import { HOUR, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { createNotification } from '@/lib/notifications';
import { appUrl, noticeEmail, sendEmail } from '@/lib/email';

const reportSchema = z
    .object({
        targetType: z.enum(REPORT_TARGETS),
        targetId: objectId,
        reason: z.enum(REPORT_REASONS),
        details: text(1000, 0).optional(),
    })
    .refine((d) => d.reason !== 'other' || (d.details ?? '').length >= 10, {
        path: ['details'],
        message: 'Please describe the problem (at least 10 characters)',
    });

// Finds who is responsible for the reported thing and a short copy of it.
async function resolveTarget(type: (typeof REPORT_TARGETS)[number], id: string) {
    if (type === 'request') {
        const r = await RequestModel.findById(id).select('userId title description').lean<{ userId: unknown; title: string; description: string }>();
        return r && { ownerId: String(r.userId), snapshot: `${r.title}\n\n${r.description}`.slice(0, 2000) };
    }
    if (type === 'proposal') {
        const p = await Proposal.findById(id).select('proId message price').lean<{ proId: unknown; message: string; price: number }>();
        return p && { ownerId: String(p.proId), snapshot: `€${p.price} — ${p.message}`.slice(0, 2000) };
    }
    const u = await User.findById(id).select('name bio isDeleted').lean<{ _id: unknown; name: string; bio?: string; isDeleted?: boolean }>();
    return u && !u.isDeleted ? { ownerId: String(u._id), snapshot: `${u.name}\n\n${u.bio ?? ''}`.slice(0, 2000) } : null;
}

// POST: report a request, a proposal or an account. Signed-in users only, so a
// report can be followed up and answered; anyone else can use the email in the Terms.
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const reporterId = (session.user as { id: string }).id;

        const { data, error } = await parseBody(request, reportSchema);
        if (error) return error;

        if (!(await rateLimit(`report:${reporterId}`, 10, 24 * HOUR))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }

        await dbConnect();
        const target = await resolveTarget(data.targetType, data.targetId);
        if (!target) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (target.ownerId === reporterId) {
            return NextResponse.json({ error: 'You cannot report your own content' }, { status: 400 });
        }

        // One open report per person per target: a repeat just confirms the first.
        const existing = await Report.findOne({ reporterId, targetId: data.targetId, status: 'open' }).select('_id').lean();
        if (existing) {
            return NextResponse.json({ message: 'Report received' }, { status: 200 });
        }

        await Report.create({
            reporterId,
            targetType: data.targetType,
            targetId: data.targetId,
            targetOwnerId: target.ownerId,
            targetSnapshot: target.snapshot,
            reason: data.reason,
            details: data.details ?? '',
        });

        const admins = await User.find({ role: 'admin', isDeleted: { $ne: true } }).select('_id name email').lean<{ _id: unknown; name: string; email: string }[]>();
        await Promise.all(
            admins.map(async (a) => {
                await createNotification(String(a._id), 'system', `New report (${data.reason}) on a ${data.targetType}`);
                const mail = noticeEmail({
                    pt: true,
                    name: a.name,
                    paragraphs: [`Nova denúncia (${data.reason}) sobre ${data.targetType === 'request' ? 'um pedido' : data.targetType === 'proposal' ? 'uma proposta' : 'uma conta'}.`],
                    link: appUrl('/pt/admin'),
                    cta: 'Ver denúncias',
                });
                await sendEmail({ to: a.email, subject: 'Nova denúncia no Needer', ...mail });
            })
        );

        return NextResponse.json({ message: 'Report received' }, { status: 201 });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Failed to send report' }, { status: 500 });
    }
}
