import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Pill, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InstallAppBanner } from '../components/InstallAppBanner';
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
    disease: { name: string };
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

                setReminders(remRes.data);
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

    // 1. Stock Status: Medicines below 5 units
    const getLowStockMedicines = () => {
        return medicines
            .filter(m => m.quantity < 5)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5)
            .map(m => ({ name: m.name, quantity: m.quantity }));
    };

    // 2. Peak Hours: Hourly distribution (0-23)
    const getIntakePeakHours = () => {
        const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, count: 0 }));
        prescriptions.forEach(p => {
            p.scheduledTimes?.forEach(time => {
                const h = parseInt(time.split(':')[0]);
                hours[h].count++;
            });
        });
        // Filter out hours with 0 count to make it cleaner, or keep all? 
        // Let's keep 4 main blocks or all if not too crowded.
        return hours.filter(h => h.count > 0);
    };

    // 3. Medication by Disease: Pie Chart
    const getMedicationByDisease = () => {
        const counts: Record<string, number> = {};
        prescriptions.forEach(p => {
            const diseaseName = p.disease?.name || 'Unknown';
            counts[diseaseName] = (counts[diseaseName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    // 4. Daily Adherence: Radial/Progress
    const getDailyAdherence = () => {
        const currentTimeStr = format(now, 'HH:mm');
        const total = reminders.length;
        const taken = reminders.filter(r => r.time <= currentTimeStr).length;
        const percent = total > 0 ? Math.round((taken / total) * 100) : 0;

        return [
            { name: 'Completed', value: percent, fill: '#10B981' },
            { name: 'Remaining', value: 100 - percent, fill: '#F3F4F6' }
        ];
    };

    const stockData = getLowStockMedicines();
    const peakHoursData = getIntakePeakHours();
    const diseaseData = getMedicationByDisease();
    const adherenceData = getDailyAdherence();

    const currentLocale = i18n.language === 'vi' ? vi : enUS;

    return (
        <div className="space-y-8 pb-10">
            <InstallAppBanner />
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
                            <p className="text-2xl font-bold text-gray-900">
                                {reminders.filter(r => r.time > format(now, 'HH:mm')).length}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-indigo-100 rounded-full text-indigo-600"><CheckCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.prescriptions_added')}</p>
                            <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                        </div>
                    </div>

                    {/* Bar Chart: Stock Status (Horizontal) */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">{t('dashboard.stock_status')}</h3>
                            {stockData.length > 0 && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                    {t('dashboard.low_stock_warning')}
                                </span>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={stockData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} fontSize={12} />
                                <Tooltip cursor={{ fill: '#FEF2F2' }} />
                                <Bar dataKey="quantity" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
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
                        ) : reminders.filter(r => r.time > format(now, 'HH:mm')).length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <CheckCircle className="w-12 h-12 text-gray-200 mb-3" />
                                {t('dashboard.no_scheduled')}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {reminders
                                    .filter(rem => rem.time > format(now, 'HH:mm'))
                                    .sort((a, b) => a.time.localeCompare(b.time))
                                    .map((rem: Reminder, idx: number) => (
                                        <div key={idx} className="p-4 flex items-center hover:bg-gray-50 transition-all border-l-4 border-transparent hover:border-blue-500 cursor-pointer">
                                            <div className="w-14 text-center">
                                                <p className="text-lg font-bold leading-none text-blue-600">{rem.time.split(':')[0]}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{parseInt(rem.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</p>
                                            </div>
                                            <div className="flex-1 ml-4 overflow-hidden">
                                                <h3 className="font-bold truncate text-gray-900">{rem.medicine}</h3>
                                                <p className="text-xs text-gray-500 truncate">{rem.dosage} • {rem.disease}</p>
                                            </div>
                                            <div className="text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap bg-yellow-100 text-yellow-700">
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
                {/* Bar Chart: Peak Hours */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4">{t('dashboard.peak_hours')}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={peakHoursData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="hour" axisLine={false} tickLine={false} fontSize={10} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#EEF2FF' }} />
                            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart: Medication by Disease */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold mb-4">{t('dashboard.medication_by_disease')}</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={diseaseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {diseaseData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Radial Progress: Adherence */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4 w-full text-left">{t('dashboard.adherence_progress')}</h3>
                    <div className="relative w-full h-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={adherenceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {adherenceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-bold text-gray-900">{adherenceData[0].value}%</span>
                            <span className="text-xs text-green-600 font-bold uppercase">{t('dashboard.taken')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
