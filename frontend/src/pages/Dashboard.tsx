import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Pill, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface Reminder {
    time: string;
    medicine: string;
    dosage: string;
    prescriptionId: string;
    disease: string;
}

// Mock Data for Charts
const monthlyPrescriptions = [
    { month: 'Jan', count: 4 },
    { month: 'Feb', count: 7 },
    { month: 'Mar', count: 5 },
    { month: 'Apr', count: 8 },
    { month: 'May', count: 12 },
    { month: 'Jun', count: 9 },
];

const medicineStats = [
    { month: 'Jan', usage: 120 },
    { month: 'Feb', usage: 150 },
    { month: 'Mar', usage: 130 },
    { month: 'Apr', usage: 180 },
    { month: 'May', usage: 210 },
    { month: 'Jun', usage: 190 },
];

const topMedicines = [
    { name: 'Paracetamol', value: 40 },
    { name: 'Amoxicillin', value: 25 },
    { name: 'Vitamin C', value: 20 },
    { name: 'Ibuprofen', value: 15 },
];

const frequencyTrend = [
    { day: 'Mon', freq: 3 },
    { day: 'Tue', freq: 4 },
    { day: 'Wed', freq: 2 },
    { day: 'Thu', freq: 5 },
    { day: 'Fri', freq: 3 },
    { day: 'Sat', freq: 6 },
    { day: 'Sun', freq: 4 },
];

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

export function Dashboard() {
    const { t, i18n } = useTranslation();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Check permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const fetchReminders = async () => {
            try {
                const res = await api.get('/reminders/upcoming');
                // Ensure we only show 5 reminders as requested, or mock if empty
                const data = res.data.slice(0, 5);
                setReminders(data.length > 0 ? data : getMockReminders());
            } catch (e) {
                console.error(e);
                setReminders(getMockReminders());
            } finally {
                setLoading(false);
            }
        };

        fetchReminders();
        const interval = setInterval(fetchReminders, 60000);
        return () => clearInterval(interval);
    }, []);

    const getMockReminders = (): Reminder[] => [
        { time: '08:00', medicine: 'Paracetamol 500mg', dosage: '1 tab', prescriptionId: '1', disease: 'Flu' },
        { time: '12:00', medicine: 'Vitamin C 1000mg', dosage: '1 effervescent', prescriptionId: '2', disease: 'Supplement' },
        { time: '14:00', medicine: 'Ibuprofen 400mg', dosage: '1 tab', prescriptionId: '3', disease: 'Headache' },
        { time: '18:00', medicine: 'Amoxicillin 500mg', dosage: '1 cap', prescriptionId: '4', disease: 'Infection' },
        { time: '21:00', medicine: 'Melatonin 3mg', dosage: '1 tab', prescriptionId: '5', disease: 'Insomnia' },
    ];

    const currentLocale = i18n.language === 'vi' ? vi : enUS;

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Clock */}
            <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('dashboard.summary')}</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 animate-in fade-in zoom-in duration-500">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{t('dashboard.current_time')}</p>
                        <p className="text-xl font-mono font-bold text-gray-900">
                            {format(now, 'HH:mm:ss')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {format(now, 'EEEE, dd MMMM yyyy', { locale: currentLocale })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview & Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-600"><Pill className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.upcoming_reminders')}</p>
                            <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-indigo-100 rounded-full text-indigo-600"><CheckCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.prescriptions_added')}</p>
                            <p className="text-2xl font-bold text-gray-900">45</p>
                        </div>
                    </div>

                    {/* Bar Chart: Monthly Prescriptions */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                        <h3 className="text-lg font-semibold mb-4">{t('dashboard.monthly_prescriptions')}</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={monthlyPrescriptions}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reminders List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.todays_schedule')}</h2>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">VIP</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">{t('dashboard.loading_schedule')}</div>
                        ) : reminders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <CheckCircle className="w-12 h-12 text-gray-200 mb-3" />
                                {t('dashboard.no_scheduled')}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {reminders.map((rem: Reminder, idx: number) => (
                                    <div key={idx} className="p-4 flex items-center hover:bg-gray-50 transition-all border-l-4 border-transparent hover:border-blue-500 cursor-pointer">
                                        <div className="w-14 text-center">
                                            <p className="text-lg font-bold text-blue-600 leading-none">{rem.time.split(':')[0]}</p>
                                            <p className="text-[10px] font-bold text-gray-400">AM</p>
                                        </div>
                                        <div className="flex-1 ml-4 overflow-hidden">
                                            <h3 className="font-bold text-gray-900 truncate">{rem.medicine}</h3>
                                            <p className="text-xs text-gray-500 truncate">{rem.dosage} • {rem.disease}</p>
                                        </div>
                                        <div className="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg whitespace-nowrap">
                                            {t('dashboard.pending')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Line Chart: Medicine Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4">{t('dashboard.medicine_stats')}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={medicineStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="usage" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart: Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4">{t('dashboard.top_medicines')}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={topMedicines}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1500}
                            >
                                {topMedicines.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Area Chart: Frequency */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4">{t('dashboard.intake_frequency')}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={frequencyTrend}>
                            <defs>
                                <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="freq" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorFreq)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
