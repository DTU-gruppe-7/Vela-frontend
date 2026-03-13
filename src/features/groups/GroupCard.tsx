import { FiMoreVertical, FiUserPlus } from 'react-icons/fi';
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all">
            <div className="p-6">
                {/* Øverste række: Navn, Medlemmer og Knapper */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-800 cursor-pointer hover:text-indigo-600" onClick={() => onClick(group.id)}>
                            {group.name}
                        </h3>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">
                            +{memberCount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onInvite(group.id); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                        >
                            <FiUserPlus /> Invite
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSettings(group.id); }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <FiMoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Madplan Preview (De 7 kasser fra din tegning) */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Madplan</p>
                    <div className="grid grid-cols-7 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <div 
                                key={day} 
                                className="aspect-square rounded-lg border-2 border-dashed border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                title={`Dag ${day}`}
                                onClick={() => onClick(group.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}