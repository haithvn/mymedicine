import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Plus, CalendarClock, Trash2, Pencil, Clock, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

interface Prescription {
    id: string;
    diseaseId: string;
    disease: { name: string };
    frequency: string;
    scheduledTimes: string[];
    prescriptionMedicines: { medicineId: string, medicine: { name: string }, dosage: string }[];
}

interface Disease { id: string; name: string; }
interface Medicine { id: string; name: string; }

export default function Prescriptions() {
    const { t } = useTranslation();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        diseaseId: '',
        frequency: 'Daily',
        scheduledTimes: ['08:00'],
        medicines: [{ medicineId: '', dosage: '' }]
    });

    const [pickerModal, setPickerModal] = useState<{ visible: boolean, type: 'disease' | 'medicine', index?: number }>({ visible: false, type: 'disease' });

    const fetchData = useCallback(async () => {
        try {
            const [pRes, dRes, mRes] = await Promise.all([
                api.get('/prescriptions'),
                api.get('/diseases'),
                api.get('/medicines')
            ]);
            setPrescriptions(pRes.data);
            setDiseases(dRes.data);
            setMedicines(mRes.data);
        } catch {
            console.error(t('common.failed_fetch'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const resetForm = () => {
        setFormData({
            diseaseId: '',
            frequency: 'Daily',
            scheduledTimes: ['08:00'],
            medicines: [{ medicineId: '', dosage: '' }]
        });
        setEditingId(null);
        setIsModalVisible(false);
    };

    const handleEdit = (p: Prescription) => {
        setFormData({
            diseaseId: p.diseaseId,
            frequency: p.frequency,
            scheduledTimes: p.scheduledTimes || [],
            medicines: p.prescriptionMedicines.map(pm => ({
                medicineId: pm.medicineId,
                dosage: pm.dosage
            }))
        });
        setEditingId(p.id);
        setIsModalVisible(true);
    };

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
                            await api.delete(`/prescriptions/${id}`);
                            fetchData();
                        } catch {
                            Alert.alert(t('common.failed_delete'));
                        }
                    }
                }
            ]
        );
    };

    const handleAddMedicineRow = () => {
        setFormData({ ...formData, medicines: [...formData.medicines, { medicineId: '', dosage: '' }] });
    };

    const handleRemoveMedicineRow = (index: number) => {
        const newMeds = [...formData.medicines];
        newMeds.splice(index, 1);
        setFormData({ ...formData, medicines: newMeds });
    };

    const handleMedicineChange = (index: number, field: 'medicineId' | 'dosage', value: string) => {
        const newMeds = [...formData.medicines];
        newMeds[index] = { ...newMeds[index], [field]: value };
        setFormData({ ...formData, medicines: newMeds });
    };

    const handleSubmit = async () => {
        if (!formData.diseaseId || formData.medicines.some(m => !m.medicineId || !m.dosage)) {
            Alert.alert(t('common.failed_save'), t('common.fill_required'));
            return;
        }

        try {
            if (editingId) {
                await api.patch(`/prescriptions/${editingId}`, formData);
            } else {
                await api.post('/prescriptions', formData);
            }
            resetForm();
            fetchData();
        } catch {
            Alert.alert(editingId ? t('common.failed_update') : t('common.failed_save'));
        }
    };

    const openPicker = (type: 'disease' | 'medicine', index?: number) => {
        setPickerModal({ visible: true, type, index });
    };

    const selectItem = (id: string) => {
        if (pickerModal.type === 'disease') {
            setFormData({ ...formData, diseaseId: id });
        } else if (pickerModal.type === 'medicine' && pickerModal.index !== undefined) {
            handleMedicineChange(pickerModal.index, 'medicineId', id);
        }
        setPickerModal({ ...pickerModal, visible: false });
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
                    <Text className="text-3xl font-bold text-gray-900">{t('prescriptions.title')}</Text>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        className="bg-purple-600 p-3 rounded-full shadow-lg"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="gap-6">
                    {prescriptions.map((p) => (
                        <View key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <View className="flex-row justify-between mb-4">
                                <View className="flex-row items-center flex-1">
                                    <View className="p-3 bg-purple-50 rounded-2xl mr-3">
                                        <CalendarClock size={24} color="#A855F7" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>{p.disease.name}</Text>
                                        <Text className="text-sm text-gray-500">{p.frequency} • {p.scheduledTimes?.join(', ')}</Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity onPress={() => handleEdit(p)} className="p-2 bg-blue-50 rounded-xl">
                                        <Pencil size={16} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(p.id)} className="p-2 bg-red-50 rounded-xl">
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className="mt-2 space-y-2">
                                {p.prescriptionMedicines.map((pm, i) => (
                                    <View key={i} className="flex-row justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                        <Text className="font-medium text-gray-800 flex-1">{pm.medicine.name}</Text>
                                        <Text className="text-purple-600 font-bold ml-2">{pm.dosage}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6 max-h-[90%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">{editingId ? t('prescriptions.edit_title') : t('prescriptions.add_title')}</Text>
                            <TouchableOpacity onPress={resetForm}><Text className="text-blue-600 font-medium">{t('common.close')}</Text></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="gap-6 pb-10">
                                <View>
                                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('prescriptions.disease_label')}</Text>
                                    <TouchableOpacity onPress={() => openPicker('disease')} className="flex-row justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <Text className={formData.diseaseId ? "text-gray-900" : "text-gray-400"}>
                                            {diseases.find(d => d.id === formData.diseaseId)?.name || t('prescriptions.select_disease')}
                                        </Text>
                                        <ChevronDown size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('prescriptions.frequency_label')}</Text>
                                    <View className="flex-row gap-2">
                                        {['Daily', 'Weekly', 'As Needed'].map((freq) => (
                                            <TouchableOpacity
                                                key={freq}
                                                onPress={() => setFormData({ ...formData, frequency: freq })}
                                                className={`flex-1 p-3 rounded-xl border ${formData.frequency === freq ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'}`}
                                            >
                                                <Text className={`text-center text-xs font-bold ${formData.frequency === freq ? 'text-purple-600' : 'text-gray-500'}`}>{t(`prescriptions.${freq.toLowerCase().replace(' ', '_')}`)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('prescriptions.scheduled_times')}</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {formData.scheduledTimes.map((time, idx) => (
                                            <View key={idx} className="flex-row items-center bg-gray-50 rounded-xl p-2 border border-gray-100">
                                                <Clock size={16} color="#9CA3AF" className="mr-2" />
                                                <TextInput
                                                    className="text-gray-900 font-medium p-0 mr-2 min-w-[50px]"
                                                    value={time}
                                                    placeholder="00:00"
                                                    onChangeText={(text) => {
                                                        const newTimes = [...formData.scheduledTimes];
                                                        newTimes[idx] = text;
                                                        setFormData({ ...formData, scheduledTimes: newTimes });
                                                    }}
                                                />
                                                {idx > 0 && (
                                                    <TouchableOpacity onPress={() => {
                                                        const newTimes = [...formData.scheduledTimes];
                                                        newTimes.splice(idx, 1);
                                                        setFormData({ ...formData, scheduledTimes: newTimes });
                                                    }}><Trash2 size={14} color="#EF4444" /></TouchableOpacity>
                                                )}
                                            </View>
                                        ))}
                                        <TouchableOpacity
                                            onPress={() => setFormData({ ...formData, scheduledTimes: [...formData.scheduledTimes, '08:00'] })}
                                            className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-100"
                                        >
                                            <Text className="text-purple-600 font-bold text-xs">+ {t('prescriptions.add_time')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('prescriptions.medicines_label')}</Text>
                                        <TouchableOpacity onPress={handleAddMedicineRow}><Text className="text-blue-600 text-xs font-bold">+ {t('prescriptions.add_medicine')}</Text></TouchableOpacity>
                                    </View>
                                    {formData.medicines.map((item, idx) => (
                                        <View key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-2">
                                            <TouchableOpacity onPress={() => openPicker('medicine', idx)} className="flex-row justify-between items-center mb-3">
                                                <Text className={item.medicineId ? "text-gray-900 font-bold" : "text-gray-400 font-bold"}>
                                                    {medicines.find(m => m.id === item.medicineId)?.name || t('prescriptions.select_medicine')}
                                                </Text>
                                                <ChevronDown size={18} color="#9CA3AF" />
                                            </TouchableOpacity>
                                            <View className="flex-row items-center">
                                                <TextInput
                                                    className="flex-1 bg-white p-3 rounded-xl border border-gray-100"
                                                    placeholder={t('prescriptions.dosage_placeholder')}
                                                    value={item.dosage}
                                                    onChangeText={(text) => handleMedicineChange(idx, 'dosage', text)}
                                                />
                                                {formData.medicines.length > 1 && (
                                                    <TouchableOpacity onPress={() => handleRemoveMedicineRow(idx)} className="ml-3 p-2 bg-red-50 rounded-xl">
                                                        <Trash2 size={16} color="#EF4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity onPress={handleSubmit} className="bg-purple-600 p-5 rounded-2xl shadow-lg mt-4">
                                    <Text className="text-white text-center font-bold text-lg">{editingId ? t('common.update') : t('common.save')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal visible={pickerModal.visible} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/60 justify-center p-6">
                    <View className="bg-white rounded-[32px] overflow-hidden max-h-[70%]">
                        <View className="p-6 border-b border-gray-50 flex-row justify-between items-center">
                            <Text className="text-xl font-bold text-gray-900">
                                {pickerModal.type === 'disease' ? t('prescriptions.select_disease') : t('prescriptions.select_medicine')}
                            </Text>
                            <TouchableOpacity onPress={() => setPickerModal({ ...pickerModal, visible: false })}><Text className="text-gray-400 font-bold">X</Text></TouchableOpacity>
                        </View>
                        <FlatList
                            data={pickerModal.type === 'disease' ? diseases : medicines}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => selectItem(item.id)} className="p-5 border-b border-gray-50 active:bg-gray-50">
                                    <Text className="text-gray-800 font-medium">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<View className="p-10 items-center"><Text className="text-gray-400">{t('common.no_data')}</Text></View>}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
