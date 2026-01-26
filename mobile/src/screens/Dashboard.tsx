import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Platform, Linking } from 'react-native';
import { Pill, CheckCircle, Clock, Download, X, Languages } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { api } from '../services/api';
import { changeLanguage, loadSavedLanguage } from '../i18n';
import { BarChart, PieChart } from 'react-native-chart-kit';



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

// TODO: Replace with Google Play Store link in production
const APK_DOWNLOAD_URL = 'https://expo.dev/artifacts/eas/nzqs47ULbAQN7Ghmk9xjuG.apk';

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());
    const [showInstallBanner, setShowInstallBanner] = useState(Platform.OS === 'web');
    const { width: windowWidth } = useWindowDimensions();
    const chartWidth = windowWidth - 48; // Account for p-6 (24*2)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load saved language on mount
    useEffect(() => {
        loadSavedLanguage();
    }, []);

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

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const getIntakePeakHours = () => {
        const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
        prescriptions.forEach(p => {
            p.scheduledTimes?.forEach(time => {
                const h = parseInt(time.split(':')[0]);
                hours[h].count++;
            });
        });
        const filtered = hours.filter(h => h.count > 0);
        return {
            labels: filtered.map(h => `${h.hour}h`),
            datasets: [{ data: filtered.map(h => h.count) }]
        };
    };

    const getLowStockMedicines = () => {
        const filtered = medicines
            .filter(m => m.quantity < 5)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5);
        return {
            labels: filtered.map(m => m.name),
            datasets: [{ data: filtered.map(m => m.quantity) }]
        };
    };

    const getMedicationByDisease = () => {
        const counts: Record<string, number> = {};
        prescriptions.forEach(p => {
            const diseaseName = p.disease?.name || 'Unknown';
            counts[diseaseName] = (counts[diseaseName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value], index) => ({
            name: name,
            population: value,
            color: COLORS[index % COLORS.length],
            legendFontColor: "#7F7F7F",
            legendFontSize: 11
        }));
    };

    const getDailyAdherence = () => {
        const currentTimeStr = format(now, 'HH:mm');
        const total = reminders.length;
        const taken = reminders.filter(r => r.time <= currentTimeStr).length;
        const percent = total > 0 ? Math.round((taken / total) * 100) : 0;
        return percent;
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-500">{t('common.loading')}</Text>
            </View>
        );
    }

    const stockData = getLowStockMedicines();
    const diseaseData = getMedicationByDisease();
    const peakHoursData = getIntakePeakHours();
    const adherencePercent = getDailyAdherence();
    const upcomingReminders = reminders.filter(r => r.time > format(now, 'HH:mm'));

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-6">
                {/* Header with Language Switcher */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</Text>
                            <Text className="text-gray-500 mt-1">{t('dashboard.summary')}</Text>
                        </View>
                        {/* Language Switcher */}
                        <View className="flex-row items-center bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                            <Languages size={16} color="#6B7280" />
                            <TouchableOpacity
                                onPress={() => changeLanguage('en')}
                                className={`ml-2 px-2 py-1 rounded-lg ${i18n.language === 'en' ? 'bg-blue-100' : ''}`}
                            >
                                <Text className={`text-sm font-bold ${i18n.language === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => changeLanguage('vi')}
                                className={`px-2 py-1 rounded-lg ${i18n.language === 'vi' ? 'bg-blue-100' : ''}`}
                            >
                                <Text className={`text-sm font-bold ${i18n.language === 'vi' ? 'text-blue-600' : 'text-gray-400'}`}>VI</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Install App Banner - Only on mobile web */}
                {showInstallBanner && (
                    <View className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-3xl mb-6 shadow-lg">
                        <TouchableOpacity
                            onPress={() => setShowInstallBanner(false)}
                            className="absolute top-3 right-3 z-10"
                        >
                            <X size={20} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row items-center mb-3">
                            <View className="bg-white/20 p-2 rounded-xl mr-3">
                                <Download size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">{t('dashboard.install_app_title')}</Text>
                                <Text className="text-white/80 text-sm">{t('dashboard.install_app_desc')}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(APK_DOWNLOAD_URL)}
                            className="bg-white py-3 rounded-2xl"
                        >
                            <Text className="text-blue-600 font-bold text-center">{t('dashboard.download_apk')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Clock Card */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-row items-center mb-8">
                    <View className="p-4 bg-blue-50 text-blue-600 rounded-2xl mr-4">
                        <Clock size={24} color="#3B82F6" />
                    </View>
                    <View>
                        <Text className="text-xs text-blue-600 font-bold uppercase tracking-wider">{t('dashboard.current_time')}</Text>
                        <Text className="text-2xl font-mono font-bold text-gray-900">{format(now, 'HH:mm:ss')}</Text>
                        <Text className="text-xs text-gray-500">{format(now, 'EEEE, dd MMMM yyyy')}</Text>
                    </View>
                </View>

                {/* Stats & Adherence Row */}
                <View className="flex-row mb-8">
                    <View className="flex-1 mr-4">
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex-row items-center">
                            <View className="p-2 bg-blue-100 rounded-full mr-3"><Pill size={20} color="#2563EB" /></View>
                            <View>
                                <Text className="text-[10px] text-gray-500">{t('dashboard.upcoming_reminders')}</Text>
                                <Text className="text-lg font-bold text-gray-900">{upcomingReminders.length}</Text>
                            </View>
                        </View>
                        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-row items-center">
                            <View className="p-2 bg-indigo-100 rounded-full mr-3"><CheckCircle size={20} color="#4F46E5" /></View>
                            <View>
                                <Text className="text-[10px] text-gray-500">{t('dashboard.prescriptions_added')}</Text>
                                <Text className="text-lg font-bold text-gray-900">{prescriptions.length}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 items-center justify-center">
                        <Text className="text-[10px] font-bold text-gray-500 uppercase mb-2">{t('dashboard.adherence_progress')}</Text>
                        <View className="items-center justify-center">
                            <Text className="text-3xl font-bold text-green-600">{adherencePercent}%</Text>
                            <Text className="text-[10px] text-gray-400 font-bold uppercase">{t('dashboard.taken')}</Text>
                        </View>
                    </View>
                </View>

                {/* Today's Schedule */}
                <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <View className="p-6 border-b border-gray-100 flex-row justify-between items-center">
                        <Text className="text-lg font-semibold text-gray-900">{t('dashboard.todays_schedule')}</Text>
                    </View>
                    <View className="p-2">
                        {upcomingReminders.length === 0 ? (
                            <View className="p-8 items-center">
                                <CheckCircle size={48} color="#E5E7EB" />
                                <Text className="mt-3 text-gray-500 text-center">{t('dashboard.no_scheduled')}</Text>
                            </View>
                        ) : (
                            upcomingReminders
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map((rem, idx) => (
                                    <View key={idx} className="p-4 flex-row items-center border-b border-gray-50 last:border-0">
                                        <View className="w-12 items-center">
                                            <Text className="text-lg font-bold text-blue-600">{rem.time.split(':')[0]}</Text>
                                            <Text className="text-[10px] font-bold text-gray-400">{parseInt(rem.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</Text>
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className="font-bold text-gray-900">{rem.medicine}</Text>
                                            <Text className="text-xs text-gray-500">{rem.dosage} • {rem.disease}</Text>
                                        </View>
                                        <View className="bg-yellow-100 px-2 py-1 rounded-lg">
                                            <Text className="text-[10px] font-bold text-yellow-700">{t('dashboard.pending')}</Text>
                                        </View>
                                    </View>
                                ))
                        )}
                    </View>
                </View>

                {/* Stock Chart */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <Text className="text-lg font-semibold mb-4">{t('dashboard.stock_status')}</Text>
                    {stockData.labels.length > 0 ? (
                        <BarChart
                            data={stockData}
                            width={chartWidth - 32}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                                style: { borderRadius: 16 },
                                barPercentage: 0.5,
                            }}
                            verticalLabelRotation={30}
                            fromZero
                        />
                    ) : (
                        <View className="h-[200px] items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                            <Text className="text-gray-400">{t('common.no_data')}</Text>
                        </View>
                    )}
                </View>

                {/* Peak Hours Chart */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <Text className="text-lg font-semibold mb-4">{t('dashboard.peak_hours')}</Text>
                    {peakHoursData.labels.length > 0 ? (
                        <BarChart
                            data={peakHoursData}
                            width={chartWidth - 32}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                                style: { borderRadius: 16 },
                                barPercentage: 0.6,
                            }}
                            fromZero
                        />
                    ) : (
                        <View className="h-[200px] items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                            <Text className="text-gray-400">{t('common.no_data')}</Text>
                        </View>
                    )}
                </View>

                {/* Disease Distribution */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <Text className="text-lg font-semibold mb-4">{t('dashboard.medication_by_disease')}</Text>
                    {diseaseData.length > 0 ? (
                        <PieChart
                            data={diseaseData}
                            width={chartWidth - 48}
                            height={200}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            center={[10, 0]}
                            absolute
                        />
                    ) : (
                        <View className="h-[200px] items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                            <Text className="text-gray-400">{t('common.no_data')}</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
