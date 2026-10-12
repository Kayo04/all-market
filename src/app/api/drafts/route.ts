import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import ProposalDraft from '@/lib/models/ProposalDraft';
import { z } from 'zod';
import { euros, isObjectId, objectId, parseBody, text } from '@/lib/validation';

const draftFields = {
    title: text(120),
    message: text(2000),
    defaultPrice: euros.optional(),
    category: text(60, 0).optional(),
};
const createDraftSchema = z.object(draftFields);
const updateDraftSchema = z.object({ id: objectId, ...draftFields });

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

        const { data, error } = await parseBody(request, createDraftSchema);
        if (error) return error;
        const { title, message, defaultPrice, category } = data;

        await dbConnect();

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

        const { data, error } = await parseBody(request, updateDraftSchema);
        if (error) return error;
        const { id, title, message, defaultPrice, category } = data;

        await dbConnect();

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

        if (!isObjectId(id)) {
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
