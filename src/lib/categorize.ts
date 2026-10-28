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

// Explicit intent to BUY something (or a second-hand item). With it, product
// rules are tried first; without it, service rules win — "reparar o iPhone" is a
// repair, "iPhone 15 Pro Max" with no service word is a product.
const BUY_INTENT = /comprar|compro\b|want to buy|looking to buy|\bbuy\b|purchase|usad[oa]s?\b|segunda m[ãa]o|second.?hand|em bom estado|à venda|for sale/;

const URGENT_KW = [
    'urgente', 'urgentemente', 'urgent', 'emergency', 'emergência', 'hoje', 'today',
    'right now', 'agora mesmo', 'imediatamente', 'immediately', 'asap',
    'faísca', 'sparks', 'sparking', 'fogo', 'fire', 'flood', 'flooding',
    'inundação', 'sem água', 'sem luz', 'no water', 'no power', 'power cut',
    'está a pingar', 'a vazar', 'leaking', 'cano rebentou', 'pipe burst',
    'fechei-me fora', 'locked out', 'chave partida', 'key broke',
];

// [category, subcategory, pattern] — first match wins, so order matters:
// specific phrases before the generic words they contain ("limpeza pós-obra"
// before "obras" and "limpeza", "limpeza de pele" before "limpeza").
const SERVICE_RULES: [string, string, RegExp][] = [
    ['cleaning', 'post-construction', /p[óo]s-?obras?|after\s*construction/],
    ['beauty', 'aesthetics', /est[ée]tica|depila[çc]|limpeza\s*de\s*pele|facial|sobrancelha|pestana|waxing/],
    ['garden', 'land-clearing', /limpeza\s*d[eo]\s*terreno|limpar\s*(o\s*)?terreno|desmat|roçar|\bmato\b|land\s*clearing/],
    ['cleaning', 'upholstery', /estofo|limpeza\s*de\s*(sof[áa]|tapete|colch)|lavar\s*(o\s*)?(sof[áa]|tapete)|upholster|carpet\s*clean/],
    ['renovation', 'remodeling', /remodel|renova[çc]|\bobras?\b|renovat/],
    ['renovation', 'masonry', /pedreiro|alvenaria|reboco|azulej|ladrilh|mason|\btiles?\b|tiling/],
    ['renovation', 'roofing', /telhado|\btelhas?\b|infiltra[çc]|isolamento|impermeabiliz|\broof|capoto/],
    ['renovation', 'flooring', /pavimento|soalho|flutuante|vin[íi]lico|parquet|flooring/],
    ['renovation', 'hvac', /ar\s*condicionado|ar-condicionado|aquecimento|caldeira|bomba\s*de\s*calor|salamandra|lareira|air\s*con|heat\s*pump/],
    ['renovation', 'carpentry', /carpint|marcenar|carpenter|roupeiro\s*por\s*medida/],
    ['home-repairs', 'handyman', /faz-?tudo|handyman|pequenas\s*repara|biscates?/],
    ['home-repairs', 'appliance-repair', /(avari|repar|arranj|consert|repair|fix).{0,30}(frigor|m[áa]quina\s*de\s*(lavar|secar)|forno|micro-?ondas|eletrodom|fridge|washing\s*machine|dishwasher|dryer)|(frigor|m[áa]quina\s*de\s*lavar|eletrodom).{0,30}(avari|n[ãa]o\s*funciona|parou|broke)/],
    ['home-repairs', 'electricians', /electri|eletri|wiring|socket|fuse|circuit|faísca|lâmpada|candeeiro|sem\s*luz|no\s*power|power\s*cut|disjuntor|tomada/],
    ['home-repairs', 'plumbers', /plumb|canalizad|pipe|\bcano|leak|a\s*pingar|vazar|water\s*damage|flood|inundação|toilet|sanita|casa\s*de\s*banho|clog|drain|esquentador|torneira/],
    ['home-repairs', 'locksmiths', /locksmith|serralheir|fechadura|locked\s*out|fechei-me|arrombamento|chave\s*partida/],
    ['home-repairs', 'painters', /paint|pintor|pintar|repintar|tinta/],
    ['design', 'video-editing', /edi[çc][ãa]o\s*de\s*v[íi]deo|editar\s*(um\s*)?v[íi]deo|montagem\s*de\s*v[íi]deo|video\s*edit|youtube/],
    ['home-repairs', 'furniture-assembly', /furniture\s*assembl|montag|montar|ikea|estante|wardrobe|guarda-roupa/],
    ['travel', 'transfers', /transfer\b|motorista|aeroporto|chauffeur|airport/],
    ['travel', 'flights-hotels', /\bvoos?\b|\bflights?\b|alojamento|airbnb|\bhotel\b(?!\s*(para|de)\s*(c[ãa]es|animais|gatos))/],
    ['travel', 'packages', /f[ée]rias|viagem|pacote|cruzeiro|lua\s*de\s*mel|holiday|vacation|\btrip\b/],
    ['moving', 'junk-removal', /monos|entulho|recolha\s*de\s*(m[óo]veis|lixo)|desocupar|esvaziar\s*(a\s*)?casa|junk/],
    ['moving', 'house-moving', /mudan[çc]a|moving\s*house|house\s*move|removals?\b/],
    ['moving', 'freight', /transport|frete|carrinha|courier|\bvan\b|levar\s*(um|uma)\s/],
    ['cleaning', 'office-cleaning', /(limpeza|clean).*(escrit|office)|(escrit|office).*(limpeza|clean)/],
    ['cleaning', 'house-cleaning', /clean|limpeza|empregada|domestic/],
    ['garden', 'pools', /piscina|\bpool/],
    ['garden', 'pest-control', /desinfest|pragas?\b|baratas|ratos|t[ée]rmitas|formigas|vespas|\bpest/],
    ['garden', 'gardening', /jardi|relva|garden|\bpoda|podar|[áa]rvore|sebe|\brega\b|lawn/],
    ['pets', 'dog-training', /treino\s*canino|treinar\s*(o\s*)?c[ãa]o|adestra|dog\s*train/],
    ['pets', 'grooming', /tosquia|tosar|banho\s*(ao|do|para\s*o)\s*(c[ãa]o|gato)|grooming/],
    ['pets', 'dog-walking', /dog\s*walk|passeador|passear\s*(o\s*)?c[ãa]o/],
    ['pets', 'pet-sitting', /pet\s*sit|cat\s*sit|cuidar\s*d[oa]s?\s*(c[ãa]es?|gatos?|animais)|tomar\s*conta\s*d[oa]s?\s*(c[ãa]es?|gatos?)|hotel\s*(para|de)\s*(c[ãa]es|animais|gatos)/],
    ['family', 'babysitting', /babysit|baby-?sitter|\bama\b|nanny|tomar\s*conta\s*d[oa]s?\s*(beb[ée]|crian[çc]a|filh|mi[úu]d)/],
    ['family', 'elderly-care', /idos[oa]|s[ée]nior|cuidador|apoio\s*domicili|elderly|caregiver/],
    ['tech-digital', 'apps', /\bapps?\b|aplica[çc][ãa]o\s*(m[óo]vel|para\s*telem)|android\s*app|ios\s*app|mobile\s*app/],
    ['tech-digital', 'websites', /website|site\b|web\s*dev|developer|programad|loja\s*online|wordpress|shopify|landing\s*page/],
    ['tech-digital', 'social-media', /social\s*media|instagram|facebook|tiktok|redes\s*sociais|reels/],
    ['tech-digital', 'computer-repair', /computer\s*repair|pc\s*repair|phone\s*repair|reparar\s*(o\s*)?(pc|computador|portátil|telemóvel|iphone|ecr[ãa])|ecrã\s*partido|vírus|formatar/],
    ['tech-digital', 'it-support', /apoio\s*inform|suporte\s*inform|it\s*support|wi-?fi|router|impressora|printer|rede\s*(de\s*)?internet/],
    ['business', 'accounting', /accountant|accounting|contabil|\birs\b|\biva\b|finanças|recibos\s*verdes/],
    ['business', 'legal', /lawyer|advogad|jurídic|tribunal|contrato|contract/],
    ['business', 'marketing', /marketing|publicidade|google\s*ads|\bseo\b|an[úu]ncios|advertis/],
    ['tutoring', 'english', /english|inglês|ingles/],
    ['tutoring', 'other-languages', /franc[êe]s|alem[ãa]o|espanhol|italiano|mandarim|chin[êe]s|portugu[êe]s\s*para\s*estrangeiros|french|german|spanish/],
    ['tutoring', 'music', /aulas?\s*de\s*(guitarra|piano|m[úu]sica|canto|bateria|viol)|music\s*lesson|guitar\s*lesson|piano\s*lesson/],
    ['tutoring', 'exam-prep', /exame|exam\s*prep|exame\s*nacional/],
    ['tutoring', 'math', /tutor|explicaç|explicador|matemática|math|física|physics/],
    ['events', 'photographers', /photog|fotógraf|fotografia|sessão\s*fotográfica/],
    ['events', 'djs', /\bdj\b|músicos?\s*para|banda\s*para/],
    ['events', 'catering', /catering|buffet/],
    ['events', 'entertainment', /anima[çc][ãa]o|palha[çc]o|insufl[áa]ve|festa\s*infantil|anivers[áa]rio|m[áa]gico|magician/],
    ['events', 'wedding-planning', /casamento|wedding|wedding\s*planner|organiza[çc][ãa]o\s*de\s*eventos|event\s*planner/],
    ['events', 'venue-rental', /aluguer\s*de\s*(espa[çc]o|sala|quinta)|espa[çc]o\s*para\s*(festa|evento)|venue/],
    ['automotive', 'towing', /reboque|\btow(ing)?\b|assist[êe]ncia\s*em\s*viagem/],
    ['automotive', 'tires', /\bpneus?\b|tyres?|\btires?\b/],
    ['automotive', 'mechanic', /mechanic|mecânic|oficina|car\s*repair|revisão|travões|embraiagem|reparar\s*(o\s*)?(carro|mota)/],
    ['automotive', 'car-wash', /car\s*wash|lavagem\s*(auto|do\s*carro)|detailing|polimento/],
    ['wellness', 'yoga', /yoga|pilates|medita[çc]/],
    ['wellness', 'personal-trainers', /personal\s*train|treinador|ginásio|gym|fitness|treino/],
    ['wellness', 'massage', /massag/],
    ['design', 'interior-design', /design\s*de\s*interiores|decorador|interior\s*design/],
    ['design', 'logo', /logo|branding|identidade\s*visual|graphic\s*design|design\s*gráfico/],
    ['design', 'illustration', /ilustraç|illustrat/],
    ['writing', 'translation', /tradução|traduzir|translat/],
    ['writing', 'copywriting', /copywrit|textos\s*para|escrever\s*textos/],
    ['beauty', 'nails', /unhas|manicure|pedicure|verniz|\bnails?\b/],
    ['beauty', 'hairdresser', /haircut|hairdress|cabeleireir|barbeir|barber|corte\s*de\s*cabelo/],
    ['beauty', 'makeup', /maquilha|makeup|make-up/],
];

