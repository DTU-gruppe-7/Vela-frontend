import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiLoader } from 'react-icons/fi';
import { mealplanApi } from '../../../api/mealplanApi';
import { recipeApi } from '../../../api/recipeApi';
import type { RecipeSummary } from '../../../types/Recipe';
import type { MealPlanEntry } from '../../../types/MealPlan';

function getLocalDateKey(date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}


export const CurrentRecipeWidget = () => {
    const [meals, setMeals] = useState<{ entry: MealPlanEntry; recipe: RecipeSummary }[]>([]);
    const [loading, setLoading] = useState(true);
    const [atScrollEnd, setAtScrollEnd] = useState(false);
    const [hiddenLeft, setHiddenLeft] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTodayMeals = async () => {
            try {
                const plan = await mealplanApi.getMealPlan();
                const today = getLocalDateKey();

                const todayEntries = plan?.entries.filter((e) => {
                    const dateOnly = e.date?.split('T')[0];
                    return dateOnly === today;
                }) ?? [];

                const resolved = await Promise.all(
                    todayEntries.map(async (entry) => {
                        const recipe = entry.recipe ?? await recipeApi.getRecipeById(entry.recipeId);
                        return { entry, recipe };
                    })
                );

                setMeals(resolved);
            } catch (err) {
                console.error('Kunne ikke loade dagens retter', err);
                setMeals([]);
            } finally {
                setLoading(false);
            }
        };

        loadTodayMeals();
    }, []);

    const subtitle = useMemo(() => {
        if (loading) return 'Finder dagens planlagte retter...';
        if (meals.length === 0) return 'Ingen opskrift planlagt til i dag';
        return `${meals.length} ${meals.length === 1 ? 'ret' : 'retter'} planlagt i dag`;
    }, [loading, meals.length]);

    return (
        <section className="flex h-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
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

            {subtitle && <p className="mb-2 text-xs text-slate-500">{subtitle}</p>}

            {loading ? (
                <div className="flex flex-1 items-center justify-center text-slate-500">
                    <FiLoader className="animate-spin" />
                </div>
            ) : meals.length > 0 ? (
                <div className="relative min-h-0 flex-1">
                    <div
                        ref={scrollRef}
                        onScroll={(e) => {
                            const el = e.currentTarget;
                            const cardWidth = el.clientWidth / 2;
                            setHiddenLeft(Math.round(el.scrollLeft / cardWidth));
                            setAtScrollEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
                        }}
                        className={`flex h-full gap-2 ${meals.length > 2 ? 'overflow-x-auto' : 'overflow-hidden'}`}
                    >
                        {meals.map(({ entry, recipe }) => (
                            <button
                                key={entry.id}
                                type="button"
                                onClick={() => navigate('/mealplan')}
                                className={`group relative h-full shrink-0 overflow-hidden rounded-xl ${meals.length === 1 ? 'w-full' : 'w-[calc(50%-4px)]'}`}
                            >
                                {recipe.thumbnailUrl ? (
                                    <img
                                        src={recipe.thumbnailUrl}
                                        alt={recipe.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-200 to-orange-400 text-4xl">
                                        🍽️
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <p className="absolute bottom-3 left-3 right-3 text-left text-sm font-bold text-white drop-shadow-md">
                                    {recipe.name}
                                </p>
                            </button>
                        ))}
                    </div>
                    {meals.length > 2 && (
                        <>
                            <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center transition-opacity duration-300 ${hiddenLeft > 0 ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="flex h-full items-center bg-gradient-to-r from-white/80 to-transparent pl-2 pr-6">
                                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow">
                                        +{hiddenLeft}
                                    </span>
                                </div>
                            </div>
                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center transition-opacity duration-300 ${atScrollEnd ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="flex h-full items-center bg-gradient-to-l from-white/80 to-transparent pl-6 pr-2">
                                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow">
                                        +{meals.length - 2 - hiddenLeft}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
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
