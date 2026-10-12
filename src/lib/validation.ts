// Shared request-body validation for API routes. Every write endpoint parses its
// body through a zod schema with parseBody(), so malformed input is answered with
// a 400 and a readable message instead of reaching Mongoose and surfacing as a 500
// (or, worse, being saved). Unknown keys are stripped by zod's default object
// behaviour, which also blocks mass-assignment of fields like `role`/`isVerified`.

import { NextResponse } from 'next/server';
import { z } from 'zod';

const OBJECT_ID = /^[a-f\d]{24}$/i;

export function isObjectId(value: unknown): value is string {
    return typeof value === 'string' && OBJECT_ID.test(value);
}

export const objectId = z.string().regex(OBJECT_ID, 'Invalid id');

// Trimmed text with a hard length cap; `min` defaults to 1 (required, non-blank).
export function text(max: number, min = 1) {
    return z.string().trim().min(min, min === 1 ? 'Required' : `Must be at least ${min} characters`).max(max, `Must be at most ${max} characters`);
}

// bcrypt only reads the first 72 bytes, so a longer limit would silently ignore the tail.
export const PASSWORD_MIN = 8;
export const password = z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(72, 'Password must be at most 72 characters');

export const email = z.string().trim().toLowerCase().max(254).pipe(z.email('Invalid email address'));

// Portuguese NIF/NIPC: 9 digits, valid leading digit(s), mod-11 check digit.
export function isValidNif(value: string): boolean {
    const nif = value.replace(/^PT/i, '').replace(/\s/g, '');
    if (!/^\d{9}$/.test(nif)) return false;
    if (!/^(1|2|3|5|6|8|9|45|70|71|72|74|75|77|79)/.test(nif)) return false;
    const sum = nif
        .slice(0, 8)
        .split('')
        .reduce((acc, d, i) => acc + Number(d) * (9 - i), 0);
    const check = 11 - (sum % 11);
    return (check >= 10 ? 0 : check) === Number(nif[8]);
}

export const phone = z.string().trim().max(20).regex(/^[+\d\s()-]*$/, 'Invalid phone number');

export const skills = z.array(text(40)).max(20, 'At most 20 skills');

export const euros = z
    .number({ error: 'Must be a number' })
    .positive('Must be greater than €0')
    .max(1_000_000, 'Amount is too large');

// Only files we uploaded ourselves (see src/app/api/upload/route.ts) may be
// referenced from stored documents — never arbitrary third-party URLs, which would
// let anyone embed tracking pixels or off-site content in other users' pages.
export function isUploadthingUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && (url.hostname === 'utfs.io' || url.hostname.endsWith('.ufs.sh'));
    } catch {
        return false;
    }
}

export const uploadedImageUrl = z.string().refine(isUploadthingUrl, 'Images must be uploaded through Needer');

// Avatar: either cleared ('') or an image uploaded through /api/upload.
export const avatarUrl = z.union([z.literal(''), uploadedImageUrl]);

type ParseResult<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse };

export function badRequest(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
}

export function validate<S extends z.ZodType>(schema: S, raw: unknown): ParseResult<z.infer<S>> {
    const result = schema.safeParse(raw);
    if (!result.success) {
        const issue = result.error.issues[0];
        const field = issue.path.join('.');
        return { error: badRequest(field ? `${field}: ${issue.message}` : issue.message) };
    }
    return { data: result.data };
}

export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<ParseResult<z.infer<S>>> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return { error: badRequest('Invalid JSON body') };
    }
    return validate(schema, raw);
}
