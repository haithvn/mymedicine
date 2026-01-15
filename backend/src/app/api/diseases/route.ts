import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { diseases, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createDiseaseSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export async function GET() {
    try {
        // MVP: Get all diseases (assuming single user context)
        const allDiseases = await db.query.diseases.findMany({
            orderBy: (diseases, { desc }) => [desc(diseases.createdAt)],
        });
        return NextResponse.json(allDiseases);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch diseases' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description } = createDiseaseSchema.parse(body);

        // Check if a user exists, if not create a demo user (Requirement Assumption: Single User MVP)
        let user = await db.query.users.findFirst();
        if (!user) {
            const [newUser] = await db.insert(users).values({ name: 'Demo User', email: 'demo@example.com' }).returning();
            user = newUser;
        }

        const [newDisease] = await db.insert(diseases).values({
            userId: user.id,
            name,
            description,
        }).returning();

        return NextResponse.json(newDisease);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
