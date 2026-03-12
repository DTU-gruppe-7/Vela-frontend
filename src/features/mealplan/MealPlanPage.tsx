import { useState } from 'react';
import type { RecipeSummary } from '../../types/Recipe';
import RecipeCard from '../../components/ui/RecipeCard';
import { AddRecipeButton } from '../../components/ui/AddRecipeButton';
import { AddRecipeModal } from './components/AddRecipeModal';
import { GenerateShoppingListModal } from './components/GenerateShoppingListModal';
import { getWeekInfo, DAYS } from '../../utils/weekUtils';
import { useMealPlan } from './hooks/useMealPlan';
import { recipeApi } from '../../api/recipeApi';

const VISIBLE_COLUMNS = 4;

export default function MealPlanPage() {
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [showShoppingListModal, setShowShoppingListModal] = useState(false);
    const weekInfo = getWeekInfo(selectedWeek);
    const { weekNumber, dateRange } = weekInfo;
    const {
        mealPlan,
        mealPlanId,
        availableRecipes,
        likedIds,
        addRecipe,
        removeRecipe,
        error
    } = useMealPlan(
        recipeApi.getAllRecipes,
        weekInfo
    );

    const canGoBack = weekOffset > 0;
    const canGoForward = weekOffset * VISIBLE_COLUMNS < DAYS.length - VISIBLE_COLUMNS;
    const translateX = Math.min(weekOffset * VISIBLE_COLUMNS, DAYS.length - VISIBLE_COLUMNS) / DAYS.length * 100;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Madplan</h1>

                <div className="flex items-center gap-4">
                    {/* Generér indkøbsliste-knap */}
                    <button
                        onClick={() => setShowShoppingListModal(true)}
                        disabled={!mealPlanId}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Generér indkøbsliste
                    </button>

                    {/* Uge-navigation */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1 py-1">
                        <button
                            onClick={() => setSelectedWeek((w) => w - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all text-sm"
                        >
                            ‹
                        </button>
                        <span className="text-sm font-medium text-slate-600 px-2 whitespace-nowrap">
              Uge {weekNumber} &nbsp;·&nbsp; {dateRange}
                            {selectedWeek === 0 && <span className="ml-2 text-xs text-indigo-500 font-semibold">Denne uge</span>}
            </span>
                        <button
                            onClick={() => setSelectedWeek((w) => w + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all text-sm"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Horisontal uge-oversigt */}
            <div className="relative overflow-hidden border-2 border-slate-200 rounded-2xl shadow-xl bg-white">
                <div
                    className="flex divide-x-2 divide-slate-200 transition-transform duration-500 ease-out"
                    style={{
                        width: `${(DAYS.length / VISIBLE_COLUMNS) * 100}%`,
                        transform: `translateX(-${translateX}%)`,
                    }}
                >
                    {DAYS.map((day, index) => (
                        <div key={day} style={{ width: `${100 / DAYS.length}%` }} className="flex-shrink-0">
                            <DayColumn
                                day={day}
                                date={new Date(weekInfo.monday.getTime() + index * 24 * 60 * 60 * 1000)}
                                recipes={mealPlan[day] || []}
                                onRemoveRecipe={removeRecipe}
                                onAddClick={() => setSelectedDay(day)}
                            />
                        </div>
                    ))}
                </div>

                {/* Navigationspile */}
                {canGoBack && (
                    <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-transparent rounded-l-2xl" />
                        <button
                            onClick={() => setWeekOffset((o) => o - 1)}
                            className="relative z-10 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all opacity-70 hover:opacity-100 hover:bg-indigo-700 pointer-events-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    </div>
                )}

                {canGoForward && (
                    <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-l from-white/70 to-transparent rounded-r-2xl" />
                        <button
                            onClick={() => setWeekOffset((o) => o + 1)}
                            className="relative z-10 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all opacity-70 hover:opacity-100 hover:bg-indigo-700 pointer-events-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Én fælles modal for hele siden */}
            <AddRecipeModal
                isOpen={selectedDay !== null}
                onClose={() => setSelectedDay(null)}
                day={selectedDay ?? ''}
                availableRecipes={availableRecipes}
                addedRecipes={selectedDay ? (mealPlan[selectedDay] || []) : []}
                favoriteIds={likedIds}
                onSelect={(recipe) => {
                    if (selectedDay) addRecipe(selectedDay, recipe);
                    setSelectedDay(null);
                }}
            />

            {/* Generér indkøbsliste modal */}
            {mealPlanId && (
                <GenerateShoppingListModal
                    isOpen={showShoppingListModal}
                    onClose={() => setShowShoppingListModal(false)}
                    mealPlanId={mealPlanId}
                />
            )}
        </div>
    );
}

function DayColumn({
                       day,
                       date,
                       recipes,
                       onRemoveRecipe,
                       onAddClick,
                   }: {
    day: string;
    date: Date;
    recipes: RecipeSummary[];
    onRemoveRecipe: (day: string, recipeId: string) => void;
    onAddClick: () => void;
}) {
    const dateStr = date.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' });

    return (
        <div className="flex flex-col gap-0">
            <div className="px-4 py-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase text-xs">{day}</span>
                <span className="text-xs text-slate-500 ml-2">{dateStr}</span>
            </div>
            <div className="p-4 flex flex-col min-h-96 bg-white">
                {recipes.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-4">
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    compact
                                    onRemove={() => onRemoveRecipe(day, recipe.id)}
                                />
                            ))}
                        </div>
                        <AddRecipeButton className="mt-4" onClick={onAddClick} />
                    </>
                ) : (
                    <>
                        <AddRecipeButton onClick={onAddClick} />
                        <p className="mt-3 text-xs text-slate-400 text-center">Ingen opskrift valgt</p>
                    </>
                )}
            </div>
        </div>
    );
}