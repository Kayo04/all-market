import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, location, locationLabel } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        if (!['client', 'pro'].includes(role)) {
            return NextResponse.json(
                { error: 'Role must be "client" or "pro"' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user exists
        const existing = await User.findOne({ email: email.toLowerCase() });
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
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            location: location || { type: 'Point', coordinates: [0, 0] },
            locationLabel: locationLabel || '',
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
