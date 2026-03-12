import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {FiShoppingCart, FiChevronRight, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useShoppingLists } from './hooks/useShoppingLists';
import { Modal } from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import type {ShoppingListSummary} from "../../types/ShoppingList.ts";

function ShoppingListPage() {
    const { shoppingLists, loading, error, refetch, createShoppingList, deleteShoppingList } = useShoppingLists();
    const navigate = useNavigate();

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListGroupId, setNewListGroupId] = useState('');
    const [creating, setCreating] = useState(false);

    const[listToDelete, setListToDelete] = useState<ShoppingListSummary | null>(null);
    const[deleting, setDeleting] = useState(false);

    const handleCreate = async () => {
        const name = newListName.trim();
        if (!name) return;

        setCreating(true);
        const created = await createShoppingList({
            name,
            groupId: newListGroupId.trim() || undefined,
        });
        setCreating(false);

        if (created) {
            setShowCreateModal(false);
            setNewListName('');
            setNewListGroupId('');
            navigate(`/shoppinglist/${created.id}`);
        }
    };

    const handleDelete = async () => {

        if(!listToDelete) {
            console.log('listToDelete is null');
            return;
        }

        setDeleting(true);
        const success = await deleteShoppingList(listToDelete.id);
        setDeleting(false);

        if (success) {
            setListToDelete(null)
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleCreate();
    };

    // Skeleton loading cards
    const SkeletonCard = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-orange-50/40">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header med titel og opret-knap */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Indkøbslister
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition shadow-sm"
                    >
                        <FiPlus className="text-lg" />
                        Ny liste
                    </button>
                </div>

                {/* Error state */}
                {error && (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                        >
                            Prøv igen
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {loading && !error && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Shopping lists */}
                {!loading && !error && (
                    <div className="flex flex-col gap-4">
                        {shoppingLists.map((list) => (
                            <Card
                                key={list.id}
                                onClick={() => navigate(`/shoppinglist/${list.id}`)}
                                className="p-5 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full">
                                        <FiShoppingCart className="text-lg" />
                                    </div>
                                    <div
                                        onClick={() => navigate(`/shoppinglist/${list.id}`)}
                                        className="flex-1 min-w-0 cursor-pointer"
                                    >
                                        <p className="text-sm font-medium text-gray-800">
                                            {list.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Opdateret {new Date(list.updatedAt).toLocaleDateString('da-DK', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setListToDelete(list);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Slet liste"
                                        >
                                            <FiTrash2 className="text-lg" />
                                        </button>
                                        <FiChevronRight
                                            onClick={() => navigate(`/shoppinglist/${list.id}`)}
                                            className="text-gray-400 text-lg flex-shrink-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && shoppingLists.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FiShoppingCart className="text-5xl mb-4" />
                        <p className="text-lg font-medium">Ingen indkøbslister</p>
                        <p className="text-sm mt-1">
                            Opret din første indkøbsliste med knappen ovenfor
                        </p>
                    </div>
                )}
            </div>

            {/* Opret-modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Opret indkøbsliste"
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Navn <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="F.eks. Ugens indkøb"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            Annuller
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!newListName.trim() || creating}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {creating ? 'Opretter...' : 'Opret'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete or confirm modal */}
            <Modal
                isOpen={!!listToDelete}
                onClose={() => setListToDelete(null)}
                title="Slet indkøbsliste"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        Er du sikker på, at du vil slette indkøbslisten <strong>"{listToDelete?.name}"</strong>?
                        <br />
                        Denne handling kan ikke fortrydes.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setListToDelete(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            Annuller
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {deleting ? 'Sletter...' : 'Slet'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ShoppingListPage;