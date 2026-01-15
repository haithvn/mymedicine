import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { prescriptions, prescriptionMedicines } from '@/drizzle/schema';
import { z } from 'zod';

const createPrescriptionSchema = z.object({
    diseaseId: z.string().uuid(),
    frequency: z.string(),
    scheduledTimes: z.array(z.string()), // ["08:00"]
    startDate: z.string().optional(), // ISO Date string
    endDate: z.string().optional(),
    medicines: z.array(z.object({
        medicineId: z.string().uuid(),
        dosage: z.string()
    }))
});

export async function GET() {
    try {
        const allPrescriptions = await db.query.prescriptions.findMany({
            with: {
                disease: true,
                prescriptionMedicines: {
                    with: {
                        medicine: true
                    }
                }
            },
            orderBy: (prescriptions, { desc }) => [desc(prescriptions.createdAt)],
        });
        return NextResponse.json(allPrescriptions);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { medicines: medicineList, ...prescriptionData } = createPrescriptionSchema.parse(body);

        // Transaction to ensure both prescription and join table entries are created
        const result = await db.transaction(async (tx) => {
            const [newPrescription] = await tx.insert(prescriptions).values({
                diseaseId: prescriptionData.diseaseId,
                frequency: prescriptionData.frequency,
                scheduledTimes: prescriptionData.scheduledTimes,
                // startDate: prescriptionData.startDate ? new Date(prescriptionData.startDate) : undefined, // parsing depends on driver
            }).returning();

            if (medicineList.length > 0) {
                await tx.insert(prescriptionMedicines).values(
                    medicineList.map(m => ({
                        prescriptionId: newPrescription.id,
                        medicineId: m.medicineId,
                        dosage: m.dosage
                    }))
                );
            }
            return newPrescription;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
