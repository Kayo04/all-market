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
