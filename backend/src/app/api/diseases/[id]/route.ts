import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { diseases } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateDiseaseSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = updateDiseaseSchema.parse(body);

        const [updatedDisease] = await db.update(diseases)
            .set(validatedData)
            .where(eq(diseases.id, id))
            .returning();

        return NextResponse.json(updatedDisease);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update disease' }, { status: 400 });
    }
}

import { prescriptions, prescriptionMedicines } from '@/drizzle/schema';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.transaction(async (tx) => {
            // Find related prescriptions
            const relatedPrescriptions = await tx.select({ id: prescriptions.id }).from(prescriptions).where(eq(prescriptions.diseaseId, id));

            for (const p of relatedPrescriptions) {
                // Delete prescription medicines
                await tx.delete(prescriptionMedicines).where(eq(prescriptionMedicines.prescriptionId, p.id));
            }
            // Delete prescriptions
            await tx.delete(prescriptions).where(eq(prescriptions.diseaseId, id));

            // Delete disease
            await tx.delete(diseases).where(eq(diseases.id, id));
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete disease' }, { status: 500 });
    }
}
