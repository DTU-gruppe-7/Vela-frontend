import { useState } from 'react';
import { FiX, FiMail, FiSend, FiCheckCircle } from 'react-icons/fi';
import { groupApi } from '../../../api/groupApi';

interface InviteGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupName: string;
    groupId: string;
}

export default function InviteGroupModal({ isOpen, onClose, groupName, groupId }: InviteGroupModalProps) {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Sender invitation for gruppe-ID:", groupId);
        setIsSending(true);
        setError(null);

        if (!groupId || groupId === "{id}") {
        setError("Gruppe-ID mangler eller er ugyldigt.");
        return;
        }

        try {
            await groupApi.sendInvite(groupId, email);
            setIsSuccess(true);

            setTimeout(() => {
                setIsSuccess(false);
                setEmail('');
                onClose();
            }, 2500);

            } catch (err: any) {
                const serverErrorMessage = err.response?.data?.message;

                setError(serverErrorMessage);
            } finally {
                setIsSending(false);
            }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Inviter medlem</h2>
                        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-1">{groupName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                        <FiX size={20} />
                    </button>
                </div>
 
                <div className="px-8 pb-8">
                    {isSuccess ? (
                        /* Success State */
                        <div className="py-6 flex flex-col items-center text-center animate-in fade-in zoom-in-90">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <FiCheckCircle size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Invitation sendt!</h3>
                            <p className="text-sm text-slate-500 mt-1">Vi har sendt en mail til {email}</p>
                        </div>
                    ) : (
                        /* Form State */
                        <form onSubmit={handleSendInvite} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    Modtagerens e-mail
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <FiMail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="navn@eksempel.dk"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <FiX size={16} className="stroke-[3]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold uppercase tracking-tight">Hov!</p>
                                        <p className="text-sm font-medium leading-tight">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSending || !email}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {isSending ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FiSend />
                                        Send invitation
                                    </>
                                )}
                            </button>
                            
                            <p className="text-[11px] text-center text-slate-400">
                                Vi sender en besked med et link til at deltage i gruppen.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}