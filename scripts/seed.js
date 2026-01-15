const API_BASE = 'https://mymedicine-backend.vercel.app/api';

async function post(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Failed to POST ${url}: ${res.status} ${JSON.stringify(err)}`);
    }
    return res.json();
}

async function seed() {
    try {
        console.log('--- Starting Seeding with Fetch ---');

        // 1. Medicines
        const medicines = [
            { name: 'Paracetamol', manufacturer: 'GSK', quantity: 20, unit: 'tablet', status: 'available' },
            { name: 'Amoxicillin', manufacturer: 'Abbott', quantity: 12, unit: 'capsule', status: 'available' },
            { name: 'Vitamin C', manufacturer: 'DHG', quantity: 30, unit: 'effervescent', status: 'available' },
            { name: 'Ibuprofen', manufacturer: 'Bayer', quantity: 0, unit: 'tablet', status: 'out_of_stock' },
            { name: 'Augmentin', manufacturer: 'GSK', quantity: 5, unit: 'tablet', status: 'available' },
            { name: 'Panadol', manufacturer: 'GSK', quantity: 15, unit: 'tablet', status: 'available' },
            { name: 'Decolgen', manufacturer: 'United Pharma', quantity: 8, unit: 'tablet', status: 'available' }
        ];

        const medicineIds = [];
        for (const med of medicines) {
            const data = await post(`${API_BASE}/medicines`, med);
            medicineIds.push(data.id);
            console.log(`Added Medicine: ${med.name}`);
        }

        // 2. Diseases
        const diseases = [
            { name: 'Cảm cúm', description: 'Cảm cúm thông thường' },
            { name: 'Nhiễm trùng', description: 'Nhiễm trùng vi khuẩn' },
            { name: 'Đau đầu', description: 'Đau nửa đầu hoặc căng thẳng' },
            { name: 'Dị ứng', description: 'Dị ứng thời tiết' }
        ];

        const diseaseIds = [];
        for (const dis of diseases) {
            const data = await post(`${API_BASE}/diseases`, dis);
            diseaseIds.push(data.id);
            console.log(`Added Disease: ${dis.name}`);
        }

        // 3. Prescriptions
        // We'll create some prescriptions for different diseases
        const prescriptions = [
            {
                diseaseId: diseaseIds[0],
                frequency: 'Daily',
                scheduledTimes: ['08:00', '20:00'],
                medicines: [
                    { medicineId: medicineIds[0], dosage: '1 viên' },
                    { medicineId: medicineIds[2], dosage: '1 viên sủi' }
                ]
            },
            {
                diseaseId: diseaseIds[1],
                frequency: 'Daily',
                scheduledTimes: ['12:00'],
                medicines: [
                    { medicineId: medicineIds[1], dosage: '1 viên' }
                ]
            },
            {
                diseaseId: diseaseIds[2],
                frequency: 'As Needed',
                scheduledTimes: ['09:00', '15:00', '21:00'],
                medicines: [
                    { medicineId: medicineIds[3], dosage: '1 viên' }
                ]
            }
        ];

        for (const pre of prescriptions) {
            await post(`${API_BASE}/prescriptions`, pre);
            console.log(`Added Prescription`);
        }

        console.log('--- Seeding Completed successfully ---');
    } catch (error) {
        console.error('Seeding failed:', error.message);
    }
}

seed();
