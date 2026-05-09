import { useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useRecipeDetails } from '../../../hooks/useRecipeDetails';
import type { Ingredient } from '../../../types/Recipe';

interface RecipePreviewModalProps {
    recipeId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatDuration(iso: string): string {
    const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
    if (!match) return iso;

    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours} t`);
    if (minutes > 0) parts.push(`${minutes} min`);

    return parts.length > 0 ? parts.join(' ') : '0 min';
}

export function RecipePreviewModal({ recipeId, isOpen, onClose }: RecipePreviewModalProps) {
    const { recipe, loading, error, instructions } = useRecipeDetails(isOpen ? recipeId : null);

    const groupedIngredients = useMemo(() => {
        if (!recipe?.ingredients) return [];

        const groups: Record<string, Ingredient[]> = {};

        recipe.ingredients.forEach((ingredient) => {
            const section = ingredient.section || 'Main';
            if (!groups[section]) {
                groups[section] = [];
            }
            groups[section].push(ingredient);
        });

        return Object.entries(groups).map(([sectionName, ingredients]) => ({
            sectionName: sectionName === 'Main' ? null : sectionName,
            ingredients,
        }));
    }, [recipe]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={recipe?.name ?? 'Opskrift preview'}>
            {loading && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {!loading && recipe && (
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        {/* Left column: header box, description and ingredients */}
                        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
                                {recipe.category}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900">{recipe.name}</h3>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                                {recipe.workTime && (
                                    <span className="rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-100">
                                        Arbejde: {formatDuration(recipe.workTime)}
                                    </span>
                                )}
                                {recipe.totalTime && (
                                    <span className="rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-100">
                                        Total: {formatDuration(recipe.totalTime)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {recipe.description && (
                            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Kort beskrivelse
                                </h4>
                                <p className="text-sm leading-6 text-slate-700">
                                    {recipe.description}
                                </p>
                            </div>
                        )}

                        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Ingredienser
                                </h4>
                                <span className="text-xs text-slate-400">
                                    {recipe.ingredients.length} stk.
                                </span>
                            </div>
                            <div className="space-y-5">
                                {groupedIngredients.map((group) => (
                                    <div key={group.sectionName ?? 'main'} className="space-y-3">
                                        {group.sectionName && (
                                            <p className="text-sm font-semibold text-slate-800">
                                                {group.sectionName}
                                            </p>
                                        )}
                                        <ul className="space-y-2">
                                            {group.ingredients.map((ingredient) => (
                                                <li
                                                    key={`${ingredient.section}-${ingredient.ingredientName}-${ingredient.rawMeasure}`}
                                                    className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2 text-sm"
                                                >
                                                    <span className="text-slate-700">
                                                        {ingredient.ingredientName}
                                                    </span>
                                                    <span className="shrink-0 font-medium text-slate-500">
                                                        {ingredient.rawMeasure || `${ingredient.quantity} ${ingredient.unit}`}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        {/* Right column: image then instructions */}
                        <div className="hidden lg:block overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
                            {recipe.thumbnailUrl ? (
                                <img
                                    src={recipe.thumbnailUrl}
                                    alt={recipe.name}
                                    className="h-72 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-72 items-center justify-center bg-gradient-to-br from-orange-200 to-orange-400 text-6xl text-white">
                                    🍽️
                                </div>
                            )}
                        </div>

                        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Fremgangsmåde
                            </h4>
                            {instructions.length > 0 ? (
                                <div className="space-y-5">
                                    {instructions.map((section, sectionIndex) => (
                                        <div key={`${section.sectionName ?? 'steps'}-${sectionIndex}`} className="space-y-3">
                                            {section.sectionName && (
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {section.sectionName}
                                                </p>
                                            )}
                                            <ol className="space-y-3">
                                                {section.steps.map((step, stepIndex) => (
                                                    <li key={`${sectionIndex}-${stepIndex}`} className="flex gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                                            {stepIndex + 1}
                                                        </span>
                                                        <span className="pt-0.5">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Ingen instruktioner er tilgængelige endnu.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default RecipePreviewModal;