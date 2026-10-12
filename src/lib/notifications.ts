import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';

type NotificationType =
    | 'new_proposal'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'new_message'
    | 'request_closed'
    | 'new_review'
    | 'system'
    | 'new_request';

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

        const prefKey = PREF_FOR_TYPE[type];
        if (prefKey) {
            const user = await User.findById(userId).select('notificationPrefs').lean();
            // Default to sending when the field is absent — existing accounts predate this
            // schema addition and shouldn't silently stop receiving notifications.
            const enabled = (user as { notificationPrefs?: Record<string, boolean> } | null)
                ?.notificationPrefs?.[prefKey];
            if (enabled === false) return;
        }

        await Notification.create({
            userId,
            type,
            content,
            relatedId: relatedId || undefined,
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
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
