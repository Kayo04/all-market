// Portugal's 18 mainland districts plus the two autonomous regions — the unit a
// request is located by. Deliberately coarse: pros filter by district, nobody's
// street address is collected, and no geocoding API is needed. Concelhos can be
// layered on later without changing this list.
//
// `coords` is the district capital as GeoJSON [lng, lat]. It's stored on the
// Request so the existing 2dsphere index / radius queries keep working — but it
// is an approximation of the district, never the client's actual location.

export interface District {
    key: string;
    labelPT: string;
    labelEN: string;
    coords: [number, number];
}

export const districts: District[] = [
    { key: 'aveiro', labelPT: 'Aveiro', labelEN: 'Aveiro', coords: [-8.6538, 40.6405] },
    { key: 'beja', labelPT: 'Beja', labelEN: 'Beja', coords: [-7.8632, 38.0151] },
    { key: 'braga', labelPT: 'Braga', labelEN: 'Braga', coords: [-8.4265, 41.5454] },
    { key: 'braganca', labelPT: 'Bragança', labelEN: 'Bragança', coords: [-6.7567, 41.8061] },
    { key: 'castelo-branco', labelPT: 'Castelo Branco', labelEN: 'Castelo Branco', coords: [-7.4909, 39.8222] },
    { key: 'coimbra', labelPT: 'Coimbra', labelEN: 'Coimbra', coords: [-8.4103, 40.2033] },
    { key: 'evora', labelPT: 'Évora', labelEN: 'Évora', coords: [-7.9135, 38.5714] },
    { key: 'faro', labelPT: 'Faro', labelEN: 'Faro', coords: [-7.9322, 37.0194] },
    { key: 'guarda', labelPT: 'Guarda', labelEN: 'Guarda', coords: [-7.2676, 40.5373] },
    { key: 'leiria', labelPT: 'Leiria', labelEN: 'Leiria', coords: [-8.8071, 39.7436] },
    { key: 'lisboa', labelPT: 'Lisboa', labelEN: 'Lisbon', coords: [-9.1393, 38.7223] },
    { key: 'portalegre', labelPT: 'Portalegre', labelEN: 'Portalegre', coords: [-7.4285, 39.2967] },
    { key: 'porto', labelPT: 'Porto', labelEN: 'Porto', coords: [-8.6291, 41.1579] },
    { key: 'santarem', labelPT: 'Santarém', labelEN: 'Santarém', coords: [-8.685, 39.2362] },
    { key: 'setubal', labelPT: 'Setúbal', labelEN: 'Setúbal', coords: [-8.8882, 38.5244] },
    { key: 'viana-do-castelo', labelPT: 'Viana do Castelo', labelEN: 'Viana do Castelo', coords: [-8.8329, 41.6932] },
    { key: 'vila-real', labelPT: 'Vila Real', labelEN: 'Vila Real', coords: [-7.7441, 41.3006] },
    { key: 'viseu', labelPT: 'Viseu', labelEN: 'Viseu', coords: [-7.9125, 40.6566] },
    { key: 'acores', labelPT: 'Açores', labelEN: 'Azores', coords: [-25.6756, 37.7412] },
    { key: 'madeira', labelPT: 'Madeira', labelEN: 'Madeira', coords: [-16.9241, 32.6669] },
];

export const DISTRICT_KEYS = districts.map((d) => d.key) as [string, ...string[]];

export function getDistrict(key: string): District | undefined {
    return districts.find((d) => d.key === key);
}

export function districtLabel(key: string, locale: string): string {
    const d = getDistrict(key);
    if (!d) return '';
    return locale === 'pt' ? d.labelPT : d.labelEN;
}

// Place names people actually type → district. District capitals match by their
// own name; this adds the big non-capital municipalities so "Gaia" or "Sintra"
// don't fall through. Keys are accent-free and lowercase (see normalize()).
const PLACE_TO_DISTRICT: Record<string, string> = {
    lisbon: 'lisboa', sintra: 'lisboa', cascais: 'lisboa', oeiras: 'lisboa', amadora: 'lisboa',
    loures: 'lisboa', odivelas: 'lisboa', 'vila franca de xira': 'lisboa', mafra: 'lisboa', 'torres vedras': 'lisboa',
    gaia: 'porto', matosinhos: 'porto', maia: 'porto', gondomar: 'porto', valongo: 'porto',
    'povoa de varzim': 'porto', 'vila do conde': 'porto', penafiel: 'porto', paredes: 'porto',
    guimaraes: 'braga', barcelos: 'braga', famalicao: 'braga', fafe: 'braga',
    almada: 'setubal', seixal: 'setubal', barreiro: 'setubal', montijo: 'setubal', palmela: 'setubal', sesimbra: 'setubal',
    portimao: 'faro', lagos: 'faro', albufeira: 'faro', loule: 'faro', tavira: 'faro', olhao: 'faro', algarve: 'faro',
    'figueira da foz': 'coimbra', covilha: 'castelo-branco', fundao: 'castelo-branco',
    'caldas da rainha': 'leiria', 'marinha grande': 'leiria', pombal: 'leiria',
    tomar: 'santarem', ourem: 'santarem', fatima: 'santarem', abrantes: 'santarem',
    'santa maria da feira': 'aveiro', 'oliveira de azemeis': 'aveiro', ovar: 'aveiro', agueda: 'aveiro', ilhavo: 'aveiro',
    chaves: 'vila-real', lamego: 'viseu', 'ponta delgada': 'acores', azores: 'acores', terceira: 'acores', funchal: 'madeira',
};

export function normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Best-effort: returns '' when no place is recognised, so the client is asked
// rather than silently filed under a default city.
export function detectDistrict(text: string): string {
    const q = normalize(text);
    const hit = (name: string) => new RegExp(`\\b${name}\\b`).test(q);
    for (const [place, key] of Object.entries(PLACE_TO_DISTRICT)) {
        if (hit(place)) return key;
    }
    for (const d of districts) {
        if (hit(normalize(d.labelPT))) return d.key;
    }
    return '';
}
