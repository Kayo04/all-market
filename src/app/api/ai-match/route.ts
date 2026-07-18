import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import UserModel from '@/lib/models/User';
import RequestModel from '@/lib/models/Request';
import ProposalModel from '@/lib/models/Proposal';
import { createNotification } from '@/lib/notifications';

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
// AI system prompt
// When GEMINI_API_KEY is present, this drives real Gemini calls.
// The entire switch is in categorize() — no other code change needed.
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Needer AI, a marketplace categorization engine. 
Given a natural language request in any language, extract structured data and write a friendly response.

Return ONLY a valid JSON object with this exact shape:
{
  "category": "home-repairs|tech-digital|tutoring|events|wellness|business|design|writing|cleaning|automotive|beauty|equipment",
  "subcategory": "electricians|plumbers|painters|locksmiths|furniture-assembly|websites|social-media|computer-repair|math|english|music|exam-prep|photographers|djs|catering|venue-rental|personal-trainers|massage|dog-walking|accounting|legal|logo|illustration|copywriting|translation|house-cleaning|office-cleaning|mechanic|car-wash|hairdresser|makeup|automotive|gaming|smartphones|laptops|product",
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
- when type is "product", category MUST be "equipment" (never a service category) — subcategory is "automotive" for vehicles, "gaming" for consoles/games, "smartphones" for phones, "laptops" for computers, or "product" for anything else
- budget: extract the euro amount as a plain number (handle "k" as ×1000); null if not mentioned
- city: detect Portuguese city names (Porto, Lisboa, Braga, Coimbra, Faro, Aveiro, Setúbal, Guimarães); default to "Porto"
- responseMessage: empathetic, confirms understanding, mentions the city and urgency if relevant`;

// ─────────────────────────────────────────────────────────────────────────────
// Keyword-based mock categorizer
// Used when GEMINI_API_KEY is not set. Covers the 95% case for a PT marketplace.
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
// Gemini categorizer
// Auto-activates when GEMINI_API_KEY is present in .env — zero code changes needed.
// Uses Gemini's free tier (no billing/payment method required), unlike OpenAI.
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-flash-latest';

async function geminiCategorize(query: string, locale: string): Promise<ParsedQuery | null> {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_API_KEY!,
                },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    contents: [{ parts: [{ text: `User query (locale: ${locale}): "${query}"` }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.2,
                        maxOutputTokens: 800,
                        thinkingConfig: { thinkingBudget: 0 },
                    },
                }),
            }
        );

        if (!res.ok) {
            console.warn('[ai-match] Gemini returned', res.status, '— falling back to mock');
            return null;
        }

        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) return null;

        return JSON.parse(raw) as ParsedQuery;
    } catch (err) {
        console.warn('[ai-match] Gemini error — falling back to mock:', err);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Central categorize() — the single switch point
// ─────────────────────────────────────────────────────────────────────────────

async function categorize(query: string, locale: string): Promise<ParsedQuery> {
    // If GEMINI_API_KEY is set, try the live model first; gracefully fall back to mock on any error
    if (process.env.GEMINI_API_KEY) {
        const result = await geminiCategorize(query, locale);
        if (result) return result;
    }
    // No key → always mock
    return mockCategorize(query, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock pro roster — used as a fallback when the DB has no matching professionals.
// Guarantees the full chat-to-match loop works in development without seeding.
// Slot 0 is ALWAYS the Quality Gate Sponsored Pro (hasSponsoredSpot + rating≥4.5).
// ─────────────────────────────────────────────────────────────────────────────

type MockPro = {
    _id: string;
    name: string;
    rating: number;
    proCategory: string;
    isVerified: boolean;
    hasSponsoredSpot: boolean;
    isSponsored: boolean;
    locationLabel: string;
};

const MOCK_PROS: Record<string, MockPro[]> = {
    electricians: [
        { _id: 'mock-elec-1', name: 'Electro Solutions', rating: 4.9, proCategory: 'electricians', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
        { _id: 'mock-elec-2', name: 'José Ramos',        rating: 4.7, proCategory: 'electricians', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
        { _id: 'mock-elec-3', name: 'G&M Electricidade', rating: 4.5, proCategory: 'electricians', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Matosinhos' },
    ],
    plumbers: [
        { _id: 'mock-plumb-1', name: 'AquaFix Pro',      rating: 4.9, proCategory: 'plumbers', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
        { _id: 'mock-plumb-2', name: 'Carlos Canalização', rating: 4.6, proCategory: 'plumbers', isVerified: true, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Gaia' },
        { _id: 'mock-plumb-3', name: 'Rui & Filhos',     rating: 4.4, proCategory: 'plumbers', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
    ],
    painters: [
        { _id: 'mock-paint-1', name: 'Colour Masters',   rating: 4.8, proCategory: 'painters', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Lisboa' },
        { _id: 'mock-paint-2', name: 'Pintura Nobre',    rating: 4.6, proCategory: 'painters', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Lisboa' },
        { _id: 'mock-paint-3', name: 'SR Pinturas',      rating: 4.3, proCategory: 'painters', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Cascais' },
    ],
    locksmiths: [
        { _id: 'mock-lock-1', name: 'KeyMaster 24h',     rating: 4.9, proCategory: 'locksmiths', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
        { _id: 'mock-lock-2', name: 'Fechaduras Express', rating: 4.7, proCategory: 'locksmiths', isVerified: true, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
        { _id: 'mock-lock-3', name: 'Serralharia Mota',  rating: 4.4, proCategory: 'locksmiths', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
    ],
    'house-cleaning': [
        { _id: 'mock-clean-1', name: 'CleanHome Elite',  rating: 4.9, proCategory: 'house-cleaning', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
        { _id: 'mock-clean-2', name: 'Brilho Total',     rating: 4.7, proCategory: 'house-cleaning', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
        { _id: 'mock-clean-3', name: 'Maria Limpezas',   rating: 4.5, proCategory: 'house-cleaning', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Gaia' },
    ],
    'office-cleaning': [
        { _id: 'mock-oclean-1', name: 'OfficeClean Pro', rating: 4.8, proCategory: 'office-cleaning', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Lisboa' },
        { _id: 'mock-oclean-2', name: 'Limpeza Corporativa', rating: 4.6, proCategory: 'office-cleaning', isVerified: true, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Lisboa' },
        { _id: 'mock-oclean-3', name: 'CleanBiz',        rating: 4.3, proCategory: 'office-cleaning', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Sintra' },
    ],
    websites: [
        { _id: 'mock-web-1', name: 'DevStudio Porto',    rating: 4.9, proCategory: 'websites', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
        { _id: 'mock-web-2', name: 'Pedro Oliveira Dev', rating: 4.7, proCategory: 'websites', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Remote' },
        { _id: 'mock-web-3', name: 'WebCraft PT',        rating: 4.5, proCategory: 'websites', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Lisboa' },
    ],
    mechanic: [
        { _id: 'mock-mech-1', name: 'AutoTech Premium',  rating: 4.9, proCategory: 'mechanic', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
        { _id: 'mock-mech-2', name: 'Oficina Central',   rating: 4.6, proCategory: 'mechanic', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
        { _id: 'mock-mech-3', name: 'Rui Mecânico',      rating: 4.4, proCategory: 'mechanic', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Gaia' },
    ],
    'personal-trainers': [
        { _id: 'mock-pt-1', name: 'FitPro Lisbon',       rating: 4.9, proCategory: 'personal-trainers', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Lisboa' },
        { _id: 'mock-pt-2', name: 'Ana Fitness',         rating: 4.7, proCategory: 'personal-trainers', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Lisboa' },
        { _id: 'mock-pt-3', name: 'GymCoach PT',         rating: 4.4, proCategory: 'personal-trainers', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Cascais' },
    ],
};

// Fallback for any subcategory not in the table above
const MOCK_PROS_GENERIC: MockPro[] = [
    { _id: 'mock-gen-1', name: 'TopPro Services',        rating: 4.9, proCategory: 'general', isVerified: true,  hasSponsoredSpot: true,  isSponsored: true,  locationLabel: 'Porto' },
    { _id: 'mock-gen-2', name: 'Profissionais Needer',   rating: 4.6, proCategory: 'general', isVerified: true,  hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Porto' },
    { _id: 'mock-gen-3', name: 'Expert Network PT',      rating: 4.4, proCategory: 'general', isVerified: false, hasSponsoredSpot: false, isSponsored: false, locationLabel: 'Lisboa' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock proposal injection — auto-creates proposals for demo completeness
// Only fires when using mock pros (i.e. DB has no real pros yet)
// ─────────────────────────────────────────────────────────────────────────────

const PROPOSAL_MESSAGES = [
    { en: "Hi! I'm available right now and can start immediately. I have extensive experience with this type of work. Looking forward to helping you!", pt: "Olá! Estou disponível agora mesmo e posso começar imediatamente. Tenho vasta experiência neste tipo de trabalho. Estou ansioso por ajudar!" },
    { en: "Hello! I saw your request and it's exactly the kind of job I specialize in. I can offer a competitive rate and guarantee quality work. Let me know!", pt: "Olá! Vi o seu pedido e é exatamente o tipo de trabalho em que me especializo. Posso oferecer um preço competitivo e garantir qualidade. Contacte-me!" },
    { en: "Good day! I'd love to help with this. I'm a verified professional with great reviews. I can come by today if needed.", pt: "Bom dia! Adoraria ajudar com isto. Sou um profissional verificado com ótimas avaliações. Posso ir hoje se necessário." },
];

async function injectMockProposals(requestId: string, pros: MockPro[], locale: string, budget: number) {
    // Only inject for mock pros (real DB pros shouldn't get fake proposals)
    const mockPros = pros.filter(p => p._id.startsWith('mock-'));
    if (mockPros.length === 0) return;

    // Create 2-3 proposals with staggered delays
    const count = Math.min(mockPros.length, Math.floor(Math.random() * 2) + 2);
    for (let i = 0; i < count; i++) {
        const pro = mockPros[i];
        const delay = 3000 + Math.random() * 7000; // 3-10 seconds
        const priceVariation = 0.85 + Math.random() * 0.30;
        const price = budget > 0 ? Math.round(budget * priceVariation) : Math.round(30 + Math.random() * 70);
        const msgTemplate = PROPOSAL_MESSAGES[i % PROPOSAL_MESSAGES.length];
        const message = locale === 'pt' ? msgTemplate.pt : msgTemplate.en;

        setTimeout(async () => {
            try {
                await dbConnect();

                // Upsert the mock pro as a real User so we have a valid ObjectId
                const dbPro = await UserModel.findOneAndUpdate(
                    { email: `${pro._id}@mock.needer.com` },
                    {
                        $setOnInsert: {
                            name: pro.name,
                            email: `${pro._id}@mock.needer.com`,
                            password: 'mock-no-login',
                            role: 'pro',
                            proCategory: pro.proCategory,
                            isVerified: pro.isVerified,
                            hasSponsoredSpot: pro.hasSponsoredSpot,
                            rating: pro.rating,
                            locationLabel: pro.locationLabel,
                            bio: `Professional ${pro.proCategory} services. Demo account.`,
                            skills: [pro.proCategory],
                        },
                    },
                    { upsert: true, new: true }
                );

                await ProposalModel.create({
                    requestId,
                    proId: dbPro._id,
                    message,
                    price,
                });
            } catch (err) {
                console.warn('[ai-match] Mock proposal injection failed:', err);
            }
        }, delay);
    }
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

            // Slot 1 — Sponsored AI Match (Quality Gate): hasSponsoredSpot=true AND rating≥4.5
            const sponsored = await UserModel.findOne({
                role: 'pro',
                hasSponsoredSpot: true,
                rating: { $gte: 4.5 },
                ...catFilter,
            })
                .select('name rating proCategory isVerified hasSponsoredSpot avatar locationLabel')
                .lean();

            // Slots 2–3 — Organic: best-rated in category (excluding sponsored)
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

            // ── Fallback: DB has no pros yet → serve mock roster ──────────
            if (pros.length === 0) {
                pros = MOCK_PROS[parsed.subcategory] ?? MOCK_PROS_GENERIC;
            }
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
                // `requestId` is captured by the closure below, which makes TypeScript widen every
                // read of the outer `let` back to `string | undefined` — read straight off `doc`
                // instead of round-tripping through `requestId` so this stays typed as `string`.
                const persistedRequestId = doc._id.toString();
                requestId = persistedRequestId;

                // Auto-inject mock proposals for demo completeness
                if (pros.length > 0 && pros[0]._id?.toString().startsWith('mock-')) {
                    injectMockProposals(persistedRequestId, pros as MockPro[], locale, parsed.budget ?? 0);
                }

                // Notify real pros whose proCategory matches this request (independent of the
                // display-limited `pros` slots, which may be capped/mock — notify everyone who qualifies)
                if (parsed.type === 'service') {
                    const matchingPros = await UserModel.find({ role: 'pro', proCategory: parsed.subcategory })
                        .select('_id')
                        .lean();

                    const notifyContent = locale === 'pt'
                        ? `Novo pedido na tua categoria: "${query.slice(0, 80)}"`
                        : `New request in your category: "${query.slice(0, 80)}"`;

                    await Promise.all(
                        matchingPros.map(p => createNotification(p._id.toString(), 'new_request', notifyContent, persistedRequestId))
                    );
                }
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
            usingLiveAI: !!process.env.GEMINI_API_KEY, // debug flag — can remove in production
        });
    } catch (error) {
        console.error('[ai-match] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
