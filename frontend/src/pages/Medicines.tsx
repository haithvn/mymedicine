import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Archive, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Medicine {
    id: string;
    name: string;
    manufacturer: string;
    activeIngredients: string;
    quantity: number;
    unit: string;
    status: 'available' | 'out_of_stock';
}

export function Medicines() {
    const { t } = useTranslation();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', manufacturer: '', quantity: 0, unit: 'tablet' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchMedicines = React.useCallback(async () => {
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

    const resetForm = () => {
        setFormData({ name: '', manufacturer: '', quantity: 0, unit: 'tablet' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (med: Medicine) => {
        setFormData({
            name: med.name,
            manufacturer: med.manufacturer || '',
            quantity: med.quantity,
            unit: med.unit || 'tablet'
        });
        setEditingId(med.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/medicines/${id}`);
            fetchMedicines();
        } catch {
            alert(t('common.failed_delete'));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                status: formData.quantity > 0 ? 'available' : 'out_of_stock'
            };

            if (editingId) {
                await api.patch(`/medicines/${editingId}`, payload);
            } else {
                await api.post('/medicines', payload);
            }

            resetForm();
            fetchMedicines();
        } catch {
            alert(editingId ? t('common.failed_update') : t('common.failed_save'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">{t('medicines.title')}</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? t('common.close') : t('medicines.add_button')}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">{editingId ? t('medicines.edit_title') : t('medicines.add_title')}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder={t('medicines.name_placeholder')} className="p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <input placeholder={t('medicines.manufacturer_placeholder')} className="p-2 border rounded-lg" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} />
                        <div className="flex space-x-2">
                            <input type="number" placeholder={t('medicines.qty_placeholder')} className="p-2 border rounded-lg w-24" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
                            <input placeholder={t('medicines.unit_placeholder')} className="p-2 border rounded-lg flex-1" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? t('common.update') : t('common.save')} {t('layout.medicines').toLowerCase()}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medicines.map((med) => (
                    <div key={med.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Archive className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                {med.quantity === 0 && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full flex items-center h-fit">
                                        <AlertTriangle className="w-3 h-3 mr-1" /> {t('medicines.out_of_stock')}
                                    </span>
                                )}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => handleEdit(med)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(med.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{med.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{med.manufacturer || t('medicines.no_brand')}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{t('medicines.stock')} <b className="text-gray-900">{med.quantity}</b> {med.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

