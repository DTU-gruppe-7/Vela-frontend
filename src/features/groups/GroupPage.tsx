import { useState } from 'react';
import { FiPlus, FiHash, FiUsers } from 'react-icons/fi';
import { type Group } from '../../types/Group';
import GroupCard from './GroupCard';
import CreateGroupModal from './CreateGroupModal';

// MOCK DATA: Dette simulerer hvad din kollega sender fra backenden tidligere
const MOCK_GROUPS: Group[] = [
    {
        id: '1',
        name: 'Hjemme hos Jensen',
        description: 'Vores ugentlige madplan og fælles indkøbsliste for hele familien.',
        members: [
            { userId: 'u1', groupId: '1', role: 'admin' },
            { userId: 'u2', groupId: '1', role: 'member' },
            { userId: 'u3', groupId: '1', role: 'member' },
        ],
        
    },
    {
        id: '2',
        name: 'Kollektivet Lykken',
        description: 'Madlavning i uge 30 og generelle ting til huset.',
        members: [
            { userId: 'u1', groupId: '2', role: 'member' },
            { userId: 'u4', groupId: '2', role: 'admin' },
        ],
        
    },
    {
        id: '3',
        name: 'Fitness Venner',
        description: 'Sundere madplaner og meal prep for træningsgruppen.',
        members: [
            { userId: 'u1', groupId: '3', role: 'member' },
            { userId: 'u5', groupId: '3', role: 'admin' },
            { userId: 'u6', groupId: '3', role: 'member' },
            { userId: 'u7', groupId: '3', role: 'member' },
        ],
        
    },
    {
        id: '4',
        name: 'Fodbold Hold',
        description: 'Arrangement af fælles måltidet efter træning.',
        members: [
            { userId: 'u8', groupId: '4', role: 'admin' },
            { userId: 'u1', groupId: '4', role: 'member' },
            { userId: 'u9', groupId: '4', role: 'member' },
        ],
        
    },
    {
        id: '5',
        name: 'Vegetar Klub',
        description: 'Vegetariske og veganske opskrifter for hele gruppen.',
        members: [
            { userId: 'u10', groupId: '5', role: 'admin' },
            { userId: 'u1', groupId: '5', role: 'member' },
            { userId: 'u11', groupId: '5', role: 'member' },
            { userId: 'u12', groupId: '5', role: 'member' },
        ],
       
    },
    {
        id: '6',
        name: 'Arbejds Frokost Gruppe',
        description: 'Planering af fælles luncher på arbejde.',
        members: [
            { userId: 'u1', groupId: '6', role: 'admin' },
            { userId: 'u13', groupId: '6', role: 'member' },
            { userId: 'u14', groupId: '6', role: 'member' },
        ],
        
    },
    {
        id: '7',
        name: 'BBQ Mestre',
        description: 'Sommerfester og grillaftner med venner.',
        members: [
            { userId: 'u15', groupId: '7', role: 'admin' },
            { userId: 'u1', groupId: '7', role: 'member' },
            { userId: 'u16', groupId: '7', role: 'member' },
        ],
        
    }
];

export default function GroupPage() {
    const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCreateGroup = (name: string, description: string) => {

        const newId = (groups.length + 1).toString();
        const newGroup: Group = {
            id: newId,
            name: name,
            description: description,
            members: [{ userId: 'current', groupId: newId, role: 'admin' }],
        };
        setGroups(prev => [...prev, newGroup]);
    }

    const handleGroupClick = (id: string) => {
        console.log("Naviger til gruppe detaljer:", id);
        // Her vil vi senere bruge useNavigate(`/groups/${id}`)
    };

    const handleInvite = (id: string) => {
        console.log("Invite til gruppe:", id);
    };

    const handleSettings = (id: string) => {
        console.log("Åbn indstillinger for gruppe:", id);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            {/* Top Bar: Titel og Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dine Grupper</h1>
                    <p className="text-slate-500 mt-1">Administrer dine mad-fællesskaber og planlæg sammen.</p>
                </div>
                
                {/* Handlinger: Opret og Deltag knapper */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition shadow-sm">
                        <FiHash /> Deltag med kode
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md"
                    >
                        <FiPlus /> Opret ny
                    </button>
                </div>
            </div>

            {/* Gruppe Oversigt (Listen) */}
            {groups.length > 0 ? (
                // Vertikal liste med scroll
                <div className="overflow-y-auto flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
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
        </div>
    );
}