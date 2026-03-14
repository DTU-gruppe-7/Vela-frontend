import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiLoader } from 'react-icons/fi';
import { type Group } from '../../types/Group';
import GroupCard from './GroupCard';
import CreateGroupModal from './modal/CreateGroupModal';
import InviteGroupModal from './modal/GroupInviteModal';
import { groupApi } from '../../api/groupApi';

export default function GroupPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setIsLoading(true);
                const data = await groupApi.getGroups();
                setGroups(data);
            } catch (error) {
                console.error("Fejl ved hentning af grupper:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleCreateGroup = async (name: string, description: string) => {
        try {
            const newGroup = await groupApi.createGroup({ name, description });
            setGroups(prev => [...prev, newGroup]);
        } catch (error) {
            console.error("Fejl ved oprettelse af gruppe:", error);
        }
    };

    const handleGroupClick = (id: string) => {
        navigate(`/groups/${id}`);
    };
         
    const handleInvite = (id: string) => {
        const group = groups.find(g => g.id === id);
        if (group) {
            setSelectedGroup(group);
            setIsInviteModalOpen(true);
        }
    };

    const handleSettings = (id: string) => {
        console.log("Åbn indstillinger for gruppe:", id);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                <FiLoader className="animate-spin mb-4" size={40} />
                <p className="font-medium">Henter dine fællesskaber...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dine Grupper</h1>
                    <p className="text-slate-500 mt-1">Administrer dine mad-fællesskaber og planlæg sammen.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition shadow-md"
                    >
                        <FiPlus /> Opret ny
                    </button>
                </div>
            </div>

            {/* Gruppe Oversigt (Listen) */}
            {groups.length > 0 ? (
                // Vertikal liste med scroll
                <div 
                    className="overflow-y-auto flex flex-col gap-4 hover-scroll pr-4" 
                    style={{ maxHeight: 'calc(100vh - 120px)', scrollbarGutter: 'stable' }}
                >
                    <style>{`
                        .hover-scroll {
                            scrollbar-width: none;
                        }
                        .hover-scroll::-webkit-scrollbar {
                            width: 0px;
                        }
                        .hover-scroll:hover {
                            scrollbar-width: auto;
                        }
                        .hover-scroll:hover::-webkit-scrollbar {
                            width: 8px;
                        }
                        .hover-scroll::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .hover-scroll::-webkit-scrollbar-thumb {
                            background: rgb(148, 163, 184);
                            border-radius: 4px;
                            margin-right: 8px;
                        }
                        .hover-scroll::-webkit-scrollbar-thumb:hover {
                            background: rgb(100, 116, 139);
                        }
                    `}</style>
                    {groups.map(group => (
                        <GroupCard 
                            key={group.id} 
                            group={group}
                            onInvite={handleInvite}
                            onSettings={handleSettings}
                            onClick={handleGroupClick} 
                        />
                    ))}
                </div>
            ) : (
                /* Empty State: Vises hvis man ingen grupper har */
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 text-slate-400">
                        <FiUsers size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Ingen grupper endnu</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Opret en gruppe for at starte din første fælles madplan med venner eller familie.
                    </p>
                </div>
            )}

            <CreateGroupModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onCreate={handleCreateGroup} 
            />

            <InviteGroupModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                groupName={selectedGroup?.name || ''}
                groupId={selectedGroup?.id || ''}
            />
        </div>

    );
}