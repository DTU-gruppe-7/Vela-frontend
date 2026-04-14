import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiAlertTriangle, FiLoader, FiSave, FiTrash2 } from 'react-icons/fi';
import { groupApi } from '../../../api/groupApi';
import { useAuth } from '../../../hooks/useAuth';
import type { Group } from '../../../types/Group';
import { getCurrentUserGroupRole } from '../../../utils/groupAccess';

export default function GroupManagePage() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const userIdentifiers = useMemo(
        () => [user?.id, user?.userId, user?.email],
        [user?.id, user?.userId, user?.email]
    );

    const currentRole = useMemo(() => {
        if (!group || !group.members) return null;
        return getCurrentUserGroupRole(group, ...userIdentifiers);
    }, [group, userIdentifiers]);

    const isOwner = currentRole === 'owner';

    const fetchGroup = async () => {
        if (!groupId) return;

        try {
            setIsLoading(true);
            setError(null);
            const data = await groupApi.getGroup(groupId);
            setGroup(data);
            setGroupName(data.name);
        } catch {
            setError('Kunne ikke hente gruppedata.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupId]);

    const handleUpdateGroupName = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        
        if (!groupId || !isOwner || !group) return;

        const trimmedName = groupName.trim();
        if (!trimmedName) {
            setError('Gruppenavn må ikke være tomt.');
            return;
        }

        if (trimmedName === group.name) {
            setSuccessMessage('Gruppenavnet er allerede opdateret.');
            setError(null);
            return;
        }

        try {
            setIsSavingName(true);
            setError(null);
            setSuccessMessage(null);

            await groupApi.updateGroup(groupId, {
                name: trimmedName,
            });

            setGroup(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    name: trimmedName
                };
            });

            setSuccessMessage('Gruppenavnet blev opdateret.');
            
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (err) {
            setError('Kunne ikke opdatere gruppenavnet.');
            console.error("Update error:", err);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupId || !group || !isOwner) return;

        if (deleteConfirmation.trim().toUpperCase() !== 'SLET') {
            setDeleteError('Skriv SLET for at bekræfte sletning af gruppen.');
            return;
        }

        try {
            setIsDeletingGroup(true);
            setDeleteError(null);
            setSuccessMessage(null);
            await groupApi.deleteGroup(groupId);
            navigate('/groups');
        } catch {
            setDeleteError('Kunne ikke slette gruppen. Prøv igen.');
        } finally {
            setIsDeletingGroup(false);
        }
    };

    const openDeleteModal = () => {
        setDeleteConfirmation('');
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isDeletingGroup) return;
        setDeleteError(null);
        setIsDeleteModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="px-6 md:px-10 xl:px-14 py-6 flex items-center gap-3 text-slate-500">
                <FiLoader className="animate-spin" />
                <span>Henter gruppeadministration...</span>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="px-6 md:px-10 xl:px-14 py-6 text-slate-500">
                Gruppen blev ikke fundet.
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="px-6 md:px-10 xl:px-14 py-6">
                <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    <p className="font-bold mb-2">Adgang nægtet</p>
                    <p className="text-sm">Kun gruppeejeren kan ændre navn eller slette denne gruppe.</p>
                    <Link
                        to={`/groups/${group.id}/mealplan`}
                        className="inline-block mt-4 text-sm font-semibold text-amber-900 underline"
                    >
                        Tilbage til madplan
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 xl:px-14 py-6 space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900">Administrer gruppe</h2>
                <p className="text-slate-500 text-sm mt-1">Opdater gruppenavn eller slet {group.name}.</p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleUpdateGroupName}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4"
            >
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Gruppenavn</h3>
                    <p className="text-sm text-slate-500 mt-1">Skift navn på gruppen for alle medlemmer.</p>
                </div>

                <div>
                    <label htmlFor="group-name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Nyt gruppenavn
                    </label>
                    <input
                        id="group-name"
                        type="text"
                        value={groupName}
                        onChange={(event) => setGroupName(event.target.value)}
                        maxLength={80}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Skriv gruppenavn"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSavingName}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-bold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSavingName ? <FiLoader className="animate-spin" /> : <FiSave />}
                    Gem gruppenavn
                </button>
            </form>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="text-lg font-bold text-red-800">Slet gruppe</h3>
                <p className="text-sm text-red-700 mt-1 mb-4">
                    Permanent handling. Dette kan IKKE fortrydes!
                </p>
                <button
                    type="button"
                    onClick={openDeleteModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700 transition"
                >
                    <FiTrash2 />
                    Slet gruppe
                </button>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-red-200 space-y-4">
                        <div className="flex items-start gap-3 text-red-800">
                            <FiAlertTriangle className="mt-0.5" />
                            <div>
                                <h3 className="text-lg font-bold">Bekræft sletning af gruppe</h3>
                                <p className="text-sm mt-1">
                                    Denne handling kan ikke fortrydes. Gruppen {group.name} og alt tilknyttet indhold fjernes permanent.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="delete-confirmation-modal" className="block text-sm font-semibold text-red-900 mb-2">
                                Skriv SLET for at bekræfte
                            </label>
                            <input
                                id="delete-confirmation-modal"
                                type="text"
                                value={deleteConfirmation}
                                onChange={(event) => {
                                    setDeleteConfirmation(event.target.value);
                                    if (deleteError) {
                                        setDeleteError(null);
                                    }
                                }}
                                className="w-full rounded-xl border border-red-300 px-4 py-2.5 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="SLET"
                            />
                        </div>

                        {deleteError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={isDeletingGroup}
                                className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Annuller
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteGroup}
                                disabled={isDeletingGroup}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeletingGroup ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                                Slet gruppe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}