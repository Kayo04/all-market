import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { runRequestExpiry } from '@/lib/requestExpiry';

// Called once a day by Vercel Cron (vercel.json), which sends
// `Authorization: Bearer $CRON_SECRET`. Without the secret configured the route
// refuses everything, so it can never be triggered by a stranger.
export const dynamic = 'force-dynamic';

const digest = (s: string) => createHash('sha256').update(s).digest();

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    const given = request.headers.get('authorization') ?? '';
    if (!secret || !timingSafeEqual(digest(given), digest(`Bearer ${secret}`))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await runRequestExpiry();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Request expiry job failed:', error);
        return NextResponse.json({ error: 'Job failed' }, { status: 500 });
    }
}
