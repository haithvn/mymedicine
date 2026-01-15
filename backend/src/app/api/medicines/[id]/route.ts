import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { medicines } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateMedicineSchema = z.object({
    name: z.string().min(1).optional(),
    manufacturer: z.string().optional(),
    activeIngredients: z.string().optional(),
    price: z.string().optional(),
    quantity: z.coerce.number().optional(),
    unit: z.string().optional(),
    status: z.enum(['available', 'out_of_stock']).optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = updateMedicineSchema.parse(body);

        const [updatedMedicine] = await db.update(medicines)
            .set(validatedData)
            .where(eq(medicines.id, id))
            .returning();

        return NextResponse.json(updatedMedicine);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update medicine' }, { status: 400 });
    }
}

import { prescriptionMedicines } from '@/drizzle/schema';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.transaction(async (tx) => {
            // Delete related prescription references first
            await tx.delete(prescriptionMedicines).where(eq(prescriptionMedicines.medicineId, id));
            // Then delete the medicine
            await tx.delete(medicines).where(eq(medicines.id, id));
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
    }
}
