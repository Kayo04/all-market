import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';

type NotificationType =
    | 'new_proposal'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'new_message'
    | 'request_closed';

export async function createNotification(
    userId: string,
    type: NotificationType,
    content: string,
    relatedId?: string
) {
    try {
        await dbConnect();
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
