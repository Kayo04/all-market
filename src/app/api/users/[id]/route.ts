import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// GET: Public profile
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findById(id)
            .select('name role isVerified bio skills location avatar ratings createdAt')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// PUT: Update own profile
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const currentUser = session.user as { id: string };

        if (currentUser.id !== id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const body = await request.json();
        const { name, bio, skills, locationLabel } = body;

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (skills) updateData.skills = skills;
        if (locationLabel) updateData['location.label'] = locationLabel;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true })
            .select('name role isVerified bio skills location avatar')
            .lean();

        return NextResponse.json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
