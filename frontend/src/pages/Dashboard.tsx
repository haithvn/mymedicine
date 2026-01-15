import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Pill, CheckCircle } from 'lucide-react';

interface Reminder {
    time: string;
    medicine: string;
    dosage: string;
    prescriptionId: string;
    disease: string;
}

export function Dashboard() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const fetchReminders = async () => {
            try {
                const res = await api.get('/reminders/upcoming');
                setReminders(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchReminders();

        // Polling every minute for updates/notifications
        const interval = setInterval(() => {
            fetchReminders();
            // Here we would also trigger notifications if time matches
            checkReminders();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const checkReminders = () => {
        // Simplified check for demo
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600"><Pill className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Upcoming Reminders</p>
                        <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
                    </div>
                </div>
                {/* Add more stats here */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading schedule...</div>
                ) : reminders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        No medicines scheduled for today.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reminders.map((rem: Reminder, idx: number) => (
                            <div key={idx} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                                <div className="w-16 font-mono text-lg font-medium text-blue-600">{rem.time}</div>
                                <div className="flex-1 ml-4">
                                    <h3 className="font-semibold text-gray-900">{rem.medicine}</h3>
                                    <p className="text-sm text-gray-500">{rem.dosage} • {rem.disease}</p>
                                </div>
                                <div className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                    Pending
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
