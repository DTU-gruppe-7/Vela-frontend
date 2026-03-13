import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiMail, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user } = useAuth(); // Vi antager din useAuth hook giver adgang til brugerdata
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fyld formularen når brugeren er hentet
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            // HER skal vi kalde jeres API senere (f.eks. userApi.updateProfile(formData))
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulering
            setMessage({ type: 'success', text: 'Profilen er blevet opdateret!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Der skete en fejl. Prøv igen.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <FiArrowLeft className="text-xl text-slate-600" />
                </button>
                <h1 className="text-3xl font-bold text-slate-800">Min Profil</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* Navne-sektion */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Fornavn</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Efternavn</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email-sektion */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">E-mail adresse</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Feedback beskeder */}
                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Submit knap */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            <FiSave />
                            {isSaving ? 'Gemmer...' : 'Gem ændringer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}