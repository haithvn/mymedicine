import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Pill, CheckCircle, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { api } from '../services/api';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

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

export default function Dashboard() {
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

    const getLowStockMedicines = () => {
        const data = medicines
            .filter(m => m.quantity < 5)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5);

        return {
            labels: data.map(m => m.name),
            datasets: [{ data: data.map(m => m.quantity) }]
        };
    };

    const getMedicationByDisease = () => {
        const counts: Record<string, number> = {};
        prescriptions.forEach(p => {
            const diseaseName = p.disease?.name || 'Unknown';
            counts[diseaseName] = (counts[diseaseName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value], index) => ({
            name,
            population: value,
            color: COLORS[index % COLORS.length],
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        }));
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
    const upcomingReminders = reminders.filter(r => r.time > format(now, 'HH:mm'));

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-6">
                {/* Header */}
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</Text>
                    <Text className="text-gray-500 mt-1">{t('dashboard.summary')}</Text>
                </View>

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

                {/* Stats Row */}
                <View className="flex-row justify-between mb-8">
                    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 mr-4 flex-row items-center">
                        <View className="p-2 bg-blue-100 rounded-full mr-3"><Pill size={20} color="#2563EB" /></View>
                        <View>
                            <Text className="text-[10px] text-gray-500">{t('dashboard.upcoming_reminders')}</Text>
                            <Text className="text-lg font-bold text-gray-900">{upcomingReminders.length}</Text>
                        </View>
                    </View>
                    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 flex-row items-center">
                        <View className="p-2 bg-indigo-100 rounded-full mr-3"><CheckCircle size={20} color="#4F46E5" /></View>
                        <View>
                            <Text className="text-[10px] text-gray-500">{t('dashboard.prescriptions_added')}</Text>
                            <Text className="text-lg font-bold text-gray-900">{prescriptions.length}</Text>
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
                {stockData.labels.length > 0 && (
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-semibold">{t('dashboard.stock_status')}</Text>
                        </View>
                        <BarChart
                            data={stockData}
                            width={screenWidth - 80}
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
                                barPercentage: 0.6,
                            }}
                            verticalLabelRotation={30}
                            fromZero
                        />
                    </View>
                )}

                {/* Disease Distribution */}
                <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <Text className="text-lg font-semibold mb-4">{t('dashboard.medication_by_disease')}</Text>
                    <PieChart
                        data={diseaseData}
                        width={screenWidth - 80}
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
                </View>
            </View>
        </ScrollView>
    );
}
