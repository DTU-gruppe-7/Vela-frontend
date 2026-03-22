import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiMail, FiSave, FiArrowLeft, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getAllergensFromStorage, saveAllergensToStorage } from '../../utils/allergenStorage';
import { ALL_ALLERGENS, ALLERGEN_LABELS, type Allergen } from '../../types/User';

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
        const stored = getAllergensFromStorage() as Allergen[];
        setSelectedAllergens(stored || []);
    }, [user]);

    const toggleAllergen = (allergen: Allergen) => {
        setSelectedAllergens((prev) => 
            prev.includes(allergen)
                ? prev.filter(a => a !== allergen)
                : [...prev, allergen]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            saveAllergensToStorage(selectedAllergens);
            // Her simulerer vi API kaldet til din .NET backend
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            
            setMessage({ type: 'success', text: 'Profil og allergier er opdateret!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setMessage({ type: 'error', text: 'Der skete en fejl. Prøv igen.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <FiArrowLeft className="text-xl text-slate-600" />
                </button>
                <h1 className="text-3xl font-bold text-slate-800">Profilindstillinger</h1>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm border ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* BOKS 1: Personlige oplysninger */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
                        <FiUser className="text-indigo-500" /> Personlige oplysninger
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fornavn */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Fornavn</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiUser size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Indtast fornavn"
                                />
                            </div>
                        </div>

                        {/* Efternavn */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Efternavn</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <FiUser size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Indtast efternavn"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">E-mail adresse</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <FiMail size={18} />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="eksempel@mail.dk"
                            />
                        </div>
                    </div>
                </div>

                {/* BOKS 2: Allergier Sektion */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div className="border-b border-slate-50 pb-4">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <FiHeart className="text-red-500" /> Mine Allergier
                        </h2>
                        <p className="text-sm text-slate-500">Vælg hvad vi skal undgå i dine madplaner.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {ALL_ALLERGENS.map((allergenKey) => {
                            const isSelected = selectedAllergens.includes(allergenKey);
                            return (
                                <button
                                    key={allergenKey}
                                    type="button"
                                    onClick={() => toggleAllergen(allergenKey)}
                                    className={`p-3 rounded-xl border-2 text-sm transition-all duration-200 ${
                                        isSelected 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                    }`}
                                >
                                    {ALLERGEN_LABELS[allergenKey]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Submit knap */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
                    >
                        <FiSave className="text-lg" />
                        {isSaving ? 'Gemmer...' : 'Gem alt'}
                    </button>
                </div>
            </form>
        </div>
    );
}