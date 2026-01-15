import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Activity, Pencil, Trash2 } from 'lucide-react';

interface Disease {
    id: string;
    name: string;
    description: string;
}

export function Diseases() {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchDiseases = async () => {
        try {
            const res = await api.get('/diseases');
            setDiseases(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, []);

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
        if (!confirm('Are you sure you want to delete this disease?')) return;
        try {
            await api.delete(`/diseases/${id}`);
            fetchDiseases();
        } catch (e) {
            alert('Failed to delete disease');
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
        } catch (e) {
            alert(`Failed to ${editingId ? 'update' : 'add'} disease`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Diseases</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? 'Close' : 'Add Disease'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Disease' : 'Add New Disease'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="Name" className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <textarea placeholder="Description" className="w-full p-2 border rounded-lg" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? 'Update' : 'Save'}</button>
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
                        <p className="text-gray-600">{d.description || 'No description provided.'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

