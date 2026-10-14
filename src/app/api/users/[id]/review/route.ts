import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isObjectId, objectId, parseBody, text } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';
import { createNotification } from '@/lib/notifications';
import { HOUR, rateLimit, tooManyRequests } from '@/lib/rateLimit';

const reviewSchema = z.object({
    requestId: objectId,
    score: z.number().int('Score must be a whole number').min(1).max(5),
    comment: text(1000, 0).optional(),
});

// POST /api/users/[id]/review — the client reviews the pro who did a job for them.
//
// A review must be tied to a real, finished job: the reviewer owns the request,
// the request is closed, and this pro is the one whose proposal was accepted.
// Ratings decide trust (and, later, whether a pro keeps the verified badge), so
// "any signed-in user can rate any pro" — how this used to work — is not acceptable.
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: proId } = await params;
        if (!isObjectId(proId)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const currentUser = session.user as { id: string; name?: string };

        if (currentUser.id === proId) {
            return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
        }

        const { data, error } = await parseBody(request, reviewSchema);
        if (error) return error;

        // Counted after validation, so a form rejected for bad input doesn't use up the quota.
        if (!(await rateLimit(`review:${(session.user as { id: string }).id}`, 20, HOUR))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }

        const { requestId, score } = data;
        const comment = data.comment ?? '';

        await dbConnect();

        const job = await RequestModel.findById(requestId)
            .select('userId status acceptedByProId')
            .lean<{ userId: { toString(): string }; status: string; acceptedByProId?: { toString(): string } | null }>();

        if (
            !job ||
            job.userId.toString() !== currentUser.id ||
            job.status !== 'closed' ||
            job.acceptedByProId?.toString() !== proId
        ) {
            return NextResponse.json(
                { error: 'You can only review a professional after they completed a job for you' },
                { status: 403 }
            );
        }

        // One review per job — the filter makes the check-and-push atomic, so a
        // double submit can't add two ratings.
        const pushed = await User.updateOne(
            { _id: proId, 'ratings.requestId': { $ne: requestId } },
            { $push: { ratings: { userId: currentUser.id, requestId, score, comment, createdAt: new Date() } } }
        );
        if (pushed.matchedCount === 0) {
            return NextResponse.json({ error: 'You already reviewed this job' }, { status: 409 });
        }

        // Recalculate aggregate rating
        const pro = await User.findById(proId).select('ratings').lean<{ ratings: { score: number }[] }>();
        const ratings = pro?.ratings ?? [];
        const newRating = ratings.length
            ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
            : 0;
        await User.updateOne({ _id: proId }, { rating: newRating });

        // Notify the professional
        await createNotification(
            proId,
            'new_review',
            `${currentUser.name || 'A client'} left a ${score}-star review: "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`,
            proId
        );

        return NextResponse.json({
            success: true,
            message: 'Review submitted',
            newRating,
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
