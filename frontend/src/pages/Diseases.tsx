import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Activity, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Disease {
    id: string;
    name: string;
    description: string;
}

export function Diseases() {
    const { t } = useTranslation();
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchDiseases = React.useCallback(async () => {
        try {
            const res = await api.get('/diseases');
            setDiseases(res.data);
        } catch {
            console.error(t('diseases.failed_fetch'));
        }
    }, [t]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDiseases();
    }, [fetchDiseases]);

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (d: Disease) => {
        setFormData({ name: d.name, description: d.description || '' });
        setEditingId(d.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/diseases/${id}`);
            fetchDiseases();
        } catch {
            alert(t('common.failed_delete'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/diseases/${editingId}`, formData);
            } else {
                await api.post('/diseases', formData);
            }
            resetForm();
            fetchDiseases();
        } catch {
            alert(editingId ? t('common.failed_update') : t('diseases.failed_add'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">{t('diseases.title')}</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? t('common.close') : t('diseases.add_button')}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">{editingId ? t('diseases.edit_title') : t('diseases.add_title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder={t('diseases.name_placeholder')} className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <textarea placeholder={t('diseases.description_placeholder')} className="w-full p-2 border rounded-lg" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? t('common.update') : t('common.save')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {diseases.map((d) => (
                    <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg mr-3">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{d.name}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleEdit(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600">{d.description || t('diseases.no_description')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

