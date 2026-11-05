import { z } from 'zod';
import { DISTRICT_KEYS } from '@/lib/districts';
import { getCategoryByKey, isValidSubcategory } from '@/lib/categories';
import { isValidNif, phone, text } from '@/lib/validation';
import { LEGAL } from '@/lib/legal';

// Activities that need a public licence in Portugal: the application asks for its
// number, and the admin checks it in the official register before approving.
export const LICENCE_FOR_CATEGORY: Record<string, { name: string; registerUrl: string }> = {
    travel: { name: 'RNAVT', registerUrl: 'https://registos.turismodeportugal.pt' },
    'real-estate': { name: 'AMI', registerUrl: 'https://www.impic.pt' },
};

export function ageOn(birth: Date, today = new Date()): number {
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

export const proApplicationSchema = z
    .object({
        fullName: text(120, 5),
        birthDate: z.iso.date(),
        phone: phone.min(9, 'Invalid phone number'),
        district: z.enum(DISTRICT_KEYS),
        businessType: z.enum(['individual', 'company']),
        nif: z
            .string()
            .trim()
            .refine(isValidNif, 'Invalid Portuguese NIF')
            .transform((v) => v.replace(/^PT/i, '').replace(/\s/g, '')),
        businessName: text(120, 0).optional(),
        category: z.string().refine((k) => !!getCategoryByKey(k), 'Invalid category'),
        subcategory: z.string().optional(),
        experienceYears: z.coerce.number().int().min(0).max(70),
        description: text(1500, 40),
        website: z.union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Invalid website URL' }).max(200)]).optional(),
        licenseNumber: text(40, 0).optional(),
        declaration: z.literal(true, { error: 'You must confirm the declaration' }),
    })
    .superRefine((d, ctx) => {
        const age = ageOn(new Date(d.birthDate));
        if (age < LEGAL.minAge || age > 110) {
            ctx.addIssue({ code: 'custom', path: ['birthDate'], message: `You must be at least ${LEGAL.minAge} to become a Pro` });
        }
        if (d.subcategory && !isValidSubcategory(d.category, d.subcategory)) {
            ctx.addIssue({ code: 'custom', path: ['subcategory'], message: 'Invalid subcategory' });
        }
        if (LICENCE_FOR_CATEGORY[d.category] && !d.licenseNumber) {
            ctx.addIssue({ code: 'custom', path: ['licenseNumber'], message: `${LICENCE_FOR_CATEGORY[d.category].name} licence number is required` });
        }
        if (d.businessType === 'company' && !d.businessName) {
            ctx.addIssue({ code: 'custom', path: ['businessName'], message: 'Company name is required' });
        }
    });

export type ProApplicationInput = z.infer<typeof proApplicationSchema>;
