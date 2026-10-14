import mongoose, { Schema, models } from 'mongoose';
import dbConnect from '@/lib/db';

// Fixed-window rate limiter stored in MongoDB, so every server instance (Vercel
// runs many) shares the same counters — an in-memory Map only limited one
// instance. One document per key per window; MongoDB's TTL monitor deletes it
// once the window is over (it runs about once a minute, so expired docs can
// linger briefly — harmless, the window id in _id already moved on).
const RateLimitSchema = new Schema(
    {
        _id: { type: String },
        count: { type: Number, required: true },
        expiresAt: { type: Date, required: true, expires: 0 },
    },
    { versionKey: false }
);

const RateLimit = models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;

// Returns true if the call is allowed, false once `limit` calls were made in the
// current `windowMs` window for this key.
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    await dbConnect();
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    const id = `${key}:${windowStart}`;
    const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs) } };

    let doc;
    try {
        doc = await RateLimit.findOneAndUpdate({ _id: id }, update, { upsert: true, returnDocument: 'after', lean: true });
    } catch (err) {
        // Two first hits racing on the same new key: one upsert wins, the other
        // gets a duplicate-key error — retrying finds the doc and increments it.
        if ((err as { code?: number }).code !== 11000) throw err;
        doc = await RateLimit.findOneAndUpdate({ _id: id }, update, { returnDocument: 'after', lean: true });
    }
    return (doc?.count ?? 0) <= limit;
}

// Client IP as seen by the platform's proxy (Vercel sets x-forwarded-for; the
// first entry is the original client).
export function clientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
    const raw = headers instanceof Headers ? headers.get('x-forwarded-for') : headers['x-forwarded-for'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.split(',')[0].trim() || 'unknown';
}

export const tooManyRequests = { error: 'Too many attempts. Please try again later.' };
