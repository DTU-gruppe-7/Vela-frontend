import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useShoppingLists } from '../../shoppingList/hooks/useShoppingLists';
import { shoppingListApi } from '../../../api/shoppingListApi';

interface GenerateShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealPlanId: string;
}

export function GenerateShoppingListModal({
                                              isOpen,
                                              onClose,
                                              mealPlanId,
                                          }: GenerateShoppingListModalProps) {
    const { shoppingLists, loading, createShoppingList } = useShoppingLists();

    const [mode, setMode] = useState<'existing' | 'new'>('existing');
    const [selectedListId, setSelectedListId] = useState('');
    const [newListName, setNewListName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            if (mode === 'existing') {
                if (!selectedListId) {
                    setError('Vælg venligst en indkøbsliste.');
                    setSubmitting(false);
                    return;
                }
                await shoppingListApi.generateShoppingList(mealPlanId, selectedListId);
            } else {
                if (!newListName.trim()) {
                    setError('Giv venligst den nye indkøbsliste et navn.');
                    setSubmitting(false);
                    return;
                }
                const created = await createShoppingList({ name: newListName.trim() });
                if (!created) {
                    setError('Kunne ikke oprette indkøbslisten.');
                    setSubmitting(false);
                    return;
                }
                await shoppingListApi.generateShoppingList(mealPlanId, created.id);
            }

            onClose();
        } catch {
            setError('Noget gik galt. Prøv igen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generér indkøbsliste">
            <div className="flex flex-col gap-6">
                {/* Mode-vælger */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('existing')}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                            mode === 'existing'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Eksisterende liste
                    </button>
                    <button
                        onClick={() => setMode('new')}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                            mode === 'new'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Ny liste
                    </button>
                </div>

                {/* Indhold */}
                {mode === 'existing' ? (
                    <div>
                        {loading ? (
                            <p className="text-sm text-slate-400">Indlæser indkøbslister…</p>
                        ) : shoppingLists.length === 0 ? (
                            <p className="text-sm text-slate-400">
                                Du har ingen indkøbslister endnu. Opret en ny i stedet.
                            </p>
                        ) : (
                            <select
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                            >
                                <option value="">— Vælg indkøbsliste —</option>
                                {shoppingLists.map((list) => (
                                    <option key={list.id} value={list.id}>
                                        {list.name} — {new Date(list.createdAt).toLocaleDateString('da-DK')}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Navn på ny indkøbsliste
                        </label>
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="F.eks. Uge 11 indkøb"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                        />
                    </div>
                )}

                {/* Fejl */}
                {error && (
                    <p className="text-sm text-red-600">⚠️ {error}</p>
                )}

                {/* Knapper */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                    >
                        Annuller
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? 'Genererer…' : 'Generér indkøbsliste'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}