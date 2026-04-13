import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useShoppingList } from '../../shoppingList/hooks/useShoppingList';
import { shoppingListApi } from '../../../api/shoppingListApi';
import type { MealPlanEntry } from '../../../types/MealPlan';

interface GenerateShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealPlanId: string;
    groupId?: string;
    startDate: string;
    endDate: string;
    candidateEntries: MealPlanEntry[];
    onGenerated: (generatedEntryIds: string[]) => void;
}

export function GenerateShoppingListModal({
    isOpen,
    onClose,
    mealPlanId,
    groupId,
    startDate,
    endDate,
    candidateEntries,
    onGenerated,
}: GenerateShoppingListModalProps) {
    const { shoppingList, loading } = useShoppingList(groupId); // Kun én personlig liste

    const [excludedEntryIds, setExcludedEntryIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setExcludedEntryIds([]);
            setError(null);
        }
    }, [isOpen]);

    const excludedIdSet = useMemo(() => new Set(excludedEntryIds), [excludedEntryIds]);
    const includedCount = candidateEntries.length - excludedEntryIds.length;

    const toggleExcluded = (entryId: string) => {
        setExcludedEntryIds((prev) =>
            prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]
        );
    };

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);
        const generatedEntryIds = candidateEntries
            .filter((entry) => !excludedIdSet.has(entry.id))
            .map((entry) => entry.id);

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
                endDate,
                excludedMealPlanEntryIds: excludedEntryIds,
            });

            onGenerated(generatedEntryIds);
            setExcludedEntryIds([]);
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
                            {candidateEntries.length > 0 ? (
                                <p className="text-slate-500">
                                    {includedCount} af {candidateEntries.length} måltider er inkluderet.
                                </p>
                            ) : (
                                <p className="text-slate-500">
                                    Der er ingen nye måltider i perioden at generere.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {!loading && shoppingList && candidateEntries.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Vælg måltider, der skal ekskluderes
                        </p>
                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
                            {candidateEntries.map((entry) => {
                                const excluded = excludedIdSet.has(entry.id);
                                const dateLabel = new Date(entry.date).toLocaleDateString('da-DK', {
                                    day: '2-digit',
                                    month: '2-digit',
                                });

                                return (
                                    <div key={entry.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">
                                                {entry.recipe?.name ?? 'Opskrift'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {dateLabel} · {entry.servings} pers.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleExcluded(entry.id)}
                                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                                excluded
                                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                            }`}
                                        >
                                            {excluded ? 'Inkludér' : 'Ekskludér'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
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
                        disabled={submitting || !shoppingList || candidateEntries.length === 0}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? 'Genererer…' : 'Generér indkøbsliste'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}