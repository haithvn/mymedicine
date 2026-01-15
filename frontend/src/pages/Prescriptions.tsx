import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, CalendarClock, Trash2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export function Prescriptions() {
    const { t } = useTranslation();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        diseaseId: '',
        frequency: 'Daily',
        scheduledTimes: ['08:00'],
        medicines: [{ medicineId: '', dosage: '' }]
    });

    const fetchData = React.useCallback(async () => {
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
        }
    }, [t]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        setShowForm(false);
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
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('common.confirm_delete'))) return;
        try {
            await api.delete(`/prescriptions/${id}`);
            fetchData();
        } catch {
            alert(t('common.failed_delete'));
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/prescriptions/${editingId}`, formData);
            } else {
                await api.post('/prescriptions', formData);
            }
            resetForm();
            fetchData();
        } catch {
            alert(editingId ? t('common.failed_update') : t('common.failed_save'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">{t('prescriptions.title')}</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? t('common.close') : t('prescriptions.add_button')}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">{editingId ? t('prescriptions.edit_title') : t('prescriptions.add_title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prescriptions.disease_label')}</label>
                                <select className="w-full p-2 border rounded-lg" value={formData.diseaseId} onChange={e => setFormData({ ...formData, diseaseId: e.target.value })} required>
                                    <option value="">{t('prescriptions.select_disease')}</option>
                                    {diseases.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('prescriptions.frequency_label')}</label>
                                <select className="w-full p-2 border rounded-lg" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                                    <option value="Daily">{t('prescriptions.daily')}</option>
                                    <option value="Weekly">{t('prescriptions.weekly')}</option>
                                    <option value="As Needed">{t('prescriptions.as_needed')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('prescriptions.scheduled_times')}</label>
                            <div className="flex gap-2 flex-wrap">
                                {formData.scheduledTimes.map((time, idx) => (
                                    <div key={idx} className="flex items-center">
                                        <input
                                            type="time"
                                            className="p-2 border rounded-lg"
                                            value={time}
                                            onChange={(e) => {
                                                const newTimes = [...formData.scheduledTimes];
                                                newTimes[idx] = e.target.value;
                                                setFormData({ ...formData, scheduledTimes: newTimes });
                                            }}
                                        />
                                        {idx > 0 && <button type="button" onClick={() => {
                                            const newTimes = [...formData.scheduledTimes];
                                            newTimes.splice(idx, 1);
                                            setFormData({ ...formData, scheduledTimes: newTimes });
                                        }} className="ml-1 text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setFormData({ ...formData, scheduledTimes: [...formData.scheduledTimes, '08:00'] })} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+ {t('prescriptions.add_time')}</button>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">{t('prescriptions.medicines_label')}</label>
                                <button type="button" onClick={handleAddMedicineRow} className="text-sm text-blue-600 hover:underline">+ {t('prescriptions.add_medicine')}</button>
                            </div>
                            {formData.medicines.map((item, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <select className="flex-1 p-2 border rounded-lg" value={item.medicineId} onChange={e => handleMedicineChange(idx, 'medicineId', e.target.value)} required>
                                        <option value="">{t('prescriptions.select_medicine')}</option>
                                        {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <input placeholder={t('prescriptions.dosage_placeholder')} className="w-1/3 p-2 border rounded-lg" value={item.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} required />
                                    {formData.medicines.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveMedicineRow(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t('common.cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? t('common.update') : t('common.save')} {t('layout.prescriptions').toLowerCase()}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {prescriptions.map((p) => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group relative">
                        <div className="flex justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <CalendarClock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{p.disease.name}</h3>
                                    <p className="text-sm text-gray-500">{p.frequency} • {p.scheduledTimes?.join(', ')}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 items-start">
                                <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 pl-12 space-y-2">
                            {p.prescriptionMedicines.map((pm, i) => (
                                <div key={i} className="text-sm flex justify-between border-b border-gray-50 pb-1 last:border-0">
                                    <span className="font-medium text-gray-700">{pm.medicine.name}</span>
                                    <span className="text-gray-500">{pm.dosage}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

