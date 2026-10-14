import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import RequestModel from '@/lib/models/Request';
import Proposal from '@/lib/models/Proposal';
import { z } from 'zod';
import { getCategoryType, isValidSubcategory } from '@/lib/categories';
import { DISTRICT_KEYS, getDistrict } from '@/lib/districts';
import { notifyMatchingPros } from '@/lib/notifications';
import { euros, parseBody, text, uploadedImageUrl } from '@/lib/validation';
import { HOUR, rateLimit, tooManyRequests } from '@/lib/rateLimit';

// GET: List/filter requests (with geospatial queries)
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const statusParam = searchParams.get('status') || 'open';
        const status = ['open', 'accepted', 'in_progress', 'closed'].includes(statusParam) ? statusParam : 'open';
        const district = searchParams.get('district');
        const mine = searchParams.get('mine');
        const lng = searchParams.get('lng');
        const lat = searchParams.get('lat');
        const radius = searchParams.get('radius'); // in km
        const q = searchParams.get('q')?.trim();
        // Clamp paging: an unbounded ?limit= lets anyone pull the whole collection in one call.
        const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
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
            query.category = String(category);
        }

        if (district) {
            query.district = String(district);
        }

        // Free-text search across the fields a browsing pro would actually scan.
        // This has to run in the DB, not client-side: the page only holds one
        // `limit`-sized slice, so filtering in the browser silently searches the
        // most recent 20 requests and hides everything older.
        // Input is escaped — an unescaped user string is a valid regex, so
        // something like "(((" throws and a ".*.*.*" pattern is a cheap DoS.
        if (q) {
            const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(safe, 'i');
            query.$or = [
                { title: rx },
                { description: rx },
                { aiTags: rx },
                { locationLabel: rx },
            ];
        }

        // Geospatial query: find requests near a point
        if (lng && lat && radius && [lng, lat, radius].every((v) => Number.isFinite(parseFloat(v)))) {
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

        // ── Sniper Bidding filter — disabled until Phase 5 (billing) ships ──
        // isPremiumSniper can never be true today (no purchase flow exists yet),
        // so gating on it would hide every fresh request from every visitor,
        // indefinitely, with no way through. Request.publicReleaseDate is still
        // stamped on creation (+1h) so this filter can be re-enabled once the
        // premium tier is actually purchasable — see api/requests/route.ts git
        // history for the previous implementation.

        // Featured requests first, then by date
        const requests = await RequestModel.find(query)
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name avatar')
            .lean();

        const total = await RequestModel.countDocuments(query);

        // Proposal counts aren't stored on the request document, so tally them
        // separately for the page of results being returned.
        const proposalCounts = await Proposal.aggregate([
            { $match: { requestId: { $in: requests.map((r) => r._id) } } },
            { $group: { _id: '$requestId', count: { $sum: 1 } } },
        ]);
        const countByRequestId = new Map(
            proposalCounts.map((p) => [p._id.toString(), p.count])
        );
        const requestsWithCounts = requests.map((r) => ({
            ...r,
            proposalCount: countByRequestId.get(r._id.toString()) || 0,
        }));

        return NextResponse.json({
            requests: requestsWithCounts,
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

// POST: Create a new request — the only way a request is ever written. The
// concierge only pre-fills the form (src/lib/categorize.ts); it no longer saves.
const createRequestSchema = z
    .object({
        title: text(120, 3),
        description: text(2000, 10),
        category: z.string(),
        subcategory: z.string(),
        budget: euros,
        urgency: z.enum(['Normal', 'High', 'Urgent']).default('Normal'),
        intentConfirmed: z.literal(true, { error: 'You must confirm your commitment' }),
        district: z.enum(DISTRICT_KEYS, { error: 'Choose a district' }),
        locationLabel: text(80, 0).optional(),
        itemCondition: z.enum(['new', 'used', 'any']).optional(),
        acceptsTrades: z.boolean().optional(),
        images: z.array(uploadedImageUrl).max(5, 'At most 5 photos').default([]),
    })
    .refine((b) => isValidSubcategory(b.category, b.subcategory), {
        message: 'Unknown category/subcategory',
        path: ['subcategory'],
    });

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await parseBody(request, createRequestSchema);
        if (error) return error;

        // Counted after validation, so a form rejected for bad input doesn't use up the quota.
        if (!(await rateLimit(`create-request:${(session.user as { id: string }).id}`, 10, HOUR))) {
            return NextResponse.json(tooManyRequests, { status: 429 });
        }

        await dbConnect();

        const userId = (session.user as { id: string }).id;
        const district = getDistrict(data.district)!;

        const newRequest = await RequestModel.create({
            title: data.title,
            description: data.description,
            category: data.category,
            subcategory: data.subcategory,
            budget: data.budget,
            fixedPrice: data.budget,
            type: getCategoryType(data.category),
            urgency: data.urgency,
            intentConfirmed: true,
            district: district.key,
            location: { type: 'Point', coordinates: district.coords },
            locationLabel: data.locationLabel || district.labelPT,
            userId,
            itemCondition: data.itemCondition,
            acceptsTrades: data.acceptsTrades,
            images: data.images,
        });

        await notifyMatchingPros(newRequest);

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
