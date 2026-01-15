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

interface Medicine {
    id: string;
    name: string;
    quantity: number;
}

interface Prescription {
    id: string;
    createdAt: string;
    scheduledTimes: string[];
    prescriptionMedicines: { medicine: { name: string } }[];
}

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export function Dashboard() {
    const { t, i18n } = useTranslation();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const fetchData = async () => {
            try {
                const [remRes, medRes, preRes] = await Promise.all([
                    api.get('/reminders/upcoming'),
                    api.get('/medicines'),
                    api.get('/prescriptions')
                ]);

                setReminders(remRes.data.slice(0, 5));
                setMedicines(medRes.data);
                setPrescriptions(preRes.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Aggregation Logic
    const getMonthlyPrescriptions = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(m => ({ month: m, count: 0 }));

        prescriptions.forEach(p => {
            const date = new Date(p.createdAt);
            const monthIdx = date.getMonth();
            data[monthIdx].count++;
        });

        // Show last 6 months including current
        const currentMonth = new Date().getMonth();
        return data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    };

    const getTopMedicines = () => {
        const counts: Record<string, number> = {};
        prescriptions.forEach(p => {
            p.prescriptionMedicines.forEach(pm => {
                const name = pm.medicine.name;
                counts[name] = (counts[name] || 0) + 1;
            });
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);
    };

    const getMedicineStats = () => {
        // Simple usage trend: total doses per month (approximate based on prescriptions)
        const data: Record<string, number> = {};
        prescriptions.forEach(p => {
            const month = format(new Date(p.createdAt), 'MMM');
            const dailyDoses = (p.scheduledTimes?.length || 0);
            data[month] = (data[month] || 0) + (dailyDoses * 30); // Approx monthly doses
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months
            .filter(m => data[m] !== undefined)
            .map(m => ({ month: m, usage: data[m] }));
    };

    const getFrequencyTrend = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map(d => {
            // Very basic mock logic: assume equal distribution for demo of "trend"
            const total = prescriptions.reduce((acc, p) => acc + (p.scheduledTimes?.length || 0), 0);
            return { day: d, freq: Math.round(total / 7) + Math.floor(Math.random() * 2) };
        });
    };

    const monthlyData = getMonthlyPrescriptions();
    const topMedData = getTopMedicines();
    const medStatsData = getMedicineStats();
    const freqTrendData = getFrequencyTrend();

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
                            <BarChart data={monthlyData}>
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
                                {reminders
                                    .sort((a, b) => a.time.localeCompare(b.time))
                                    .map((rem: Reminder, idx: number) => {
                                        const currentTimeStr = format(now, 'HH:mm');
                                        const isPast = rem.time <= currentTimeStr;

                                        return (
                                            <div key={idx} className="p-4 flex items-center hover:bg-gray-50 transition-all border-l-4 border-transparent hover:border-blue-500 cursor-pointer">
                                                <div className="w-14 text-center">
                                                    <p className={`text-lg font-bold leading-none ${isPast ? 'text-gray-400' : 'text-blue-600'}`}>{rem.time.split(':')[0]}</p>
                                                    <p className="text-[10px] font-bold text-gray-400">{parseInt(rem.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</p>
                                                </div>
                                                <div className="flex-1 ml-4 overflow-hidden">
                                                    <h3 className={`font-bold truncate ${isPast ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{rem.medicine}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{rem.dosage} • {rem.disease}</p>
                                                </div>
                                                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${isPast ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {isPast ? t('dashboard.taken') : t('dashboard.pending')}
                                                </div>
                                            </div>
                                        );
                                    })}
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
                        <LineChart data={medStatsData}>
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
                                data={topMedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1500}
                            >
                                {topMedData.map((_, index) => (
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
                        <AreaChart data={freqTrendData}>
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
