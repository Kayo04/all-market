import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UTApi } from 'uploadthing/server';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const utapi = new UTApi();

// POST: Upload a single image to Uploadthing (cloud storage — local disk doesn't
// survive most deploys). Client contract (FormData 'file' in, { url } out) is
// unchanged so callers didn't need to change when this moved off local disk.
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const response = await utapi.uploadFiles(file);
        if (response.error || !response.data) {
            console.error('Uploadthing error:', response.error);
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
        }

        return NextResponse.json({ url: response.data.ufsUrl }, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
