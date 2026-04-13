import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useShoppingList } from '../../shoppingList/hooks/useShoppingList';
import { shoppingListApi } from '../../../api/shoppingListApi';

interface GenerateShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealPlanId: string;
    groupId?: string;
    startDate: string;
    endDate: string;
}

export function GenerateShoppingListModal({
    isOpen,
    onClose,
    mealPlanId,
    groupId,
    startDate,
    endDate,
}: GenerateShoppingListModalProps) {
    const { shoppingList, loading } = useShoppingList(groupId); // Kun én personlig liste

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);

        try {
            if (!shoppingList) {
                setError('Ingen indkøbsliste fundet.');
                setSubmitting(false);
                return;
            }
            await shoppingListApi.generateShoppingList({
                shoppingListId: shoppingList.id,
                mealPlanId,
                startDate,
                endDate
            });

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
                {/* Mode-vælger fjernet, kun én liste */}
                <div>
                    {loading ? (
                        <p className="text-sm text-slate-400">Henter indkøbsliste…</p>
                    ) : !shoppingList ? (
                        <p className="text-sm text-slate-500">
                            Vi kunne ikke finde en indkøbsliste at tilføje til.
                        </p>
                    ) : (
                        <div className="space-y-2 text-sm text-slate-700">
                            <p>
                                Generér indkøbsliste fra madplanen for perioden{' '}
                                <span className="font-semibold">{startDate} – {endDate}</span>.
                            </p>
                            <p className="text-slate-500">
                                Ingredienser fra måltider i perioden bliver tilføjet til din indkøbsliste.
                            </p>
                        </div>
                    )}
                </div>
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
                        disabled={submitting || !shoppingList}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? 'Genererer…' : 'Generér indkøbsliste'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}