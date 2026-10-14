import { NextResponse } from 'next/server';
import { z } from 'zod';
import { avatarUrl, isObjectId, parseBody, phone, skills, text } from '@/lib/validation';
import { isValidProCategory } from '@/lib/categories';

// Whitelist of self-editable fields. zod strips everything else, so this can't be
// used to set role, isVerified, rating, etc.
const profileSchema = z.object({
    bio: text(1000, 0).optional(),
    skills: skills.optional(),
    proCategory: z.union([z.literal(''), z.string().refine(isValidProCategory, 'Unknown category')]).optional(),
    locationLabel: text(80, 0).optional(),
    phone: phone.optional(),
    avatar: avatarUrl.optional(),
});
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// PATCH /api/users/[id]/profile — update profile fields (onboarding + settings)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!isObjectId(id)) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const currentUserId = (session.user as { id: string }).id;

        // Users can only update their own profile
        if (currentUserId !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: update, error } = await parseBody(request, profileSchema);
        if (error) return error;

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findByIdAndUpdate(id, update, { new: true })
            .select('name email role bio skills proCategory locationLabel phone avatar isVerified')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
