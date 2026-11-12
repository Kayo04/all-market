import dbConnect from '@/lib/db';
import RequestModel from '@/lib/models/Request';
import { createNotification } from '@/lib/notifications';

// An open request stays open for this long; the client is warned WARN_DAYS_BEFORE
// days ahead and can renew it (another full lifetime from that moment).
export const REQUEST_LIFETIME_DAYS = 30;
export const WARN_DAYS_BEFORE = 5;

const DAY_MS = 24 * 60 * 60 * 1000;
// Caps one run so it fits a serverless function's time limit; leftovers go next day.
const BATCH = 300;

export function newExpiryDate(from = new Date()) {
    return new Date(from.getTime() + REQUEST_LIFETIME_DAYS * DAY_MS);
}

interface ExpiringRequest {
    _id: unknown;
    title: string;
    userId?: { _id: unknown; locale?: 'pt' | 'en' } | null;
}

const notice = (type: 'request_expiring' | 'request_expired', r: ExpiringRequest) => {
    if (!r.userId) return;
    const pt = r.userId.locale !== 'en';
    const title = r.title.slice(0, 80);
    const content = type === 'request_expiring'
        ? pt ? `O teu pedido "${title}" fecha daqui a ${WARN_DAYS_BEFORE} dias. Renova-o se ainda precisares.` : `Your request "${title}" closes in ${WARN_DAYS_BEFORE} days. Renew it if you still need it.`
        : pt ? `O teu pedido "${title}" fechou ao fim de ${REQUEST_LIFETIME_DAYS} dias. Podes reabri-lo.` : `Your request "${title}" closed after ${REQUEST_LIFETIME_DAYS} days. You can reopen it.`;
    return createNotification(String(r.userId._id), type, content, String(r._id));
};

// Daily job: backfill, warn, expire. Every write is conditional, so two overlapping
// runs never send the same notice twice.
export async function runRequestExpiry(now = new Date()) {
    await dbConnect();
    const warnBefore = new Date(now.getTime() + WARN_DAYS_BEFORE * DAY_MS);

    // Requests created before expiry existed: 30 days from creation, but never
    // sooner than WARN_DAYS_BEFORE from now, so every client gets the warning first.
    const backfill = await RequestModel.updateMany(
        { status: 'open', expiresAt: { $exists: false } },
        [{ $set: { expiresAt: { $max: [{ $add: ['$createdAt', REQUEST_LIFETIME_DAYS * DAY_MS] }, warnBefore] } } }],
    );

    const toWarn = await RequestModel.find({
        status: 'open',
        removedAt: null,
        expiryWarnedAt: null,
        expiresAt: { $gt: now, $lte: warnBefore },
    })
        .select('title userId')
        .populate('userId', 'locale')
        .limit(BATCH)
        .lean<ExpiringRequest[]>();

    let warned = 0;
    for (const r of toWarn) {
        const res = await RequestModel.updateOne({ _id: r._id, expiryWarnedAt: null }, { expiryWarnedAt: now });
        if (res.modifiedCount === 1) {
            await notice('request_expiring', r);
            warned++;
        }
    }

    const toExpire = await RequestModel.find({ status: 'open', expiresAt: { $lte: now } })
        .select('title userId removedAt')
        .populate('userId', 'locale')
        .limit(BATCH)
        .lean<(ExpiringRequest & { removedAt?: Date })[]>();

    let expired = 0;
    for (const r of toExpire) {
        const res = await RequestModel.updateOne({ _id: r._id, status: 'open' }, { status: 'expired' });
        if (res.modifiedCount === 1) {
            if (!r.removedAt) await notice('request_expired', r);
            expired++;
        }
    }

    return { backfilled: backfill.modifiedCount, warned, expired };
}
