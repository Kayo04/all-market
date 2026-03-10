import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Message from '@/lib/models/Message';
import { createNotification } from '@/lib/notifications';

// GET: Fetch messages
// ?requestId=X — conversation thread for a request
// ?conversations=1 — list of conversations (inbox)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');
        const conversations = searchParams.get('conversations');

        if (conversations === '1') {
            // Get unique conversations: group by requestId, return last message
            const pipeline = [
                {
                    $match: {
                        $or: [
                            { senderId: new (await import('mongoose')).default.Types.ObjectId(userId) },
                            { receiverId: new (await import('mongoose')).default.Types.ObjectId(userId) },
                        ],
                    },
                },
                { $sort: { createdAt: -1 as const } },
                {
                    $group: {
                        _id: '$requestId',
                        lastMessage: { $first: '$$ROOT' },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$receiverId', new (await import('mongoose')).default.Types.ObjectId(userId)] },
                                            { $eq: ['$readAt', null] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
                { $sort: { 'lastMessage.createdAt': -1 as const } },
            ];

            const convos = await Message.aggregate(pipeline);

            // Populate request and user info
            const populated = await Message.populate(convos, [
                { path: '_id', model: 'Request', select: 'title category' },
                { path: 'lastMessage.senderId', model: 'User', select: 'name avatar' },
                { path: 'lastMessage.receiverId', model: 'User', select: 'name avatar' },
            ]);

            return NextResponse.json({ conversations: populated });
        }

        if (requestId) {
            // Get messages for a specific request conversation
            const messages = await Message.find({
                requestId,
                $or: [{ senderId: userId }, { receiverId: userId }],
            })
                .sort({ createdAt: 1 })
                .populate('senderId', 'name avatar')
                .populate('receiverId', 'name avatar')
                .lean();

            // Mark messages as read
            await Message.updateMany(
                { requestId, receiverId: userId, readAt: null },
                { readAt: new Date() }
            );

            return NextResponse.json({ messages });
        }

        return NextResponse.json({ error: 'requestId or conversations param required' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as { id: string; name?: string };
        await dbConnect();

        const body = await request.json();
        const { receiverId, requestId, content } = body;

        if (!receiverId || !requestId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const message = await Message.create({
            senderId: user.id,
            receiverId,
            requestId,
            content: content.trim(),
        });

        // Notify receiver
        await createNotification(
            receiverId,
            'new_message',
            `${user.name || 'Someone'}: ${content.substring(0, 60)}${content.length > 60 ? '...' : ''}`,
            requestId
        );

        return NextResponse.json(
            { message: 'Message sent', data: message },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
