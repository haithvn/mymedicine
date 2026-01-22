import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    MEDICINES: 'mymedicine_medicines',
    DISEASES: 'mymedicine_diseases',
    PRESCRIPTIONS: 'mymedicine_prescriptions'
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const StorageService = {
    // Basic CRUD for any key
    async getAll<T>(key: string): Promise<T[]> {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    async save<T extends { id?: string }>(key: string, item: T): Promise<T> {
        const items = await this.getAll<T>(key);
        if (item.id) {
            const index = items.findIndex((i: any) => i.id === item.id);
            if (index !== -1) {
                items[index] = item;
            } else {
                items.push(item);
            }
        } else {
            const newItem = { ...item, id: generateId() };
            items.push(newItem);
            item = newItem;
        }
        await AsyncStorage.setItem(key, JSON.stringify(items));
        return item;
    },

    async delete(key: string, id: string): Promise<void> {
        const items = await this.getAll<any>(key);
        const filtered = items.filter((i: any) => i.id !== id);
        await AsyncStorage.setItem(key, JSON.stringify(filtered));
    },

    // Specific logic for Prescriptions (joins)
    async getPrescriptionsPopulated(): Promise<any[]> {
        const prescriptions = await this.getAll<any>(KEYS.PRESCRIPTIONS);
        const diseases = await this.getAll<any>(KEYS.DISEASES);
        const medicines = await this.getAll<any>(KEYS.MEDICINES);

        return prescriptions.map(p => ({
            ...p,
            disease: diseases.find(d => d.id === p.diseaseId) || { name: 'Unknown' },
            prescriptionMedicines: (p.medicines || []).map((pm: any) => ({
                ...pm,
                medicine: medicines.find(m => m.id === pm.medicineId) || { name: 'Unknown' }
            }))
        }));
    },

    // Reminder logic
    async getUpcomingReminders(): Promise<any[]> {
        const prescriptions = await this.getPrescriptionsPopulated();
        const reminders: any[] = [];

        prescriptions.forEach(p => {
            (p.scheduledTimes || []).forEach((time: string) => {
                (p.prescriptionMedicines || []).forEach((pm: any) => {
                    reminders.push({
                        time,
                        medicine: pm.medicine.name,
                        dosage: pm.dosage,
                        prescriptionId: p.id,
                        disease: p.disease.name
                    });
                });
            });
        });

        return reminders.sort((a, b) => a.time.localeCompare(b.time));
    }
};

export { KEYS };
