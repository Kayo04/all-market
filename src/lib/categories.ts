import { Category } from '@/types';

export const categories: Category[] = [
    {
        key: 'home-repairs',
        icon: 'Wrench',
        labelEN: 'Home Repairs',
        labelPT: 'Reparações Domésticas',
        type: 'service',
        subcategories: [
            { key: 'electricians', labelEN: 'Electricians', labelPT: 'Eletricistas' },
            { key: 'plumbers', labelEN: 'Plumbers', labelPT: 'Canalizadores' },
            { key: 'painters', labelEN: 'Painters', labelPT: 'Pintores' },
            { key: 'furniture-assembly', labelEN: 'Furniture Assembly', labelPT: 'Montagem de Móveis' },
        ],
    },
    {
        key: 'tech-digital',
        icon: 'Monitor',
        labelEN: 'Tech & Digital',
        labelPT: 'Tecnologia e Digital',
        type: 'service',
        subcategories: [
            { key: 'websites', labelEN: 'Website Creation', labelPT: 'Criação de Websites' },
            { key: 'social-media', labelEN: 'Social Media Management', labelPT: 'Gestão de Redes Sociais' },
            { key: 'computer-repair', labelEN: 'Computer/Phone Repair', labelPT: 'Reparação de Computadores/Telemóveis' },
        ],
    },
    {
        key: 'tutoring',
        icon: 'BookOpen',
        labelEN: 'Tutoring & Languages',
        labelPT: 'Explicações e Línguas',
        type: 'service',
        subcategories: [
            { key: 'math', labelEN: 'Mathematics', labelPT: 'Matemática' },
            { key: 'english', labelEN: 'English', labelPT: 'Inglês' },
            { key: 'music', labelEN: 'Music (Guitar/Piano)', labelPT: 'Música (Guitarra/Piano)' },
            { key: 'exam-prep', labelEN: 'Exam Preparation', labelPT: 'Preparação para Exames' },
        ],
    },
    {
        key: 'events',
        icon: 'PartyPopper',
        labelEN: 'Events & Parties',
        labelPT: 'Eventos e Festas',
        type: 'service',
        subcategories: [
            { key: 'photographers', labelEN: 'Photographers', labelPT: 'Fotógrafos' },
            { key: 'djs', labelEN: 'DJs / Musicians', labelPT: 'DJs / Músicos' },
            { key: 'catering', labelEN: 'Catering', labelPT: 'Catering' },
            { key: 'venue-rental', labelEN: 'Venue Rental', labelPT: 'Aluguer de Espaços' },
        ],
    },
    {
        key: 'wellness',
        icon: 'Heart',
        labelEN: 'Wellness & Sports',
        labelPT: 'Bem-estar e Desporto',
        type: 'service',
        subcategories: [
            { key: 'personal-trainers', labelEN: 'Personal Trainers', labelPT: 'Personal Trainers' },
            { key: 'massage', labelEN: 'At-Home Massage', labelPT: 'Massagistas ao Domicílio' },
            { key: 'dog-walking', labelEN: 'Dog Walking', labelPT: 'Passeadores de Cães' },
        ],
    },
    {
        key: 'equipment',
        icon: 'Gamepad2',
        labelEN: 'Buy Equipment',
        labelPT: 'Compra de Equipamentos',
        type: 'product',
        subcategories: [
            { key: 'gaming', labelEN: 'Gaming (Consoles/Games)', labelPT: 'Gaming (Consolas/Jogos)' },
            { key: 'smartphones', labelEN: 'Smartphones', labelPT: 'Smartphones' },
            { key: 'laptops', labelEN: 'Laptops', labelPT: 'Portáteis' },
        ],
    },
    {
        key: 'business',
        icon: 'Briefcase',
        labelEN: 'Business & Consulting',
        labelPT: 'Negócios e Consultoria',
        type: 'service',
        subcategories: [
            { key: 'accounting', labelEN: 'Accounting', labelPT: 'Contabilidade' },
            { key: 'legal', labelEN: 'Legal Services', labelPT: 'Serviços Jurídicos' }
        ],
    },
    {
        key: 'design',
        icon: 'Palette',
        labelEN: 'Design & Creative',
        labelPT: 'Design e Criatividade',
        type: 'service',
        subcategories: [
            { key: 'logo', labelEN: 'Logo Design', labelPT: 'Design de Logótipos' },
            { key: 'illustration', labelEN: 'Illustration', labelPT: 'Ilustração' }
        ],
    },
    {
        key: 'writing',
        icon: 'PenTool',
        labelEN: 'Writing',
        labelPT: 'Escrita',
        type: 'service',
        subcategories: [
            { key: 'copywriting', labelEN: 'Copywriting', labelPT: 'Copywriting' },
            { key: 'translation', labelEN: 'Translation', labelPT: 'Tradução' }
        ],
    },
    {
        key: 'cleaning',
        icon: 'Sparkles',
        labelEN: 'Cleaning Services',
        labelPT: 'Serviços de Limpeza',
        type: 'service',
        subcategories: [
            { key: 'house-cleaning', labelEN: 'House Cleaning', labelPT: 'Limpeza Doméstica' },
            { key: 'office-cleaning', labelEN: 'Office Cleaning', labelPT: 'Limpeza de Escritórios' }
        ],
    },
    {
        key: 'automotive',
        icon: 'Car',
        labelEN: 'Automotive Services',
        labelPT: 'Serviços Automóveis',
        type: 'service',
        subcategories: [
            { key: 'mechanic', labelEN: 'Mechanic', labelPT: 'Mecânico' },
            { key: 'car-wash', labelEN: 'Car Wash & Detail', labelPT: 'Lavagem Automóvel' }
        ],
    },
    {
        key: 'beauty',
        icon: 'Scissors',
        labelEN: 'Beauty & Personal Care',
        labelPT: 'Estética e Cuidado Pessoal',
        type: 'service',
        subcategories: [
            { key: 'hairdresser', labelEN: 'Hairdresser', labelPT: 'Cabeleireiro' },
            { key: 'makeup', labelEN: 'Makeup Artist', labelPT: 'Maquilhador' }
        ],
    },
];

export function getCategoryByKey(key: string): Category | undefined {
    return categories.find((c) => c.key === key);
}

export function isEquipmentCategory(categoryKey: string): boolean {
    return categoryKey === 'equipment';
}

export function getCategoryType(categoryKey: string): 'service' | 'product' {
    return categories.find((c) => c.key === categoryKey)?.type ?? 'service';
}
