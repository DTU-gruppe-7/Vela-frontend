import { useState } from 'react';
import type { RecipeSummary } from '../../types/Recipe';
import RecipeCard from '../../components/ui/RecipeCard';
import { AddRecipeButton } from '../../components/ui/AddRecipeButton';
import { AddRecipeModal } from './components/AddRecipeModal';
import { getWeekInfo, DAYS } from '../../utils/weekUtils';
import { useMealPlan } from './hooks/useMealPlan';
import { useLikedRecipes } from './hooks/useLikedRecipes';
const VISIBLE_COLUMNS = 4;

export default function MealPlanPage() {
  const { likedRecipes, isLoading: isLoadingRecipes, error: recipesError } = useLikedRecipes();
  const { mealPlan, addRecipe, removeRecipe } = useMealPlan(() => Promise.resolve([]));

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { weekNumber, dateRange } = getWeekInfo(selectedWeek);

  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset * VISIBLE_COLUMNS < DAYS.length - VISIBLE_COLUMNS;
  const translateX = Math.min(weekOffset * VISIBLE_COLUMNS, DAYS.length - VISIBLE_COLUMNS) / DAYS.length * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Madplan</h1>
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

      {/* Outer: overflow hidden, viser præcis VISIBLE_COLUMNS kolonner */}
      <div className="relative overflow-hidden border-2 border-slate-200 rounded-2xl shadow-xl bg-white">
        {/* Track: alle dage, bredde beregnet dynamisk */}
        <div
          className="flex divide-x-2 divide-slate-200 transition-transform duration-500 ease-out"
          style={{
            width: `${(DAYS.length / VISIBLE_COLUMNS) * 100}%`,
            transform: `translateX(-${translateX}%)`,
          }}
        >
          {DAYS.map((day) => (
            <div key={day} style={{ width: `${100 / DAYS.length}%` }} className="flex-shrink-0">
              <DayColumn
                day={day}
                recipes={mealPlan[day] || []}
                onRemoveRecipe={removeRecipe}
                onAddClick={() => setSelectedDay(day)}
              />
            </div>
          ))}
        </div>

        {/* Venstre pil */}
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

        {/* Højre pil */}
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
        availableRecipes={likedRecipes}
        addedRecipes={selectedDay ? (mealPlan[selectedDay] || []) : []}
        onSelect={(recipe) => {
          if (selectedDay) addRecipe(selectedDay, recipe);
          setSelectedDay(null);
        }}
        isLoading={isLoadingRecipes}
        error={recipesError}
      />
    </div>
  );
}

function DayColumn({
  day,
  recipes,
  onRemoveRecipe,
  onAddClick,
}: {
  day: string;
  recipes: RecipeSummary[];
  onRemoveRecipe: (day: string, recipeId: string) => void;
  onAddClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 py-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase text-xs">{day}</span>
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
