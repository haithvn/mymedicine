import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prescriptions, diseases, medicines, prescriptionMedicines } from '@/drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// Helper to validate time format (HH:MM)
const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);

export async function GET(request: Request) {
    try {
        // In a real app, we would get the userId from the session. 
        // For MVP, we fetch all prescriptions (or hardcode a demo user if we had auth).
        // Assuming single-user for MVP as per requirements.

        // 1. Get all active prescriptions
        const today = new Date();
        const activePrescriptions = await db.query.prescriptions.findMany({
            with: {
                disease: true,
                prescriptionMedicines: {
                    with: {
                        medicine: true,
                    },
                },
            },
            // In a real app, filter by startDate <= today <= endDate
        });

        const upcomingReminders = [];

        // 2. Flatten into a timeline
        for (const prescription of activePrescriptions) {
            if (!prescription.scheduledTimes) continue;

            const times = prescription.scheduledTimes as string[]; // Cast JSONB

            for (const time of times) {
                // For each time, create a reminder entry for each medicine in the prescription
                for (const pm of prescription.prescriptionMedicines) {
                    upcomingReminders.push({
                        time,
                        medicine: pm.medicine.name,
                        dosage: pm.dosage,
                        prescriptionId: prescription.id,
                        disease: prescription.disease.name,
                        unit: pm.medicine.unit
                    });
                }
            }
        }

        // 3. Sort by time
        upcomingReminders.sort((a, b) => a.time.localeCompare(b.time));

        return NextResponse.json(upcomingReminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
