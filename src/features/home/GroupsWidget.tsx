import { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {FiUsers, FiArrowRight, FiLoader } from 'react-icons/fi'
import {groupApi} from '../../api/groupApi'
import type {Group} from '../../types/Group'

export const GroupsWidget = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate =useNavigate();

    useEffect(() => {
        const fetchGroups = async() => {
            try {
                const data = await groupApi.getGroups();
                setGroups(data);
            } catch (error) {
            console.error('Fejl ved hentning af grupper:', error);
            } finally {
                setLoading(false)
            }
        }

        fetchGroups();
    }, []);

    return (
        <section className="h-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                    <FiUsers/>
                    <h2 className="text-sm font-semibold">Dine Grupper</h2>
                </div>
                <button
                type="button"
                onClick={() => navigate('/groups')}
                className="text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                    Se Alle
                </button>
            </div>

            {loading ? (
                <div className="flex h-[220px] items-center justify-center text-slate-500">
                    <FiLoader className="animate-spin"/>
                </div>
            ) : groups.length > 0 ? (
                <div className="h-[222px] space-y-2 overflow-y-auto pr-1">
                    {groups.map((group) => (
                        <button
                        key={group.id}
                        type="button"
                        onClick={() => navigate('/groups')}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100"
                        >
                            <div>
                                <p className="text-sm font-medium text-slate-800">{group.name}</p>
                                <p className="text-xs text-slate-500">{group.members.length} medlemmer</p>
                            </div>
                            <FiArrowRight className="text-slate-400" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex h-[222px] flex-col items-center justify-center text-center">
                    <p className="mb-3 text-sm text-slate-600">Du er ikke med i nogen grupper endnu.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/groups')}
                        className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                        Gå til grupper
                    </button>
                </div>
            )
            }
        </section>
    );
};