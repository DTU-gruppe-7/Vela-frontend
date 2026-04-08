import { useState, useMemo } from 'react';
import type { MealPlanEntry } from '../../../types/MealPlan';
import RecipeCard from '../../../components/ui/RecipeCard';
import { ServingsControl } from '../../../components/ui/ServingsControl';
import { AddRecipeButton } from '../../../components/ui/AddRecipeButton';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { GenerateShoppingListModal } from '../components/GenerateShoppingListModal';
import { getWeekInfo, DAYS } from '../../../utils/weekUtils';
import { useMealPlan } from '../hooks/useMealPlan';
import { usePersonalGroups } from '../hooks/usePersonalGroups';
import { useWeekOffset } from '../hooks/useWeekOffset';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSwipe } from '../../../hooks/useSwipe';
import { recipeApi } from '../../../api/recipeApi';
import { useParams } from 'react-router-dom';
import { getSourceDotColor } from '../utils/sourceDotColor';

const VISIBLE_COLUMNS = 4;
const MOBILE_BREAKPOINT = 1024;

export default function MealPlanPage() {

  const { groupId } = useParams<{ groupId: string }>();
  const isPersonalView = !groupId;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number] | null>(null);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);   
  const groups = usePersonalGroups(isPersonalView);
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  const weekInfo = useMemo(() => getWeekInfo(selectedWeek), [selectedWeek]);
  const visibleColumns = isMobile ? 1 : VISIBLE_COLUMNS;
  const { setWeekOffset, canGoBack, canGoForward, translateX } = useWeekOffset(DAYS.length, visibleColumns);
  const { weekNumber, dateRange } = weekInfo;
  const { 
    mealPlan, 
    availableRecipes, 
    mealPlanId,
    addRecipe, 
    removeRecipe, 
    updateServings,
    error 
  } = useMealPlan(
    recipeApi.getAllRecipes,
    weekInfo,
    groupId,
  );

    const swipeHandlers = useSwipe({
        onSwipeLeft: () => {
            if (canGoForward) setWeekOffset(o => o + 1);
        },
        onSwipeRight: () => {
            if (canGoBack) setWeekOffset(o => o - 1);
        },
        threshold: 50
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-800">Madplan</h1>
                    
                    {isPersonalView && (
                      <div className="relative ml-0 sm:ml-4">
                        <select
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="all">Vis: Alle</option>
                            <option value="Personlig">Vis: Personlig</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.name}>Vis: {g.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-wrap xl:flex-nowrap">
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
            <div 
                className="relative overflow-hidden border-2 border-slate-200 rounded-2xl shadow-xl bg-white"
                {...swipeHandlers}
            >
                <div
                    className="flex divide-x-2 divide-slate-200 transition-transform duration-500 ease-out"
                    style={{
                        width: `${(DAYS.length / visibleColumns) * 100}%`,
                        transform: `translateX(-${translateX}%)`,
                    }}
                >
                    {DAYS.map((day, index) => {
                        const dayEntries = mealPlan[day] || [];
                        const visibleEntries = dayEntries.filter(entry => {
                            if (!isPersonalView) return true;
                            if (activeFilter === 'all') return true;
                            const sourceName = entry.source === 'group' ? (entry.sourceGroupName || 'Gruppe') : 'Personlig';
                            return sourceName === activeFilter;
                        });

                        return (
                            <div key={day} style={{ width: `${100 / DAYS.length}%` }} className="flex-shrink-0">
                                <DayColumn
                                    day={day}
                                    date={new Date(weekInfo.monday.getTime() + index * 24 * 60 * 60 * 1000)}
                                    entries={visibleEntries}
                                    onRemoveRecipe={removeRecipe}
                                    onUpdateServings={updateServings}
                                    onAddClick={() => setSelectedDay(day)}
                                    isPersonalView={isPersonalView}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Navigationspile */}
                {canGoBack && (
                    <div className="absolute left-0 top-0 bottom-0 w-20 hidden lg:flex items-center justify-center pointer-events-none">
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
                    <div className="absolute right-0 top-0 bottom-0 w-20 hidden lg:flex items-center justify-center pointer-events-none">
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
            {selectedDay !== null && (
                <AddRecipeModal
                    isOpen={true}
                    onClose={() => setSelectedDay(null)}
                    day={selectedDay}
                    availableRecipes={availableRecipes}
                    addedRecipes={(mealPlan[selectedDay] || []).filter(e => e.recipe).map(e => e.recipe!)}
                    onSelect={(recipe) => {
                        addRecipe(selectedDay, recipe);
                        setSelectedDay(null);
                    }}
                />
            )}

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
                       entries,
                       isPersonalView,
                       onRemoveRecipe,
                       onUpdateServings,
                       onAddClick,
                   }: {
    day: string;
    date: Date;
    entries: MealPlanEntry[];
    isPersonalView: boolean;
    onRemoveRecipe: (day: string, recipeId: string) => void;
    onUpdateServings: (entryId: string, newServings: number) => void;
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
        {entries.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
{entries.filter(e => e.recipe).map((entry) => {
                // En entry kan kun redigeres hvis den er personlig. Gruppe-entries er locked fast.
                const isEditable = !isPersonalView || entry.source !== 'group';
                return (
                  <div key={entry.id} className="relative">
                    <RecipeCard
                      recipe={entry.recipe!}
                      compact
                      showKeywords={false}
                      onRemove={isEditable ? () => onRemoveRecipe(day, entry.id) : undefined}
                      topRightContent={
                        isEditable ? (
                          <ServingsControl
                            value={entry.servings}
                            onChange={(newVal) => onUpdateServings(entry.id, newVal)}
                          />
                        ) : (
                           <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                            👥 {entry.servings}
                          </span>
                        )
                      }
                    />
                    {/* 4d: Badge renderingen (Visuel bekræftelse på oprindelsen) */}
                    {isPersonalView && (
                      <div className="mt-1 flex items-center gap-1.5 px-1 pb-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full shadow-sm ${
                                                        getSourceDotColor(entry)
                          }`}
                        />
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                          {entry.source === 'group'
                            ? entry.sourceGroupName || 'Gruppe'
                            : 'Personlig'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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