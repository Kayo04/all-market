// Keyword-based reading of a free-text need ("o candeeiro fez faísca, preciso de
// eletricista em Gaia") into the fields of the new-request form. Pure and
// dependency-free so it runs in the browser: the concierge pre-fills
// /requests/new with it and the client confirms everything before anything is
// saved. No LLM by design (Gemini was removed on 2026-09-13 — ask the owner
// before reintroducing one).
//
// Every key returned is either a real key from categories.ts / districts.ts or
// '' meaning "not recognised — let the client pick". Never guess a default: a
// wrong category means the right pros are never notified.

import { detectDistrict } from '@/lib/districts';

export interface CategorizedNeed {
    category: string;
    subcategory: string;
    district: string;
    urgency: 'Normal' | 'Urgent';
    budget: number | null;
}

const PRODUCT_KW = [
    'comprar', 'quero comprar', 'want to buy', 'looking to buy', 'purchase',
    'ps5', 'playstation', 'xbox', 'nintendo', 'switch', 'gaming', 'consola',
    'iphone', 'samsung', 'xiaomi', 'google pixel', 'macbook', 'laptop', 'portátil',
];

const URGENT_KW = [
    'urgente', 'urgentemente', 'urgent', 'emergency', 'emergência', 'hoje', 'today',
    'right now', 'agora mesmo', 'imediatamente', 'immediately', 'asap',
    'faísca', 'sparks', 'sparking', 'fogo', 'fire', 'flood', 'flooding',
    'inundação', 'sem água', 'sem luz', 'no water', 'no power', 'power cut',
    'está a pingar', 'a vazar', 'leaking', 'cano rebentou', 'pipe burst',
    'fechei-me fora', 'locked out', 'chave partida', 'key broke',
];

// [category, subcategory, pattern] — first match wins, so order matters.
const SERVICE_RULES: [string, string, RegExp][] = [
    ['home-repairs', 'electricians', /electri|eletri|wiring|socket|fuse|circuit|faísca|lâmpada|candeeiro|sem\s*luz|no\s*power|power\s*cut|disjuntor|tomada/],
    ['home-repairs', 'plumbers', /plumb|canalizad|pipe|\bcano|leak|a\s*pingar|vazar|water\s*damage|flood|inundação|toilet|sanita|casa\s*de\s*banho|clog|drain|esquentador|torneira/],
    ['home-repairs', 'locksmiths', /locksmith|serralheir|fechadura|locked\s*out|fechei-me|arrombamento|chave\s*partida/],
    ['home-repairs', 'painters', /paint|pintor|pintar|repintar|tinta/],
    ['home-repairs', 'furniture-assembly', /furniture\s*assembl|montag|montar|ikea|estante|wardrobe|guarda-roupa/],
    ['cleaning', 'office-cleaning', /(limpeza|clean).*(escrit|office)|(escrit|office).*(limpeza|clean)/],
    ['cleaning', 'house-cleaning', /clean|limpeza|empregada|domestic/],
    ['tech-digital', 'websites', /website|site\b|web\s*dev|developer|programad|loja\s*online|wordpress|shopify|landing\s*page/],
    ['tech-digital', 'social-media', /social\s*media|instagram|facebook|tiktok|redes\s*sociais|reels/],
    ['tech-digital', 'computer-repair', /computer\s*repair|pc\s*repair|phone\s*repair|reparar\s*(o\s*)?(pc|computador|portátil|telemóvel)|ecrã\s*partido|vírus|formatar/],
    ['business', 'accounting', /accountant|accounting|contabil|\birs\b|\biva\b|finanças|recibos\s*verdes/],
    ['business', 'legal', /lawyer|advogad|jurídic|tribunal|contrato|contract/],
    ['tutoring', 'english', /english|inglês|ingles/],
    ['tutoring', 'music', /guitar|guitarra|piano|música|music\s*lesson|aulas\s*de\s*música/],
    ['tutoring', 'exam-prep', /exame|exam\s*prep|exame\s*nacional/],
    ['tutoring', 'math', /tutor|explicaç|explicador|matemática|math|física|physics/],
    ['events', 'photographers', /photog|fotógraf|fotografia|sessão\s*fotográfica/],
    ['events', 'djs', /\bdj\b|músicos?\s*para|banda\s*para/],
    ['events', 'catering', /catering|buffet/],
    ['automotive', 'mechanic', /mechanic|mecânic|oficina|car\s*repair|revisão|travões|embraiagem/],
    ['automotive', 'car-wash', /car\s*wash|lavagem\s*(auto|do\s*carro)|detailing|polimento/],
    ['wellness', 'personal-trainers', /personal\s*train|treinador|ginásio|gym|fitness|treino/],
    ['wellness', 'massage', /massag|fisioterap/],
    ['wellness', 'dog-walking', /dog\s*walk|passeador|passear\s*(o\s*)?cão|pet\s*sit/],
    ['design', 'logo', /logo|branding|identidade\s*visual|graphic\s*design|design\s*gráfico/],
    ['design', 'illustration', /ilustraç|illustrat/],
    ['writing', 'translation', /tradução|traduzir|translat/],
    ['writing', 'copywriting', /copywrit|textos\s*para|escrever\s*textos/],
    ['beauty', 'hairdresser', /haircut|hairdress|cabeleireir|barbeir|barber|corte\s*de\s*cabelo/],
    ['beauty', 'makeup', /maquilha|makeup|make-up/],
];

const PRODUCT_RULES: [string, RegExp][] = [
    ['gaming', /ps5|playstation|xbox|nintendo|switch|gaming|consola/],
    ['smartphones', /iphone|samsung|xiaomi|pixel|smartphone|telemóvel/],
    ['laptops', /laptop|macbook|portátil/],
];

function parseBudget(q: string): number | null {
    // Two shapes: a cue before the number ("até 150", "€150", "orçamento 150")
    // and a currency after it ("150 euros") — the latter is how PT users write it.
    const m =
        q.match(/(?:under|below|max|up\s*to|budget|até|abaixo\s*de|menos\s*de|máximo\s*de|or[çc]amento(?:\s*de)?|€)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(k|mil)?/i) ??
        q.match(/(\d+(?:[.,]\d+)?)\s*(k|mil)?\s*(?:€|eur(?:os?)?)/i);
    if (!m) return null;
    let n = parseFloat(m[1].replace(',', '.'));
    if (m[2]) n *= 1000;
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export function categorize(text: string): CategorizedNeed {
    const q = text.toLowerCase();

    let category = '';
    let subcategory = '';

    if (PRODUCT_KW.some((kw) => q.includes(kw))) {
        category = 'equipment';
        subcategory = PRODUCT_RULES.find(([, rx]) => rx.test(q))?.[0] ?? '';
    } else {
        const rule = SERVICE_RULES.find(([, , rx]) => rx.test(q));
        if (rule) [category, subcategory] = rule;
    }

    return {
        category,
        subcategory,
        district: detectDistrict(text),
        urgency: URGENT_KW.some((kw) => q.includes(kw)) ? 'Urgent' : 'Normal',
        budget: parseBudget(q),
    };
}
