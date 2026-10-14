import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { z } from 'zod';
import { clientIp, MINUTE, rateLimit } from '@/lib/rateLimit';
import { email, parseBody, password, phone, text } from '@/lib/validation';

const registerSchema = z.object({
    name: text(80, 2),
    email,
    password,
    phone: phone.optional(),
    // No role field: every account starts as a client. Becoming a pro is an
    // application reviewed by an admin, never a sign-up choice.
    locationLabel: text(80, 0).optional(),
    agreedToTerms: z.literal(true, { error: 'You must agree to the Terms of Service and Privacy Policy' }),
});

export async function POST(request: Request) {
    try {
        if (!(await rateLimit(`register:${clientIp(request.headers)}`, 5, 15 * MINUTE))) {
            return NextResponse.json(
                { error: 'Too many accounts created from this address. Please try again later.' },
                { status: 429 }
            );
        }

        const { data, error } = await parseBody(request, registerSchema);
        if (error) return error;
        const { name, email, password, phone, locationLabel } = data;

        await dbConnect();

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'client',
            phone: phone || '',
            locationLabel: locationLabel || '',
            location: { type: 'Point', coordinates: [0, 0] },
            termsAcceptedAt: new Date(),
        });

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
