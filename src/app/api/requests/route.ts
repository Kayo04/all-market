import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import RequestModel from '@/lib/models/Request';
import UserModel from '@/lib/models/User';

// GET: List/filter requests (with geospatial queries)
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status') || 'open';
        const mine = searchParams.get('mine');
        const lng = searchParams.get('lng');
        const lat = searchParams.get('lat');
        const radius = searchParams.get('radius'); // in km
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (mine === '1') {
            const session = await getServerSession(authOptions);
            if (session?.user) {
                query.userId = (session.user as { id: string }).id;
            }
        } else {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        // Geospatial query: find requests near a point
        if (lng && lat && radius) {
            query.location = {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseFloat(radius) * 1000,
                },
            };
        }

        // ── Sniper Bidding filter ─────────────────────────────────────────
        // Non-premium users only see requests after their 1-hour sniper window.
        // Premium snipers (isPremiumSniper=true) can see ALL fresh requests.
        // Only applies when browsing (not when fetching own requests with mine=1).
        if (mine !== '1') {
            const session = await getServerSession(authOptions);
            let isPremiumSniper = false;

            if (session?.user) {
                const userId = (session.user as { id: string }).id;
                const user = await UserModel.findById(userId).select('isPremiumSniper').lean() as { isPremiumSniper?: boolean } | null;
                isPremiumSniper = user?.isPremiumSniper ?? false;
            }

            if (!isPremiumSniper) {
                // Show only requests past their sniper window, OR legacy requests without a publicReleaseDate
                query.$or = [
                    { publicReleaseDate: { $lte: new Date() } },
                    { publicReleaseDate: null },
                    { publicReleaseDate: { $exists: false } },
                ];
            }
            // isPremiumSniper=true → no filter, they see everything
        }

        // Featured requests first, then by date
        const requests = await RequestModel.find(query)
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name avatar')
            .lean();

        const total = await RequestModel.countDocuments(query);

        return NextResponse.json({
            requests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch requests' },
            { status: 500 }
        );
    }
}

// POST: Create a new request
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const {
            title,
            description,
            category,
            subcategory,
            budget,
            fixedPrice,
            urgency,
            intentConfirmed,
            location,
            locationLabel,
            itemCondition,
            acceptsTrades,
        } = body;

        if (!title || !description || !category || !subcategory || budget === undefined || !location) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const userId = (session.user as { id: string }).id;

        const newRequest = await RequestModel.create({
            title,
            description,
            category,
            subcategory,
            budget,
            fixedPrice: fixedPrice ?? budget,
            urgency: urgency || 'Normal',
            intentConfirmed: intentConfirmed === true,
            location,
            locationLabel: locationLabel || '',
            userId,
            itemCondition: itemCondition || undefined,
            acceptsTrades: acceptsTrades !== undefined ? acceptsTrades : undefined,
        });

        return NextResponse.json(
            { message: 'Request created', request: newRequest },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating request:', error);
        return NextResponse.json(
            { error: 'Failed to create request' },
            { status: 500 }
        );
    }
}
