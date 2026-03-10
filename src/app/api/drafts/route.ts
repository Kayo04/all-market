import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ProposalDraft from '@/lib/models/ProposalDraft';

// GET: All drafts for the current pro
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string };
        if (user.role !== 'pro') {
            return NextResponse.json({ error: 'Only professionals can access drafts' }, { status: 403 });
        }

        await dbConnect();

        const drafts = await ProposalDraft.find({ proId: user.id })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ drafts });
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }
}

// POST: Create a new draft template
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string };
        if (user.role !== 'pro') {
            return NextResponse.json({ error: 'Only professionals can create drafts' }, { status: 403 });
        }

        await dbConnect();

        const body = await request.json();
        const { title, message, defaultPrice, category } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        const draft = await ProposalDraft.create({
            proId: user.id,
            title,
            message,
            defaultPrice: defaultPrice || undefined,
            category: category || '',
        });

        return NextResponse.json({ message: 'Draft created', draft }, { status: 201 });
    } catch (error) {
        console.error('Error creating draft:', error);
        return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
    }
}

// PUT: Update a draft
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string };

        await dbConnect();

        const body = await request.json();
        const { id, title, message, defaultPrice, category } = body;

        if (!id) {
            return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
        }

        const draft = await ProposalDraft.findOneAndUpdate(
            { _id: id, proId: user.id },
            { title, message, defaultPrice, category },
            { new: true }
        );

        if (!draft) {
            return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Draft updated', draft });
    } catch (error) {
        console.error('Error updating draft:', error);
        return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
    }
}

// DELETE: Delete a draft
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; role: string };

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 });
        }

        const draft = await ProposalDraft.findOneAndDelete({ _id: id, proId: user.id });

        if (!draft) {
            return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Draft deleted' });
    } catch (error) {
        console.error('Error deleting draft:', error);
        return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
    }
}
