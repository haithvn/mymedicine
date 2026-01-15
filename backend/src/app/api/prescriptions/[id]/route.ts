import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { prescriptions, prescriptionMedicines } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updatePrescriptionSchema = z.object({
    diseaseId: z.string().uuid().optional(),
    frequency: z.string().optional(),
    scheduledTimes: z.array(z.string()).optional(),
    medicines: z.array(z.object({
        medicineId: z.string().uuid(),
        dosage: z.string()
    })).optional()
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { medicines: medicineList, ...prescriptionData } = updatePrescriptionSchema.parse(body);

        const result = await db.transaction(async (tx) => {
            // Update prescription details
            const [updatedPrescription] = await tx.update(prescriptions)
                .set(prescriptionData)
                .where(eq(prescriptions.id, id))
                .returning();

            // If medicines are provided, update them (delete all and re-add for simplicity in MVP)
            if (medicineList) {
                await tx.delete(prescriptionMedicines).where(eq(prescriptionMedicines.prescriptionId, id));

                if (medicineList.length > 0) {
                    await tx.insert(prescriptionMedicines).values(
                        medicineList.map(m => ({
                            prescriptionId: id,
                            medicineId: m.medicineId,
                            dosage: m.dosage
                        }))
                    );
                }
            }
            return updatedPrescription;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update prescription' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Cascade delete should ideally be handled by DB, but manual cleanup for safety
        await db.transaction(async (tx) => {
            await tx.delete(prescriptionMedicines).where(eq(prescriptionMedicines.prescriptionId, id));
            await tx.delete(prescriptions).where(eq(prescriptions.id, id));
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 });
    }
}
