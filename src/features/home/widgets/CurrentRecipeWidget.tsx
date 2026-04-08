import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiLoader } from 'react-icons/fi';
import RecipeCard from '../../../components/ui/RecipeCard';
import { mealplanApi } from '../../../api/mealplanApi';
import { recipeApi } from '../../../api/recipeApi';
import type { RecipeSummary } from '../../../types/Recipe';

function getLocalDateKey(date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

export const CurrentRecipeWidget = () => {
    const [recipe, setRecipe] = useState<RecipeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTodayRecipe = async () => {
            try {
                const plan = await mealplanApi.getMealPlan();
                const today = getLocalDateKey();

                const todayEntry =
                    plan?.entries.find((e) => {
                        const dateOnly = e.date?.split('T')[0];
                        const isToday = dateOnly === today;
                        const isDinner = !e.mealType || e.mealType.toLowerCase() === 'dinner';
                        return isToday && isDinner;
                    }) ?? null;

                if (todayEntry?.recipe) {
                    setRecipe(todayEntry.recipe);
                } else if (todayEntry?.recipeId) {
                    const full = await recipeApi.getRecipeById(todayEntry.recipeId);
                    setRecipe(full);
                } else {
                    setRecipe(null);
                }
            } catch (err) {
                console.error('Kunne ikke loade dagens ret', err);
                setRecipe(null);
            } finally {
                setLoading(false);
            }
        };

        loadTodayRecipe();
    }, []);

    const subtitle = useMemo(() => {
        if (loading) return 'Finder dagens planlagte ret...';
        if (!recipe) return 'Ingen opskrift planlagt til i dag';
        return 'Dagens ret fra din madplan';
    }, [loading, recipe]);

    return (
        <section className="flex h-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                    <FiCalendar />
                    <h2 className="text-sm font-semibold">Dagens opskrift</h2>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/mealplan')}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                    Se madplan
                </button>
            </div>

            {subtitle && <p className="mb-3 text-xs text-slate-500">{subtitle}</p>}

            {loading ? (
                <div className="flex flex-1 items-center justify-center text-slate-500">
                    <FiLoader className="animate-spin" />
                </div>
            ) : recipe ? (
                <button
                    type="button"
                    onClick={() => navigate('/mealplan')}
                    className="flex-1 w-full text-left"
                >
                    <RecipeCard recipe={recipe} compact showKeywords={false} showTime={false} showCategory={false} />
                </button>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="mb-3 text-sm text-slate-600">Ingen ret planlagt til i dag.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/mealplan')}
                        className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
                    >
                        Gå til madplan
                    </button>
                </div>
            )}
        </section>
    );
};
