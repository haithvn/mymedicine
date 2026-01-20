import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Plus, Archive, AlertTriangle, Pencil, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

interface Medicine {
    id: string;
    name: string;
    manufacturer: string;
    activeIngredients: string;
    quantity: number;
    unit: string;
    status: 'available' | 'out_of_stock';
}

export default function Medicines() {
    const { t } = useTranslation();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMedicines = useCallback(async () => {
        try {
            const res = await api.get('/medicines');
            setMedicines(res.data);
        } catch {
            console.error(t('medicines.failed_fetch'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const handleDelete = async (id: string) => {
        Alert.alert(
            t('common.confirm_delete'),
            '',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/medicines/${id}`);
                            fetchMedicines();
                        } catch {
                            Alert.alert(t('common.failed_delete'));
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 p-6">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-bold text-gray-900">{t('medicines.title')}</Text>
                    <TouchableOpacity className="bg-blue-600 p-3 rounded-full shadow-lg">
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {medicines.map((med) => (
                        <View key={med.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 w-full relative">
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="p-3 bg-indigo-50 rounded-2xl">
                                    <Archive size={24} color="#6366F1" />
                                </View>
                                <View className="flex-row gap-2">
                                    {med.quantity === 0 && (
                                        <View className="bg-red-100 flex-row items-center px-2 py-1 rounded-full h-fit">
                                            <AlertTriangle size={12} color="#EF4444" />
                                            <Text className="text-red-600 text-[10px] ml-1 font-bold">{t('medicines.out_of_stock')}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => handleDelete(med.id)} className="p-2 bg-red-50 rounded-xl">
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text className="text-lg font-bold text-gray-900 mb-1">{med.name}</Text>
                            <Text className="text-sm text-gray-500 mb-4">{med.manufacturer || t('medicines.no_brand')}</Text>
                            <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
                                <Text className="text-xs text-gray-600">
                                    {t('medicines.stock')} <Text className="font-bold text-gray-900">{med.quantity}</Text> {med.unit}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
