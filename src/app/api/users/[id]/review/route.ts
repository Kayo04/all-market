import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { createNotification } from '@/lib/notifications';

// POST /api/users/[id]/review — submit a review for a professional
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
        const currentUser = session.user as { id: string; name?: string };

        // Can't review yourself
        if (currentUser.id === proId) {
            return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
        }

        const body = await request.json();
        const { score, comment } = body;

        if (!score || score < 1 || score > 5) {
            return NextResponse.json({ error: 'Score must be between 1 and 5' }, { status: 400 });
        }

        await dbConnect();

        const pro = await User.findById(proId);
        if (!pro) {
            return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
        }

        // Check if this user already reviewed this pro
        const alreadyReviewed = pro.ratings?.some(
            (r: { userId?: { toString(): string } }) => r.userId?.toString() === currentUser.id
        );
        if (alreadyReviewed) {
            return NextResponse.json({ error: 'You already reviewed this professional' }, { status: 409 });
        }

        // Add the review
        pro.ratings.push({
            userId: currentUser.id,
            score: Math.round(score),
            comment: comment?.trim() || '',
            createdAt: new Date(),
        });

        // Recalculate aggregate rating
        const totalScores = pro.ratings.reduce(
            (sum: number, r: { score: number }) => sum + r.score, 0
        );
        pro.rating = Math.round((totalScores / pro.ratings.length) * 10) / 10;

        await pro.save();

        // Notify the professional
        await createNotification(
            proId,
            'new_review',
            `${currentUser.name || 'A client'} left a ${score}-star review: "${(comment || '').slice(0, 60)}${(comment || '').length > 60 ? '...' : ''}"`,
            proId
        );

        return NextResponse.json({
            success: true,
            message: 'Review submitted',
            newRating: pro.rating,
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
