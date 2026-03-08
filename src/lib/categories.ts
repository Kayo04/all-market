import { Category } from '@/types';

export const categories: Category[] = [
    {
        key: 'home-repairs',
        icon: 'Wrench',
        labelEN: 'Home Repairs',
        labelPT: 'Reparações Domésticas',
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
        subcategories: [
            { key: 'gaming', labelEN: 'Gaming (Consoles/Games)', labelPT: 'Gaming (Consolas/Jogos)' },
            { key: 'smartphones', labelEN: 'Smartphones', labelPT: 'Smartphones' },
            { key: 'laptops', labelEN: 'Laptops', labelPT: 'Portáteis' },
        ],
    },
];

export function getCategoryByKey(key: string): Category | undefined {
    return categories.find((c) => c.key === key);
}

export function isEquipmentCategory(categoryKey: string): boolean {
    return categoryKey === 'equipment';
}
