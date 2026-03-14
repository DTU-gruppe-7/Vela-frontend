import { FiMoreVertical, FiUserPlus, FiUsers } from 'react-icons/fi';
import { type Group } from '../../types/Group';

interface GroupCardProps {
    group: Group;
    onInvite: (id: string) => void;
    onSettings: (id: string) => void;
    onClick: (id: string) => void;
}

export default function GroupCard({ group, onInvite, onSettings, onClick }: GroupCardProps) {
    const memberCount = group.members?.length || 0;

    return (
        <div 
            onClick={() => onClick(group.id)}
            className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            {/* Subtil gradient-effekt i hjørnet ved hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-tr-2xl" />

            <div className="relative z-10">
                <div className="flex justify-between items-center">
                    
                    {/* Venstre side: Navn og Badge (Som i den gamle version) */}
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                            {group.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-100 shadow-sm">
                            <FiUsers size={12} className="mt-0.5" />
                            <span className="text-xs font-bold">{memberCount}</span>
                        </div>
                    </div>

                    {/* Højre side: Knapper */}
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onInvite(group.id); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-slate-100 shadow-sm"
                        >
                            <FiUserPlus size={14} />
                            Inviter
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSettings(group.id); }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <FiMoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Beskrivelse - fylder ikke meget, men giver kontekst */}
                {group.status && (
                    <p className="mt-3 text-sm text-slate-500 line-clamp-1 max-w-[80%]">
                        {group.status}
                    </p>
                )}
            </div>
        </div>
    );
}