import { Category } from '@/types';

// Order = display order (homepage carousel, pickers): most-requested first, with
// products mixed in early. `image` is the 3D card art; categories without one
// show their icon instead. Subcategory keys must be unique across ALL categories:
// a pro's `proCategory` stores a bare key and notifyMatchingPros() matches on it.
export const categories: Category[] = [
    {
        key: 'home-repairs',
        icon: 'Wrench',
        labelEN: 'Home Repairs',
        labelPT: 'Reparações Domésticas',
        type: 'service',
        image: '/categories/home-repairs-3d.png',
        subcategories: [
            { key: 'electricians', labelEN: 'Electricians', labelPT: 'Eletricistas' },
            { key: 'plumbers', labelEN: 'Plumbers', labelPT: 'Canalizadores' },
            { key: 'painters', labelEN: 'Painters', labelPT: 'Pintores' },
            { key: 'locksmiths', labelEN: 'Locksmiths', labelPT: 'Serralheiros' },
            { key: 'furniture-assembly', labelEN: 'Furniture Assembly', labelPT: 'Montagem de Móveis' },
            { key: 'handyman', labelEN: 'Handyman', labelPT: 'Faz-tudo' },
            { key: 'appliance-repair', labelEN: 'Appliance Repair', labelPT: 'Reparação de Eletrodomésticos' },
        ],
    },
    {
        key: 'renovation',
        icon: 'Hammer',
        labelEN: 'Building & Renovation',
        labelPT: 'Obras e Remodelações',
        type: 'service',
        subcategories: [
            { key: 'remodeling', labelEN: 'Remodeling', labelPT: 'Remodelações' },
            { key: 'masonry', labelEN: 'Masonry & Tiling', labelPT: 'Pedreiro e Azulejos' },
            { key: 'carpentry', labelEN: 'Carpentry', labelPT: 'Carpintaria' },
            { key: 'flooring', labelEN: 'Flooring', labelPT: 'Pavimentos' },
            { key: 'roofing', labelEN: 'Roofing & Insulation', labelPT: 'Telhados e Isolamento' },
            { key: 'hvac', labelEN: 'Air Conditioning & Heating', labelPT: 'Ar Condicionado e Aquecimento' },
        ],
    },
    {
        key: 'cleaning',
        icon: 'Sparkles',
        labelEN: 'Cleaning Services',
        labelPT: 'Serviços de Limpeza',
        type: 'service',
        image: '/categories/cleaning-3d.png',
        subcategories: [
            { key: 'house-cleaning', labelEN: 'House Cleaning', labelPT: 'Limpeza Doméstica' },
            { key: 'office-cleaning', labelEN: 'Office Cleaning', labelPT: 'Limpeza de Escritórios' },
            { key: 'post-construction', labelEN: 'After-Construction Cleaning', labelPT: 'Limpeza Pós-obra' },
            { key: 'upholstery', labelEN: 'Upholstery & Carpets', labelPT: 'Estofos e Tapetes' },
        ],
    },
    {
        key: 'moving',
        icon: 'Truck',
        labelEN: 'Moving & Transport',
        labelPT: 'Mudanças e Transportes',
        type: 'service',
        subcategories: [
            { key: 'house-moving', labelEN: 'House Moving', labelPT: 'Mudanças' },
            { key: 'freight', labelEN: 'Item Transport', labelPT: 'Transporte de Volumes' },
            { key: 'junk-removal', labelEN: 'Junk & Rubble Removal', labelPT: 'Recolha de Monos e Entulho' },
        ],
    },
    {
        key: 'vehicles',
        icon: 'CarFront',
        labelEN: 'Vehicles',
        labelPT: 'Veículos',
        type: 'product',
        subcategories: [
            { key: 'cars', labelEN: 'Cars', labelPT: 'Carros' },
            { key: 'motorcycles', labelEN: 'Motorcycles & Scooters', labelPT: 'Motas e Scooters' },
            { key: 'vehicle-parts', labelEN: 'Parts & Accessories', labelPT: 'Peças e Acessórios' },
        ],
    },
    {
        key: 'equipment',
        icon: 'Smartphone',
        labelEN: 'Electronics',
        labelPT: 'Eletrónica',
        type: 'product',
        image: '/categories/equipment-3d.png',
        subcategories: [
            { key: 'smartphones', labelEN: 'Smartphones', labelPT: 'Smartphones' },
            { key: 'laptops', labelEN: 'Laptops', labelPT: 'Portáteis' },
            { key: 'gaming', labelEN: 'Gaming (Consoles/Games)', labelPT: 'Gaming (Consolas/Jogos)' },
            { key: 'tablets', labelEN: 'Tablets', labelPT: 'Tablets' },
            { key: 'tv-audio', labelEN: 'TV & Audio', labelPT: 'TV e Som' },
            { key: 'cameras', labelEN: 'Cameras', labelPT: 'Fotografia e Vídeo' },
        ],
    },
    {
        key: 'home-goods',
        icon: 'Sofa',
        labelEN: 'Home & Furniture',
        labelPT: 'Casa e Mobiliário',
        type: 'product',
        subcategories: [
            { key: 'furniture', labelEN: 'Furniture', labelPT: 'Móveis' },
            { key: 'appliances', labelEN: 'Appliances', labelPT: 'Eletrodomésticos' },
            { key: 'decor', labelEN: 'Decor', labelPT: 'Decoração' },
        ],
    },
    {
        key: 'real-estate',
        icon: 'Building2',
        labelEN: 'Real Estate',
        labelPT: 'Imóveis',
        type: 'product',
        subcategories: [
            { key: 'rooms', labelEN: 'Rooms', labelPT: 'Quartos' },
            { key: 'rent', labelEN: 'Homes for Rent', labelPT: 'Casas para Arrendar' },
            { key: 'buy-home', labelEN: 'Homes for Sale', labelPT: 'Casas para Comprar' },
        ],
    },
    {
        key: 'tech-digital',
        icon: 'Monitor',
        labelEN: 'Tech & Digital',
        labelPT: 'Tecnologia e Digital',
        type: 'service',
        image: '/categories/tech-digital-3d.png',
        subcategories: [
            { key: 'websites', labelEN: 'Website Creation', labelPT: 'Criação de Websites' },
            { key: 'apps', labelEN: 'App Development', labelPT: 'Criação de Apps' },
            { key: 'social-media', labelEN: 'Social Media Management', labelPT: 'Gestão de Redes Sociais' },
            { key: 'computer-repair', labelEN: 'Computer/Phone Repair', labelPT: 'Reparação de Computadores/Telemóveis' },
            { key: 'it-support', labelEN: 'IT Support', labelPT: 'Apoio Informático' },
        ],
    },
    {
        key: 'tutoring',
        icon: 'BookOpen',
        labelEN: 'Tutoring & Languages',
        labelPT: 'Explicações e Línguas',
        type: 'service',
        image: '/categories/tutoring-3d.png',
        subcategories: [
            { key: 'math', labelEN: 'Mathematics', labelPT: 'Matemática' },
            { key: 'english', labelEN: 'English', labelPT: 'Inglês' },
            { key: 'other-languages', labelEN: 'Other Languages', labelPT: 'Outras Línguas' },
            { key: 'music', labelEN: 'Music (Guitar/Piano)', labelPT: 'Música (Guitarra/Piano)' },
            { key: 'exam-prep', labelEN: 'Exam Preparation', labelPT: 'Preparação para Exames' },
        ],
    },
    {
        key: 'automotive',
        icon: 'Car',
        labelEN: 'Automotive Services',
        labelPT: 'Serviços Automóveis',
        type: 'service',
        image: '/categories/automotive-3d.png',
        subcategories: [
            { key: 'mechanic', labelEN: 'Mechanic', labelPT: 'Mecânico' },
            { key: 'car-wash', labelEN: 'Car Wash & Detail', labelPT: 'Lavagem Automóvel' },
            { key: 'tires', labelEN: 'Tyres', labelPT: 'Pneus' },
            { key: 'towing', labelEN: 'Towing', labelPT: 'Reboque' },
        ],
    },
    {
        key: 'garden',
        icon: 'Trees',
        labelEN: 'Garden & Outdoors',
        labelPT: 'Jardim e Exterior',
        type: 'service',
        subcategories: [
            { key: 'gardening', labelEN: 'Gardening', labelPT: 'Jardinagem' },
            { key: 'pools', labelEN: 'Pools', labelPT: 'Piscinas' },
            { key: 'pest-control', labelEN: 'Pest Control', labelPT: 'Desinfestação' },
            { key: 'land-clearing', labelEN: 'Land Clearing', labelPT: 'Limpeza de Terrenos' },
        ],
    },
    {
        key: 'pets',
        icon: 'PawPrint',
        labelEN: 'Pets',
        labelPT: 'Animais',
        type: 'service',
        subcategories: [
            { key: 'dog-walking', labelEN: 'Dog Walking', labelPT: 'Passeadores de Cães' },
            { key: 'pet-sitting', labelEN: 'Pet Sitting', labelPT: 'Pet Sitting' },
            { key: 'grooming', labelEN: 'Grooming', labelPT: 'Banhos e Tosquias' },
            { key: 'dog-training', labelEN: 'Dog Training', labelPT: 'Treino Canino' },
        ],
    },
    {
        key: 'family',
        icon: 'Baby',
        labelEN: 'Family & Care',
        labelPT: 'Família e Cuidados',
        type: 'service',
        subcategories: [
            { key: 'babysitting', labelEN: 'Babysitting', labelPT: 'Babysitting' },
            { key: 'elderly-care', labelEN: 'Elderly Care', labelPT: 'Apoio a Idosos' },
        ],
    },
    {
        key: 'beauty',
        icon: 'Scissors',
        labelEN: 'Beauty & Personal Care',
        labelPT: 'Estética e Cuidado Pessoal',
        type: 'service',
        image: '/categories/beauty-3d.png',
        subcategories: [
            { key: 'hairdresser', labelEN: 'Hairdresser', labelPT: 'Cabeleireiro' },
            { key: 'makeup', labelEN: 'Makeup Artist', labelPT: 'Maquilhador' },
            { key: 'nails', labelEN: 'Nails', labelPT: 'Unhas' },
            { key: 'aesthetics', labelEN: 'Beauty Treatments', labelPT: 'Tratamentos de Estética' },
        ],
    },
    {
        key: 'wellness',
        icon: 'Heart',
        labelEN: 'Wellness & Sports',
        labelPT: 'Bem-estar e Desporto',
        type: 'service',
        image: '/categories/wellness-3d.png',
        subcategories: [
            { key: 'personal-trainers', labelEN: 'Personal Trainers', labelPT: 'Personal Trainers' },
            { key: 'massage', labelEN: 'At-Home Massage', labelPT: 'Massagistas ao Domicílio' },
            { key: 'yoga', labelEN: 'Yoga & Pilates', labelPT: 'Yoga e Pilates' },
        ],
    },
    {
        key: 'events',
        icon: 'PartyPopper',
        labelEN: 'Events & Parties',
        labelPT: 'Eventos e Festas',
        type: 'service',
        image: '/categories/events-3d.png',
        subcategories: [
            { key: 'photographers', labelEN: 'Photographers', labelPT: 'Fotógrafos' },
            { key: 'djs', labelEN: 'DJs / Musicians', labelPT: 'DJs / Músicos' },
            { key: 'catering', labelEN: 'Catering', labelPT: 'Catering' },
            { key: 'venue-rental', labelEN: 'Venue Rental', labelPT: 'Aluguer de Espaços' },
            { key: 'entertainment', labelEN: 'Kids Entertainment', labelPT: 'Animação Infantil' },
            { key: 'wedding-planning', labelEN: 'Wedding & Event Planning', labelPT: 'Organização de Casamentos e Eventos' },
        ],
    },
    {
        key: 'travel',
        icon: 'Plane',
        labelEN: 'Travel',
        labelPT: 'Viagens',
        type: 'service',
        subcategories: [
            { key: 'packages', labelEN: 'Holiday Packages', labelPT: 'Pacotes de Férias' },
            { key: 'flights-hotels', labelEN: 'Flights & Stays', labelPT: 'Voos e Alojamento' },
            { key: 'transfers', labelEN: 'Transfers & Drivers', labelPT: 'Transfers e Motoristas' },
        ],
    },
    {
        key: 'fashion',
        icon: 'Shirt',
        labelEN: 'Fashion & Accessories',
        labelPT: 'Moda e Acessórios',
        type: 'product',
        subcategories: [
            { key: 'clothing', labelEN: 'Clothing', labelPT: 'Roupa' },
            { key: 'shoes', labelEN: 'Shoes', labelPT: 'Calçado' },
            { key: 'accessories', labelEN: 'Watches, Bags & Jewellery', labelPT: 'Relógios, Malas e Joias' },
        ],
    },
    {
        key: 'sports-leisure',
        icon: 'Bike',
        labelEN: 'Sports & Leisure',
        labelPT: 'Desporto e Lazer',
        type: 'product',
        subcategories: [
            { key: 'bikes', labelEN: 'Bikes & Scooters', labelPT: 'Bicicletas e Trotinetes' },
            { key: 'sports-gear', labelEN: 'Sports Gear', labelPT: 'Material Desportivo' },
            { key: 'instruments', labelEN: 'Musical Instruments', labelPT: 'Instrumentos Musicais' },
        ],
    },
    {
        key: 'business',
        icon: 'Briefcase',
        labelEN: 'Business & Consulting',
        labelPT: 'Negócios e Consultoria',
        type: 'service',
        image: '/categories/business-3d.png',
        subcategories: [
            { key: 'accounting', labelEN: 'Accounting', labelPT: 'Contabilidade' },
            { key: 'legal', labelEN: 'Legal Services', labelPT: 'Serviços Jurídicos' },
            { key: 'marketing', labelEN: 'Marketing & Advertising', labelPT: 'Marketing e Publicidade' },
        ],
    },
    {
        key: 'design',
        icon: 'Palette',
        labelEN: 'Design & Creative',
        labelPT: 'Design e Criatividade',
        type: 'service',
        image: '/categories/design-3d.png',
        subcategories: [
            { key: 'logo', labelEN: 'Logo Design', labelPT: 'Design de Logótipos' },
            { key: 'illustration', labelEN: 'Illustration', labelPT: 'Ilustração' },
            { key: 'video-editing', labelEN: 'Video Editing', labelPT: 'Edição de Vídeo' },
            { key: 'interior-design', labelEN: 'Interior Design', labelPT: 'Design de Interiores' },
        ],
    },
    {
        key: 'writing',
        icon: 'PenTool',
        labelEN: 'Writing',
        labelPT: 'Escrita',
        type: 'service',
        image: '/categories/writing-3d.png',
        subcategories: [
            { key: 'copywriting', labelEN: 'Copywriting', labelPT: 'Copywriting' },
            { key: 'translation', labelEN: 'Translation', labelPT: 'Tradução' },
        ],
    },
];

export function getCategoryByKey(key: string): Category | undefined {
    return categories.find((c) => c.key === key);
}

export function getCategoryType(categoryKey: string): 'service' | 'product' {
    return categories.find((c) => c.key === categoryKey)?.type ?? 'service';
}

export function isValidSubcategory(categoryKey: string, subcategoryKey: string): boolean {
    return !!getCategoryByKey(categoryKey)?.subcategories.some((s) => s.key === subcategoryKey);
}

// Pros store either a subcategory key (onboarding default) or a category key in `proCategory`.
export function isValidProCategory(key: string): boolean {
    return categories.some((c) => c.key === key || c.subcategories.some((s) => s.key === key));
}