// Things people buy. Tried first when there's buying intent, otherwise only
// when no service matched.
const PRODUCT_RULES: [string, string, RegExp][] = [
    ['real-estate', 'rooms', /quarto\s*(para\s*)?(alugar|arrendar)|alugar\s*(um\s*)?quarto|room\s*for\s*rent/],
    ['real-estate', 'rent', /arrendar|arrendamento|alugar\s*(uma?\s*)?(casa|apartamento|moradia|t[0-5]\b)|for\s*rent|\brenda\b/],
    ['real-estate', 'buy-home', /(comprar|compro)\s*(uma?\s*)?(casa|apartamento|moradia|t[0-5]\b|terreno)|moradia|apartamento|\bt[0-5]\b|im[óo]vel/],
    ['vehicles', 'vehicle-parts', /pe[çc]as?\s*(auto|para\s*(o\s*)?(carro|mota))|jantes|car\s*parts|spare\s*parts/],
    ['vehicles', 'motorcycles', /\bmotas?\b|\bmotos?\b|motorbike|motorcycle|scooter|vespa|yamaha|kawasaki|ducati|harley/],
    ['vehicles', 'cars', /\bcarros?\b|autom[óo]vel|viatura|\bbmw\b|mercedes|\baudi\b|renault|peugeot|volkswagen|\bvw\b|\bseat\b|\bopel\b|toyota|\bfiat\b|\bford\b|citro[eë]n|tesla|nissan|\bkia\b|hyundai|skoda|volvo|dacia|\bcars?\b/],
    ['equipment', 'gaming', /ps5|ps4|playstation|xbox|nintendo|switch|gaming|consola/],
    ['equipment', 'tablets', /ipad|tablet/],
    ['equipment', 'smartphones', /iphone|samsung|xiaomi|pixel|smartphone|telem[óo]vel/],
    ['equipment', 'laptops', /laptop|macbook|port[áa]til|computador/],
    ['equipment', 'tv-audio', /\btv\b|televis|soundbar|colunas|auscultadores|headphones|airpods|home\s*cinema/],
    ['equipment', 'cameras', /c[âa]mara|camera|gopro|objetiva|\blente\b|drone/],
    ['home-goods', 'appliances', /frigor|m[áa]quina\s*de\s*(lavar|secar)|forno|micro-?ondas|aspirador|fridge|washing\s*machine|dishwasher/],
    ['home-goods', 'furniture', /sof[áa]|\bmesa\b|cadeira|\bcama\b|colch[ãa]o|m[óo]ve(l|is)|arm[áa]rio|c[ôo]moda|furniture/],
    ['home-goods', 'decor', /decora[çc]|candeeiro|tapete|\bquadros?\b|cortinas|\bdecor\b/],
    ['sports-leisure', 'bikes', /bicicleta|\bbikes?\b|trotinete|e-?scooter/],
    ['sports-leisure', 'instruments', /guitarra|piano|bateria\s*(ac[úu]stica|eletr[óo]nica)|violino|teclado\s*(musical|yamaha)|instrumento/],
    ['sports-leisure', 'sports-gear', /raquete|prancha|\bsurf\b|padel|halteres|passadeira|kayak|\bski\b|material\s*desportivo|sports\s*gear/],
    ['fashion', 'shoes', /sapatos|sapatilhas|\bt[ée]nis\b|botas|sneakers|shoes|nike|adidas/],
    ['fashion', 'accessories', /rel[óo]gio|\bmalas?\b|carteira|joias|j[óo]ias|[óo]culos\s*de\s*sol|\bwatch\b|handbag|jewel/],
    ['fashion', 'clothing', /roupa|vestido|casaco|camisola|cal[çc]as|t-shirt|clothes|\bdress\b|jacket/],
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

    const service = SERVICE_RULES.find(([, , rx]) => rx.test(q));
    const product = PRODUCT_RULES.find(([, , rx]) => rx.test(q));
    const rule = BUY_INTENT.test(q) ? product ?? service : service ?? product;
    if (rule) [category, subcategory] = rule;

    return {
        category,
        subcategory,
        district: detectDistrict(text),
        urgency: URGENT_KW.some((kw) => q.includes(kw)) ? 'Urgent' : 'Normal',
        budget: parseBudget(q),
    };
}
