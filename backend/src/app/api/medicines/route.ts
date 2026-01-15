import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { medicines, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createMedicineSchema = z.object({
    name: z.string().min(1),
    manufacturer: z.string().optional(),
    activeIngredients: z.string().optional(),
    price: z.string().optional(),
    quantity: z.coerce.number().default(0),
    unit: z.string().optional(),
    status: z.enum(['available', 'out_of_stock']).default('available'),
});

export async function GET() {
    try {
        const allMedicines = await db.query.medicines.findMany({
            orderBy: (medicines, { desc }) => [desc(medicines.createdAt)],
        });
        return NextResponse.json(allMedicines);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createMedicineSchema.parse(body);

        let user = await db.query.users.findFirst();
        if (!user) {
            // Should normally be handled in a seed or auth middleware
            const [newUser] = await db.insert(users).values({ name: 'Demo User', email: 'demo@example.com' }).returning();
            user = newUser;
        }

        const [newMedicine] = await db.insert(medicines).values({
            userId: user.id,
            ...validatedData,
        }).returning();

        return NextResponse.json(newMedicine);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
