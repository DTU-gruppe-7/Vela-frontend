import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useShoppingList } from '../../shoppingList/hooks/useShoppingList';
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
    const { shoppingList, loading } = useShoppingList(); // Kun én personlig liste

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
            await shoppingListApi.generateShoppingList(mealPlanId, shoppingList.id);

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
                        <p className="text-sm text-slate-400">Indlæser indkøbsliste…</p>
                    ) : !shoppingList ? (
                        <p className="text-sm text-slate-400">
                            Du har ingen indkøbsliste endnu.
                        </p>
                    ) : (
                        <div className="text-sm text-slate-700">
                            {shoppingList.name} — {new Date(shoppingList.createdAt).toLocaleDateString('da-DK')}
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