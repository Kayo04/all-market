import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Proposal from '@/lib/models/Proposal';
import RequestModel from '@/lib/models/Request';
import { callGeminiJSON } from '@/lib/gemini';

interface CompareResult {
    recommendedProposalId: string;
    summary: string;
    highlights?: string[];
}

const SYSTEM_PROMPT = `You are Needer AI, an impartial assistant helping a client on the Needer marketplace choose between competing job proposals from professionals.

You will be given the client's request (title, description, budget, urgency) and a list of pending proposals, each with: proposalId, the pro's name, their price, whether they are verified, their average rating and review count, and their proposal message.

Your job: recommend the single BEST VALUE proposal — NOT simply the cheapest one. Weigh price against the pro's reputation (rating, review count, verification status) and how well their message addresses the request. A slightly higher price from a verified, highly-rated pro is often better value than the lowest bid from an unverified pro with no reviews. Avoid rewarding a pure race-to-the-bottom on price.

Return ONLY a valid JSON object with this exact shape:
{
  "recommendedProposalId": "<the exact proposalId string of your pick>",
  "summary": "<2-4 sentence explanation of why this is the best value, written in the requested locale>",
  "highlights": ["<short phrase>", "<short phrase>", "<short phrase>"]
}

Rules:
- recommendedProposalId MUST be exactly one of the proposalId values provided — never invent one.
- summary must be written in the language indicated by "Locale for your response" (pt = European Portuguese, en = English).
- highlights: 1-3 short phrases (3-6 words each), e.g. "Best rated of the group", "€15 above lowest bid, but verified", "Only verified professional".
- Be honest and specific — reference actual price and rating differences, don't use generic filler.`;

function errorPayload(locale: string) {
    return {
        error: locale === 'pt'
            ? 'A comparação por IA não está disponível de momento. Tenta novamente daqui a pouco.'
            : 'AI comparison unavailable right now, please try again shortly.',
    };
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const currentUserId = (session.user as { id: string }).id;

        const body = await request.json().catch(() => ({}));
        const requestId: string | undefined = body?.requestId;
        const locale: string = body?.locale === 'pt' ? 'pt' : 'en';

        if (!requestId) {
            return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
        }

        await dbConnect();

        const reqDoc = await RequestModel.findById(requestId).lean();
        if (!reqDoc) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }
        const reqData = reqDoc as {
            userId: { toString(): string };
            title: string; description: string;
            budget: number; fixedPrice?: number; urgency?: string;
        };

        if (reqData.userId.toString() !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const proposals = await Proposal.find({ requestId, status: 'pending' })
            .populate('proId', 'name isVerified verificationStatus rating ratings')
            .lean();

        if (proposals.length < 2) {
            return NextResponse.json({ error: 'Need at least 2 pending proposals to compare' }, { status: 400 });
        }

        const proposalLines = proposals.map((p) => {
            const pro = p.proId as unknown as {
                name: string; isVerified?: boolean; verificationStatus?: string;
                rating?: number; ratings?: { score: number }[];
            };
            const avgRating = pro.rating ??
                (pro.ratings?.length ? pro.ratings.reduce((s, r) => s + r.score, 0) / pro.ratings.length : null);
            const pid = (p as { _id: { toString(): string } })._id.toString();
            return `proposalId: ${pid}
pro: ${pro.name}
price: €${p.price}
verified: ${pro.isVerified ? 'yes' : 'no'} (status: ${pro.verificationStatus ?? 'none'})
rating: ${avgRating != null ? avgRating.toFixed(1) : 'no ratings yet'} (${pro.ratings?.length ?? 0} reviews)
message: "${p.message}"`;
        }).join('\n\n');

        const userMessage = `Request: "${reqData.title}"
Description: ${reqData.description}
Budget: €${reqData.fixedPrice ?? reqData.budget ?? 'not specified'}
Urgency: ${reqData.urgency ?? 'Normal'}
Locale for your response: ${locale}

Pending proposals:
${proposalLines}`;

        const result = await callGeminiJSON<CompareResult>(SYSTEM_PROMPT, userMessage, { maxOutputTokens: 800 });

        if (!result?.recommendedProposalId || !result?.summary) {
            return NextResponse.json(errorPayload(locale), { status: 503 });
        }

        // Defensive: never trust the model to reference a real DB id without checking —
        // a hallucinated/mismatched id would silently fail to highlight any ProposalCard,
        // which is confusing rather than an honest error.
        const validIds = new Set(proposals.map(p => (p as { _id: { toString(): string } })._id.toString()));
        if (!validIds.has(result.recommendedProposalId)) {
            return NextResponse.json(errorPayload(locale), { status: 503 });
        }

        return NextResponse.json({
            recommendedProposalId: result.recommendedProposalId,
            summary: result.summary,
            highlights: result.highlights ?? [],
        });
    } catch (error) {
        console.error('[proposals/compare] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
