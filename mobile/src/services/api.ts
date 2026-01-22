import { StorageService, KEYS } from './storage';

// We mock the axios-like interface to avoid changing UI code
export const api = {
    get: async (url: string) => {
        if (url === '/medicines') return { data: await StorageService.getAll(KEYS.MEDICINES) };
        if (url === '/diseases') return { data: await StorageService.getAll(KEYS.DISEASES) };
        if (url === '/prescriptions') return { data: await StorageService.getPrescriptionsPopulated() };
        if (url === '/reminders/upcoming') return { data: await StorageService.getUpcomingReminders() };
        return { data: [] };
    },
    post: async (url: string, data: any) => {
        if (url === '/medicines') return { data: await StorageService.save(KEYS.MEDICINES, data) };
        if (url === '/diseases') return { data: await StorageService.save(KEYS.DISEASES, data) };
        if (url === '/prescriptions') return { data: await StorageService.save(KEYS.PRESCRIPTIONS, data) };
        return { data: null };
    },
    patch: async (url: string, data: any) => {
        const id = url.split('/').pop();
        const base = url.split('/')[1];
        const key = base === 'medicines' ? KEYS.MEDICINES : base === 'diseases' ? KEYS.DISEASES : KEYS.PRESCRIPTIONS;
        return { data: await StorageService.save(key, { ...data, id }) };
    },
    delete: async (url: string) => {
        const id = url.split('/').pop() || '';
        const base = url.split('/')[1];
        const key = base === 'medicines' ? KEYS.MEDICINES : base === 'diseases' ? KEYS.DISEASES : KEYS.PRESCRIPTIONS;
        await StorageService.delete(key, id);
        return { data: null };
    }
};
