import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';
import { appUrl, noticeEmail, sendEmail } from '@/lib/email';
import { HOUR, MINUTE, rateLimit } from '@/lib/rateLimit';

type NotificationType =
    | 'new_proposal'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'new_message'
    | 'request_closed'
    | 'new_review'
    | 'system'
    | 'new_request'
    | 'request_expiring'
    | 'request_expired';

type PrefKey = 'proposals' | 'messages' | 'newRequests' | 'reviews';

// Which user-facing preference toggle governs each notification type.
// 'system' is absent on purpose — those are always delivered (see User schema).
const PREF_FOR_TYPE: Partial<Record<NotificationType, PrefKey>> = {
    new_proposal: 'proposals',
    proposal_accepted: 'proposals',
    proposal_rejected: 'proposals',
    request_closed: 'proposals',
    new_message: 'messages',
    new_request: 'newRequests',
    new_review: 'reviews',
};

export async function createNotification(
    userId: string,
    type: NotificationType,
    content: string,
    relatedId?: string
) {
    try {
        await dbConnect();

        const user = await User.findById(userId)
            .select('name email locale isDeleted notificationPrefs')
            .lean<NotifiedUser>();
        if (!user || user.isDeleted) return;

        const prefKey = PREF_FOR_TYPE[type];
        // Default to sending when the field is absent — existing accounts predate this
        // schema addition and shouldn't silently stop receiving notifications.
        if (prefKey && user.notificationPrefs?.[prefKey] === false) return;

        await Notification.create({
            userId,
            type,
            content,
            relatedId: relatedId || undefined,
        });

        await sendNotificationEmail(user, type, relatedId);
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

interface NotifiedUser {
    _id: unknown;
    name: string;
    email: string;
    locale?: 'pt' | 'en';
    isDeleted?: boolean;
    notificationPrefs?: Record<string, boolean>;
}

// Which notifications also go out by email. The rest (proposal not chosen, job
// marked complete, system) stay in-app only — emailing them would be noise.
// `throttle` caps emails per window so a busy chat or category can't flood an inbox;
// the in-app notification is still created every time.
const EMAIL_FOR_TYPE: Partial<Record<NotificationType, {
    subject: [string, string];
    body: [string, string];
    cta: [string, string];
    path: (relatedId: string) => string;
    throttle?: { key: string; limit: number; windowMs: number };
}>> = {
    new_proposal: {
        subject: ['Recebeste uma nova proposta', 'You received a new proposal'],
        body: ['Um profissional enviou uma proposta para o teu pedido "{title}".', 'A professional sent a proposal for your request "{title}".'],
        cta: ['Ver proposta', 'View proposal'],
        path: (id) => `/requests/${id}`,
    },
    proposal_accepted: {
        subject: ['A tua proposta foi aceite', 'Your proposal was accepted'],
        body: ['O cliente escolheu-te para o pedido "{title}". Combina os pormenores com ele pelas mensagens.', 'The client chose you for the request "{title}". Arrange the details with them through messages.'],
        cta: ['Ver pedido', 'View request'],
        path: (id) => `/requests/${id}`,
    },
    new_message: {
        subject: ['Tens uma nova mensagem', 'You have a new message'],
        body: ['Recebeste uma mensagem sobre o pedido "{title}".', 'You received a message about the request "{title}".'],
        cta: ['Ler mensagem', 'Read message'],
        path: () => '/messages',
        throttle: { key: 'message', limit: 1, windowMs: 15 * MINUTE },
    },
    new_request: {
        subject: ['Novo pedido na tua área', 'New request in your field'],
        body: ['Alguém precisa de: "{title}". Envia a tua proposta antes dos outros.', 'Someone needs: "{title}". Send your proposal before the others.'],
        cta: ['Ver pedido', 'View request'],
        path: (id) => `/requests/${id}`,
        throttle: { key: 'new-request', limit: 20, windowMs: 24 * HOUR },
    },
    new_review: {
        subject: ['Recebeste uma nova avaliação', 'You received a new review'],
        body: ['Um cliente deixou uma avaliação no teu perfil.', 'A client left a review on your profile.'],
        cta: ['Ver avaliação', 'View review'],
        path: (id) => `/users/${id}`,
    },
    // Not governed by a preference toggle: they are about the client's own request.
    request_expiring: {
        subject: ['O teu pedido fecha daqui a 5 dias', 'Your request closes in 5 days'],
        body: [
            'O teu pedido "{title}" fecha automaticamente daqui a 5 dias. Ainda precisas? Renova-o por mais 30 dias com um clique.',
            'Your request "{title}" closes automatically in 5 days. Still need it? Renew it for another 30 days with one click.',
        ],
        cta: ['Renovar pedido', 'Renew request'],
        path: (id) => `/requests/${id}`,
    },
    request_expired: {
        subject: ['O teu pedido fechou', 'Your request has closed'],
        body: [
            'O teu pedido "{title}" fechou ao fim de 30 dias e deixou de receber propostas. Se ainda precisas, podes reabri-lo.',
            'Your request "{title}" closed after 30 days and no longer receives proposals. If you still need it, you can reopen it.',
        ],
        cta: ['Ver pedido', 'View request'],
        path: (id) => `/requests/${id}`,
    },
};

async function sendNotificationEmail(user: NotifiedUser, type: NotificationType, relatedId?: string) {
    const tpl = EMAIL_FOR_TYPE[type];
    if (!tpl || !relatedId) return;

    const uid = String(user._id);
    if (tpl.throttle) {
        // Per conversation for messages, per pro for new requests.
        const scope = type === 'new_message' ? `${uid}:${relatedId}` : uid;
        if (!(await rateLimit(`email-${tpl.throttle.key}:${scope}`, tpl.throttle.limit, tpl.throttle.windowMs))) return;
    }

    let title = '';
    if (type !== 'new_review') {
        const req = await RequestModel.findById(relatedId).select('title').lean<{ title: string }>();
        title = (req?.title || '').slice(0, 80);
    }

    const pt = user.locale !== 'en';
    const i = pt ? 0 : 1;
    const { html, text } = noticeEmail({
        pt,
        name: user.name,
        paragraphs: [tpl.body[i].replace('{title}', title)],
        link: appUrl(`/${pt ? 'pt' : 'en'}${tpl.path(relatedId)}`),
        cta: tpl.cta[i],
        footer: pt
            ? 'Podes escolher que avisos recebes nas Definições da tua conta.'
            : 'You can choose which notices you receive in your account Settings.',
    });
    await sendEmail({ to: user.email, subject: tpl.subject[i], html, text });
}

// The reverse-marketplace mechanic: when a request goes live, every pro working
// in its subcategory (or who registered the whole category) is pinged to come bid.
// Runs for every request regardless of how it was created — it used to live only
// in the concierge path, so requests posted through the form reached nobody.
export async function notifyMatchingPros(request: {
    _id: { toString(): string };
    userId: { toString(): string };
    title: string;
    category: string;
    subcategory: string;
}) {
    try {
        await dbConnect();
        const pros = await User.find({
            role: 'pro',
            isDeleted: { $ne: true },
            proCategory: { $in: [request.subcategory, request.category] },
            _id: { $ne: request.userId },
        })
            .select('_id')
            .lean();

        const content = `New request in your category: "${request.title.slice(0, 80)}"`;
        await Promise.all(
            pros.map((p) => createNotification(String(p._id), 'new_request', content, request._id.toString()))
        );
    } catch (error) {
        console.error('Failed to notify matching pros:', error);
    }
}
