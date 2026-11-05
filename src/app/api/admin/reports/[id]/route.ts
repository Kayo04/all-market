import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';
import Proposal from '@/lib/models/Proposal';
import Report from '@/lib/models/Report';
import { isObjectId, parseBody, text } from '@/lib/validation';
import { createNotification } from '@/lib/notifications';
import { appUrl, noticeEmail, sendEmail } from '@/lib/email';
import { LEGAL } from '@/lib/legal';

// dismiss: nothing wrong. remove: hide the reported request/proposal.
// suspend: block the responsible account and hide its open content.
// Removing or suspending requires a message: it is the statement of reasons the
// affected person must receive (DSA art. 17).
const decisionSchema = z
    .object({
        action: z.enum(['dismiss', 'remove', 'suspend']),
        message: text(2000, 0).optional(),
    })
    .refine((d) => d.action === 'dismiss' || (d.message ?? '').length >= 10, {
        path: ['message'],
        message: 'A message to the person affected (at least 10 characters) is required',
    });

type Lean = { _id: unknown; name: string; email: string; locale?: string };

async function tell(user: Lean | null, subject: [string, string], body: [string, string], message: string, path: string) {
    if (!user) return;
    const pt = user.locale !== 'en';
    const i = pt ? 0 : 1;
    const paragraphs: string[] = [body[i]];
    if (message) paragraphs.push(`${pt ? 'Motivo' : 'Reason'}: ${message}`);
    const mail = noticeEmail({ pt, name: user.name, paragraphs, link: appUrl(`/${pt ? 'pt' : 'en'}${path}`), cta: pt ? 'Abrir o Needer' : 'Open Needer' });
    await sendEmail({ to: user.email, subject: subject[i], ...mail });
    await createNotification(String(user._id), 'system', `${subject[i]}${message ? `: ${message.slice(0, 120)}` : ''}`);
}

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
        const report = await Report.findById(id);
        if (!report) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        if (report.status !== 'open') {
            return NextResponse.json({ error: 'This report was already handled' }, { status: 409 });
        }
        if (data.action === 'remove' && report.targetType === 'user') {
            return NextResponse.json({ error: 'An account cannot be removed; suspend it instead' }, { status: 400 });
        }

        const now = new Date();
        const ownerId = String(report.targetOwnerId);
        if (data.action === 'remove') {
            if (report.targetType === 'request') {
                await RequestModel.updateOne({ _id: report.targetId }, { removedAt: now, status: 'closed' });
            } else {
                await Proposal.updateOne({ _id: report.targetId }, { removedAt: now, status: 'rejected' });
            }
        }
        if (data.action === 'suspend') {
            await User.updateOne({ _id: ownerId }, { suspendedAt: now });
            await RequestModel.updateMany({ userId: ownerId, status: { $in: ['open', 'accepted', 'in_progress'] } }, { removedAt: now, status: 'closed' });
            await Proposal.updateMany({ proId: ownerId, status: 'pending' }, { removedAt: now, status: 'rejected' });
        }

        // Every open report on the same target gets the same outcome.
        const status = data.action === 'dismiss' ? 'dismissed' : 'actioned';
        const action = data.action === 'dismiss' ? 'none' : data.action === 'remove' ? 'removed' : 'suspended';
        const siblings = await Report.find({ targetId: report.targetId, status: 'open' }).select('reporterId').lean<{ reporterId: unknown }[]>();
        await Report.updateMany(
            { targetId: report.targetId, status: 'open' },
            { status, action, adminMessage: message, resolvedAt: now, resolvedBy: adminId }
        );

        const owner = await User.findById(ownerId).select('name email locale').lean<Lean>();
        const what = { request: ['o teu pedido', 'your request'], proposal: ['a tua proposta', 'your proposal'], user: ['a tua conta', 'your account'] }[report.targetType as 'request' | 'proposal' | 'user'];
        const contest: [string, string] = [
            ` Se discordas, responde a este email ou escreve para ${LEGAL.email}.`,
            ` If you disagree, reply to this email or write to ${LEGAL.email}.`,
        ];
        if (data.action === 'remove') {
            await tell(owner, ['Um conteúdo teu foi removido', 'Some of your content was removed'],
                [`Removemos ${what[0]} por não cumprir os Termos do Needer.${contest[0]}`, `We removed ${what[1]} because it breaks the Needer Terms.${contest[1]}`], message, '/terms');
        } else if (data.action === 'suspend') {
            await tell(owner, ['A tua conta foi suspensa', 'Your account was suspended'],
                [`Suspendemos a tua conta no Needer por não cumprir os Termos.${contest[0]}`, `We suspended your Needer account because it breaks the Terms.${contest[1]}`], message, '/terms');
        }

        const reporters = await User.find({ _id: { $in: siblings.map((s) => s.reporterId) } }).select('name email locale').lean<Lean[]>();
        await Promise.all(
            reporters.map((r) =>
                tell(r, ['A tua denúncia foi analisada', 'Your report was reviewed'],
                    data.action === 'dismiss'
                        ? ['Obrigado pela denúncia. Analisámos o conteúdo e não encontrámos uma violação dos Termos.', 'Thanks for your report. We reviewed the content and found no breach of the Terms.']
                        : ['Obrigado pela denúncia. Analisámos o conteúdo e tomámos medidas.', 'Thanks for your report. We reviewed the content and took action.'],
                    '', '/')
            )
        );

        return NextResponse.json({ message: 'Decision saved', status, action });
    } catch (error) {
        console.error('Error handling report:', error);
        return NextResponse.json({ error: 'Failed to save decision' }, { status: 500 });
    }
}
