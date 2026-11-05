import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import ProApplication from '@/lib/models/ProApplication';
import { parseBody } from '@/lib/validation';
import { HOUR, rateLimit, tooManyRequests } from '@/lib/rateLimit';
import { proApplicationSchema } from '@/lib/proApplication';
import { createNotification } from '@/lib/notifications';
import { appUrl, noticeEmail, sendEmail } from '@/lib/email';

// GET: the signed-in user's own application (or null).
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const application = await ProApplication.findOne({ userId: (session.user as { id: string }).id })
        .select('-history -reviewedBy')
        .lean();
    return NextResponse.json({ application });
}

// POST: submit, or resubmit after "needs_info" / "rejected". Never changes the
// role — only an admin decision (PUT /api/admin/pro-applications/[id]) does.
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;
        if ((session.user as { role?: string }).role !== 'client') {
            return NextResponse.json({ error: 'Only client accounts can apply' }, { status: 403 });
        }

        const { data, error } = await parseBody(request, proApplicationSchema);
        if (error) return error;

        if (!(await rateLimit(`pro-application:${userId}`, 5, 24 * HOUR))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }

        await dbConnect();
        const existing = await ProApplication.findOne({ userId }).select('status').lean<{ status: string }>();
        if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
            return NextResponse.json({ error: 'You already have an application under review' }, { status: 409 });
        }

        const now = new Date();
        // `declaration` isn't in the schema, so Mongoose drops it.
        const fields = data;
        await ProApplication.findOneAndUpdate(
            { userId },
            {
                $set: {
                    ...fields,
                    birthDate: new Date(fields.birthDate),
                    subcategory: fields.subcategory || '',
                    businessName: fields.businessName || '',
                    website: fields.website || '',
                    licenseNumber: fields.licenseNumber || '',
                    status: 'pending',
                    submittedAt: now,
                    adminMessage: '',
                },
                $push: { history: { status: 'pending', at: now, by: userId } },
            },
            { upsert: true }
        );

        const user = await User.findById(userId).select('name email locale').lean<{ name: string; email: string; locale?: string }>();
        if (user) {
            const pt = user.locale !== 'en';
            const mail = noticeEmail({
                pt,
                name: user.name,
                paragraphs: [
                    pt
                        ? 'Recebemos a tua candidatura a Pro. A nossa equipa vai analisá-la e responder-te por email, normalmente em poucos dias.'
                        : 'We received your Pro application. Our team will review it and reply by email, usually within a few days.',
                ],
                link: appUrl(`/${pt ? 'pt' : 'en'}/pro`),
                cta: pt ? 'Ver estado da candidatura' : 'View application status',
            });
            await sendEmail({ to: user.email, subject: pt ? 'Candidatura a Pro recebida' : 'Pro application received', ...mail });
        }

        // Tell every admin: an in-app notice plus an email with a link to the review page.
        const admins = await User.find({ role: 'admin', isDeleted: { $ne: true } }).select('_id name email').lean<{ _id: unknown; name: string; email: string }[]>();
        await Promise.all(
            admins.map(async (a) => {
                await createNotification(String(a._id), 'system', `New Pro application: ${fields.fullName}`);
                const mail = noticeEmail({
                    pt: true,
                    name: a.name,
                    paragraphs: [
                        `Nova candidatura a Pro de ${fields.fullName} (${fields.category}${fields.subcategory ? ' / ' + fields.subcategory : ''}, ${fields.district}).`,
                    ],
                    link: appUrl('/pt/admin'),
                    cta: 'Analisar candidatura',
                });
                await sendEmail({ to: a.email, subject: `Nova candidatura a Pro: ${fields.fullName}`, ...mail });
            })
        );

        return NextResponse.json({ message: 'Application submitted', status: 'pending' }, { status: 201 });
    } catch (error) {
        console.error('Error submitting pro application:', error);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}
