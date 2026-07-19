import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
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
            .select('name role isVerified bio skills location locationLabel avatar ratings rating proCategory hasSponsoredSpot createdAt')
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

// DELETE: Erase own account (GDPR right to erasure)
//
// We anonymize in place rather than removing the document outright: other users'
// requests, proposals, messages, and reviews hold ObjectId references to this user
// (via populate('userId', ...) etc.), and the app doesn't defensively null-check
// those everywhere. A hard delete would leave dangling references and could crash
// pages that render e.g. request.userId.name. Anonymizing satisfies the erasure
// requirement (all personal data is gone) while keeping the app's data model intact.
export async function DELETE(
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

        // Unusable password — random UUID hashed, never given to anyone — plus the
        // isDeleted flag (checked in NextAuth's authorize()) means this account can
        // never log in again even if the hash were somehow guessed.
        const unusablePassword = await bcrypt.hash(randomUUID(), 12);

        const user = await User.findByIdAndUpdate(id, {
            name: 'Deleted User',
            email: `deleted-${id}@needer.invalid`,
            password: unusablePassword,
            phone: '',
            bio: '',
            skills: [],
            avatar: '',
            locationLabel: '',
            proCategory: '',
            isVerified: false,
            verificationStatus: 'none',
            verificationData: undefined,
            isDeleted: true,
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Account deleted' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
