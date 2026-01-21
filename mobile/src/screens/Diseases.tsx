import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, Activity, Pencil, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

interface Disease {
    id: string;
    name: string;
    description: string;
}

export default function Diseases() {
    const { t } = useTranslation();
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchDiseases = useCallback(async () => {
        try {
            const res = await api.get('/diseases');
            setDiseases(res.data);
        } catch {
            console.error(t('diseases.failed_fetch'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDiseases();
    }, [fetchDiseases]);

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setIsModalVisible(false);
    };

    const handleEdit = (d: Disease) => {
        setFormData({ name: d.name, description: d.description || '' });
        setEditingId(d.id);
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
                            await api.delete(`/diseases/${id}`);
                            fetchDiseases();
                        } catch {
                            Alert.alert(t('common.failed_delete'));
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            Alert.alert(t('common.failed_save'), t('common.fill_required'));
            return;
        }

        try {
            if (editingId) {
                await api.patch(`/diseases/${editingId}`, formData);
            } else {
                await api.post('/diseases', formData);
            }
            resetForm();
            fetchDiseases();
        } catch {
            Alert.alert(editingId ? t('common.failed_update') : t('diseases.failed_add'));
        }
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
                    <Text className="text-3xl font-bold text-gray-900">{t('diseases.title')}</Text>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        className="bg-blue-600 p-3 rounded-full shadow-lg"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="gap-6">
                    {diseases.map((d) => (
                        <View key={d.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-row items-center">
                                    <View className="p-3 bg-rose-50 rounded-2xl mr-3">
                                        <Activity size={24} color="#F43F5E" />
                                    </View>
                                    <Text className="text-xl font-bold text-gray-900 max-w-[200px]" numberOfLines={1}>{d.name}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity onPress={() => handleEdit(d)} className="p-2 bg-blue-50 rounded-xl">
                                        <Pencil size={16} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(d.id)} className="p-2 bg-red-50 rounded-xl">
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text className="text-gray-600 leading-5">
                                {d.description || t('diseases.no_description')}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={resetForm}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end bg-black/50"
                >
                    <View className="bg-white rounded-t-[40px] p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">
                                {editingId ? t('diseases.edit_title') : t('diseases.add_title')}
                            </Text>
                            <TouchableOpacity onPress={resetForm}>
                                <Text className="text-blue-600 font-medium">{t('common.close')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="gap-4">
                            <View>
                                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('diseases.name_placeholder')}</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
                                    placeholder={t('diseases.name_placeholder')}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>

                            <View>
                                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('diseases.description_placeholder')}</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
                                    placeholder={t('diseases.description_placeholder')}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-blue-600 p-5 rounded-2xl shadow-lg mt-4"
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    {editingId ? t('common.update') : t('common.save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
