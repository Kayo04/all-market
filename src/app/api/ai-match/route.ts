import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedQuery {
    category: string;
    subcategory: string;
    type: 'service' | 'product';
    urgency: 'Normal' | 'High' | 'Urgent';
    budget: number | null;
    tags: string[];
    city: string;
    responseMessage: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI system prompt
// When OPENAI_API_KEY is present, this drives real GPT-4o-mini calls.
// The entire switch is in categorize() — no other code change needed.
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Needer AI, a marketplace categorization engine. 
Given a natural language request in any language, extract structured data and write a friendly response.

Return ONLY a valid JSON object with this exact shape:
{
  "category": "home-repairs|tech-digital|tutoring|events|wellness|business|design|writing|cleaning|automotive|beauty",
  "subcategory": "electricians|plumbers|painters|locksmiths|furniture-assembly|websites|social-media|computer-repair|math|english|music|exam-prep|photographers|djs|catering|venue-rental|personal-trainers|massage|dog-walking|accounting|legal|logo|illustration|copywriting|translation|house-cleaning|office-cleaning|mechanic|car-wash|hairdresser|makeup",
  "type": "service|product",
  "urgency": "Normal|High|Urgent",
  "budget": <number_in_euros_or_null>,
  "tags": ["relevant", "keyword", "tags"],
  "city": "<detected_city_or_Porto>",
  "responseMessage": "<warm 1-2 sentence reply in the SAME language as the query>"
}

Rules:
- urgency: "Urgent" = emergency/now/sparks/flood/broken; "High" = today/soon/this week; "Normal" = default
- type: "product" when user wants to BUY a physical object; "service" when they need someone to DO something
- budget: extract the euro amount as a plain number (handle "k" as ×1000); null if not mentioned
- city: detect Portuguese city names (Porto, Lisboa, Braga, Coimbra, Faro, Aveiro, Setúbal, Guimarães); default to "Porto"
- responseMessage: empathetic, confirms understanding, mentions the city and urgency if relevant`;

// ─────────────────────────────────────────────────────────────────────────────
// Keyword-based mock categorizer
// Used when OPENAI_API_KEY is not set. Covers the 95% case for a PT marketplace.
// ─────────────────────────────────────────────────────────────────────────────

const PROF_LABELS: Record<string, { en: string; pt: string }> = {
    electricians: { en: 'electricians', pt: 'eletricistas' },
    plumbers: { en: 'plumbers', pt: 'canalizadores' },
    painters: { en: 'painters', pt: 'pintores' },
    locksmiths: { en: 'locksmiths', pt: 'serralheiros' },
    'furniture-assembly': { en: 'assembly pros', pt: 'profissionais de montagem' },
    'house-cleaning': { en: 'cleaners', pt: 'serviços de limpeza' },
    'office-cleaning': { en: 'office cleaners', pt: 'limpeza de escritórios' },
    websites: { en: 'web developers', pt: 'web developers' },
    'social-media': { en: 'social media managers', pt: 'gestores de redes sociais' },
    'computer-repair': { en: 'tech specialists', pt: 'técnicos informáticos' },
    accounting: { en: 'accountants', pt: 'contabilistas' },
    legal: { en: 'lawyers', pt: 'advogados' },
    mechanic: { en: 'mechanics', pt: 'mecânicos' },
    'car-wash': { en: 'car detailers', pt: 'lavagem automóvel' },
    photographers: { en: 'photographers', pt: 'fotógrafos' },
    logo: { en: 'designers', pt: 'designers' },
    'personal-trainers': { en: 'personal trainers', pt: 'personal trainers' },
    massage: { en: 'massage therapists', pt: 'massagistas' },
    'dog-walking': { en: 'dog walkers', pt: 'passeadores de cães' },
    hairdresser: { en: 'hairdressers', pt: 'cabeleireiros' },
};

function mockCategorize(query: string, locale: string): ParsedQuery {
    const q = query.toLowerCase();

    // ── Type: product vs service ───────────────────────────────────────────
    const PRODUCT_KW = [
        'comprar', 'quero comprar', 'want to buy', 'looking to buy', 'find me', 'get me', 'purchase',
        'bmw', 'mercedes', 'audi', 'volkswagen', 'vw', 'peugeot', 'honda', 'toyota', 'renault', 'opel',
        'ford', 'seat', 'skoda', 'volvo', 'fiat', 'kia', 'hyundai', 'nissan',
        'ps5', 'playstation', 'xbox', 'nintendo', 'switch', 'gaming',
        'iphone', 'samsung', 'xiaomi', 'google pixel', 'macbook', 'laptop', 'portátil', 'computador',
        'rolex', 'omega', 'casio', 'watch', 'relógio',
        'sofa', 'sofá', 'furniture', 'móvel', 'frigorífico', 'máquina de lavar',
        'television', 'televisão', 'tv', 'monitor', 'mota', 'motorcycle', 'motorbike',
    ];
    const isProduct = PRODUCT_KW.some(kw => q.includes(kw));

    // ── Urgency ────────────────────────────────────────────────────────────
    const URGENT_KW = [
        'urgente', 'urgentemente', 'urgency', 'urgent', 'emergency', 'emergência',
        'right now', 'agora mesmo', 'imediatamente', 'immediately', 'asap',
        'faísca', 'sparks', 'sparking', 'spark', 'fogo', 'fire', 'flood', 'flooding',
        'inundação', 'sem água', 'sem luz', 'no water', 'no power', 'power cut',
        'está a pingar', 'a vazar', 'leak', 'leaking', 'cano rebentou', 'pipe burst',
        'fechei-me fora', 'locked out', 'chave partida', 'key broke',
    ];
    const HIGH_KW = [
        'hoje', 'today', 'amanhã', 'tomorrow', 'esta semana', 'this week',
        'o mais rápido', 'as soon as', 'soon', 'brevemente', 'rapidamente', 'quickly',
    ];
    const urgency: 'Normal' | 'High' | 'Urgent' = URGENT_KW.some(kw => q.includes(kw))
        ? 'Urgent'
        : HIGH_KW.some(kw => q.includes(kw))
            ? 'High'
            : 'Normal';

    // ── Budget ─────────────────────────────────────────────────────────────
    const budgetMatch = q.match(
        /(?:under|below|max|up\s*to|até|abaixo\s*de|menos\s*de|máximo\s*de|€|eur)\s*(\d+(?:[.,]\d+)?)\s*(k|mil)?/i
    );
    let budget: number | null = null;
    if (budgetMatch) {
        budget = parseFloat(budgetMatch[1].replace(',', '.'));
        if (budgetMatch[2]) budget *= 1000;
    }

    // ── City ───────────────────────────────────────────────────────────────
    const CITY_MAP: Record<string, string> = {
        porto: 'Porto', lisboa: 'Lisboa', lisbon: 'Lisboa',
        braga: 'Braga', coimbra: 'Coimbra', faro: 'Faro',
        aveiro: 'Aveiro', setubal: 'Setúbal', setúbal: 'Setúbal',
        guimarães: 'Guimarães', guimaraes: 'Guimarães',
        viseu: 'Viseu', leiria: 'Leiria', évora: 'Évora', evora: 'Évora',
    };
    const city = Object.entries(CITY_MAP).find(([kw]) => q.includes(kw))?.[1] ?? 'Porto';

    // ── Category + subcategory ─────────────────────────────────────────────
    let category = 'home-repairs';
    let subcategory = 'general';
    const tags: string[] = [];

    if (!isProduct) {
        if (q.match(/electri|eletri|eletric|electrical|wiring|socket|fuse|circuit|faísca|lâmpada|candeeiro|sem\s*luz|no\s*power|power\s*cut|disjuntor/)) {
            category = 'home-repairs'; subcategory = 'electricians'; tags.push('electrician');
        } else if (q.match(/plumb|canalizad|pipe|cano|leak|a\s*pingar|vazar|water\s*damage|flood|inundação|toilet|sanita|bathroom|casa\s*de\s*banho|clog|drain|saneamento/)) {
            category = 'home-repairs'; subcategory = 'plumbers'; tags.push('plumber');
        } else if (q.match(/paint|pintor|parede|ceiling|tecto|room|quarto|tinta|repintar|reparação\s*parede/)) {
            category = 'home-repairs'; subcategory = 'painters'; tags.push('painter');
        } else if (q.match(/locksmith|serralheiro|lock|fechadura|key|chave|locked\s*out|fechei|porta|arrombamento/)) {
            category = 'home-repairs'; subcategory = 'locksmiths'; tags.push('locksmith');
        } else if (q.match(/furniture|móvel|ikea|assem|montag|estante|cama|wardrobe|guarda-roupa/)) {
            category = 'home-repairs'; subcategory = 'furniture-assembly'; tags.push('assembly');
        } else if (q.match(/clean|limpeza|domestic|house\s*clean|escritório|office\s*clean/)) {
            if (q.match(/escrit|office/)) { category = 'cleaning'; subcategory = 'office-cleaning'; }
            else { category = 'cleaning'; subcategory = 'house-cleaning'; }
            tags.push('cleaning');
        } else if (q.match(/website|web\s*dev|developer|programm|code|app|software|react|wordpress|wix|squarespace|landing\s*page/)) {
            category = 'tech-digital'; subcategory = 'websites'; tags.push('dev');
        } else if (q.match(/social\s*media|instagram|facebook|tiktok|content|marketing|reels|influencer|redes\s*sociais/)) {
            category = 'tech-digital'; subcategory = 'social-media'; tags.push('marketing');
        } else if (q.match(/computer|pc\s*repair|phone\s*repair|telemóvel\s*part|laptop\s*repair|vírus|lento|slow|crashed/)) {
            category = 'tech-digital'; subcategory = 'computer-repair'; tags.push('tech-repair');
        } else if (q.match(/accountant|accounting|tax|contabil|fiscal|irs|finanças|balance|irc|iva/)) {
            category = 'business'; subcategory = 'accounting'; tags.push('accounting');
        } else if (q.match(/lawyer|legal|contract|law|advogado|jurídico|tribunal|contrato|society/)) {
            category = 'business'; subcategory = 'legal'; tags.push('legal');
        } else if (q.match(/tutor|lesson|aula|math|matemática|english|inglês|physics|física|exam|exame|guitar|guitarra|piano/)) {
            category = 'tutoring'; subcategory = 'math'; tags.push('tutoring');
        } else if (q.match(/photog|foto|wedding|casamento|event\s*photo|retrato|portrait/)) {
            category = 'events'; subcategory = 'photographers'; tags.push('photographer');
        } else if (q.match(/mechanic|car\s*repair|auto\s*repair|engine|mecânico|oficina|revisão auto/)) {
            category = 'automotive'; subcategory = 'mechanic'; tags.push('mechanic');
        } else if (q.match(/car\s*wash|lavagem|detailing|polish|polimento|car\s*clean/)) {
            category = 'automotive'; subcategory = 'car-wash'; tags.push('car-wash');
        } else if (q.match(/trainer|gym|fitness|personal\s*train|treino|workout|exercício/)) {
            category = 'wellness'; subcategory = 'personal-trainers'; tags.push('fitness');
        } else if (q.match(/massage|massagem|massagista|fisio|fisioterapia|therapeutic/)) {
            category = 'wellness'; subcategory = 'massage'; tags.push('massage');
        } else if (q.match(/dog\s*walk|passeador|cão|cachorro|pet\s*sit|dog\s*sit/)) {
            category = 'wellness'; subcategory = 'dog-walking'; tags.push('pets');
        } else if (q.match(/logo|branding|design|graphic|identidade|brand|visual|poster|flyer/)) {
            category = 'design'; subcategory = 'logo'; tags.push('design');
        } else if (q.match(/haircut|hairdress|cabeleireiro|barbeiro|barber|cabelo|hair/)) {
            category = 'beauty'; subcategory = 'hairdresser'; tags.push('beauty');
        }
    } else {
        // Product — map to virtual category for AI tag purposes
        category = 'equipment';
        subcategory = q.match(/bmw|mercedes|audi|vw|volkswagen|peugeot|honda|car|carro|mota|moto/)
            ? 'automotive'
            : q.match(/ps5|playstation|xbox|nintendo|gaming|console/)
                ? 'gaming'
                : q.match(/iphone|samsung|xiaomi|phone|telemóvel|smartphone/)
                    ? 'smartphones'
                    : q.match(/laptop|macbook|portátil|computador|pc/)
                        ? 'laptops'
                        : 'product';
        tags.push('product', subcategory);
    }

    if (urgency !== 'Normal') tags.push(urgency.toLowerCase());
    tags.push(city.toLowerCase());

    // ── Response message ───────────────────────────────────────────────────
    let responseMessage: string;

    if (isProduct) {
        const budStr = budget
            ? locale === 'pt' ? ` abaixo de €${budget.toLocaleString('pt-PT')}` : ` under €${budget.toLocaleString()}`
            : '';
        responseMessage = locale === 'pt'
            ? `🔍 Percebi que procuras um produto${budStr}. Publiquei o teu pedido na rede Needer. Vendedores premium já o podem ver — os restantes serão notificados em 1 hora.`
            : `🔍 I see you're looking for a product${budStr}. I've posted your request to the Needer network. Premium sellers can already see it — others will be notified in 1 hour.`;
    } else {
        const prof = PROF_LABELS[subcategory];
        const profStr = prof
            ? locale === 'pt' ? prof.pt : prof.en
            : locale === 'pt' ? 'profissionais' : 'professionals';
        const urgencyStr = urgency === 'Urgent'
            ? locale === 'pt' ? 'disponíveis agora mesmo' : 'available right now'
            : locale === 'pt' ? `em ${city}` : `in ${city}`;

        responseMessage = locale === 'pt'
            ? `✅ Encontrei os melhores ${profStr} ${urgencyStr} para ti. O primeiro a aceitar fica com o trabalho.`
            : `✅ I found the top ${profStr} ${urgencyStr} for you. The first to accept gets the job.`;
    }

    return { category, subcategory, type: isProduct ? 'product' : 'service', urgency, budget, tags, city, responseMessage };
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI categorizer
// Auto-activates when OPENAI_API_KEY is present in .env — zero code changes needed.
// ─────────────────────────────────────────────────────────────────────────────

async function openAICategorize(query: string, locale: string): Promise<ParsedQuery | null> {
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `User query (locale: ${locale}): "${query}"` },
                ],
                temperature: 0.2,
                max_tokens: 450,
            }),
        });

        if (!res.ok) {
            console.warn('[ai-match] OpenAI returned', res.status, '— falling back to mock');
            return null;
        }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content;
        if (!raw) return null;

        return JSON.parse(raw) as ParsedQuery;
    } catch (err) {
        console.warn('[ai-match] OpenAI error — falling back to mock:', err);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Central categorize() — the single switch point
// ─────────────────────────────────────────────────────────────────────────────

async function categorize(query: string, locale: string): Promise<ParsedQuery> {
    // If OPENAI_API_KEY is set, try the live model first; gracefully fall back to mock on any error
    if (process.env.OPENAI_API_KEY) {
        const result = await openAICategorize(query, locale);
        if (result) return result;
    }
    // No key → always mock
    return mockCategorize(query, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai-match
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const query: string = body?.query?.trim();
        const locale: string = body?.locale ?? 'en';

        if (!query) {
            return NextResponse.json({ error: 'query is required' }, { status: 400 });
        }

        // ── 1. Categorize ──────────────────────────────────────────────────
        const parsed = await categorize(query, locale);

        await dbConnect();

        // ── 2. Find matching Pros (services only) ──────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pros: any[] = [];

        if (parsed.type === 'service') {
            const catFilter = parsed.subcategory && parsed.subcategory !== 'general'
                ? { proCategory: parsed.subcategory }
                : {};

            // Slot 1 — Sponsored AI Match: hasSponsoredSpot=true AND rating≥4.5
            const sponsored = await UserModel.findOne({
                role: 'pro',
                hasSponsoredSpot: true,
                rating: { $gte: 4.5 },
                ...catFilter,
            })
                .select('name rating proCategory isVerified hasSponsoredSpot avatar locationLabel')
                .lean();

            // Slots 2–3 — Organic: best rating in category (excluding sponsored)
            const organicFilter = {
                role: 'pro',
                ...(sponsored ? { _id: { $ne: (sponsored as { _id: unknown })._id } } : {}),
                ...catFilter,
            };
            const organic = await UserModel.find(organicFilter)
                .select('name rating proCategory isVerified hasSponsoredSpot avatar locationLabel')
                .sort({ rating: -1 })
                .limit(sponsored ? 2 : 3)
                .lean();

            pros = [
                ...(sponsored ? [{ ...sponsored, isSponsored: true }] : []),
                ...organic.map(p => ({ ...p, isSponsored: false })),
            ];
        }

        // ── 3. Persist request to DB (only if user is logged in) ──────────
        let requestId: string | undefined;
        const session = await getServerSession(authOptions);

        if (session?.user) {
            const userId = (session.user as { id: string }).id;
            try {
                const doc = await RequestModel.create({
                    title: query.slice(0, 120),
                    description: query,
                    category: parsed.category,
                    subcategory: parsed.subcategory,
                    budget: parsed.budget ?? 0,
                    fixedPrice: parsed.budget ?? 0,
                    type: parsed.type,
                    urgency: parsed.urgency,
                    aiTags: parsed.tags,
                    location: { type: 'Point', coordinates: [0, 0] },
                    locationLabel: parsed.city,
                    userId,
                });
                requestId = doc._id.toString();
            } catch (err) {
                // Don't crash the AI response if request persistence fails
                console.warn('[ai-match] Could not persist request:', err);
            }
        }

        // ── 4. Return AI response ──────────────────────────────────────────
        return NextResponse.json({
            message: parsed.responseMessage,
            category: parsed.category,
            subcategory: parsed.subcategory,
            type: parsed.type,
            urgency: parsed.urgency,
            budget: parsed.budget,
            tags: parsed.tags,
            city: parsed.city,
            pros,
            requestId,
            isProduct: parsed.type === 'product',
            usingLiveAI: !!process.env.OPENAI_API_KEY, // debug flag — can remove in production
        });
    } catch (error) {
        console.error('[ai-match] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
