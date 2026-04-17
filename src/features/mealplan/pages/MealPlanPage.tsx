import { useState, useMemo, useEffect } from 'react';
import type { MealPlanEntry } from '../../../types/MealPlan';
import RecipeCard from '../../../components/ui/RecipeCard';
import { ServingsControl } from '../../../components/ui/ServingsControl';
import { Modal } from '../../../components/ui/Modal';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { GenerateShoppingListModal } from '../components/GenerateShoppingListModal';
import { formatDateForApi, getPeriodInfo, type DayName, type ViewMode } from '../../../utils/weekUtils';
import { useMealPlan } from '../hooks/useMealPlan';
import { usePersonalGroups } from '../hooks/usePersonalGroups';
import { useShoppingList } from '../../shoppingList/hooks/useShoppingList';
import { shoppingListApi } from '../../../api/shoppingListApi';
import { useWeekOffset } from '../hooks/useWeekOffset';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSwipe } from '../../../hooks/useSwipe';
import { recipeApi } from '../../../api/recipeApi';
import { useNavigate, useParams } from 'react-router-dom';
import { getSourceDotColor } from '../utils/sourceDotColor';

const VISIBLE_COLUMNS = 4;
const MOBILE_BREAKPOINT = 1024;

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  '1day': '1 dag',
  'work': 'Arbejdsuge',
  '1week': '1 uge',
  '2weeks': '2 uger',
};

export default function MealPlanPage() {

  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const isPersonalView = !groupId;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('1week');
  const [periodOffset, setPeriodOffset] = useState(0);
  const [showViewModeDropdown, setShowViewModeDropdown] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ dateKey: string; dayLabel: DayName } | null>(null);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [entryToRemoveFromShoppingList, setEntryToRemoveFromShoppingList] = useState<MealPlanEntry | null>(null);
  const [isRemovingFromShoppingList, setIsRemovingFromShoppingList] = useState(false);
  const [shoppingListRemovalError, setShoppingListRemovalError] = useState<string | null>(null);
  const [pendingServingsChange, setPendingServingsChange] = useState<{ entry: MealPlanEntry; newServings: number } | null>(null);
  const [isApplyingServingsChange, setIsApplyingServingsChange] = useState(false);
  const [servingsChangeError, setServingsChangeError] = useState<string | null>(null);
  const [draggedEntry, setDraggedEntry] = useState<{ entryId: string; fromDateKey: string } | null>(null);
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);
  const [dragMoveError, setDragMoveError] = useState<string | null>(null);
  const groups = usePersonalGroups(isPersonalView);
  const { shoppingList } = useShoppingList(groupId);
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);

   const periodInfo = useMemo(() => getPeriodInfo(viewMode, periodOffset), [viewMode, periodOffset]);
   const dayColumns = useMemo(() => {
     return periodInfo.days.map((dayLabel, index) => {
       const date = new Date(periodInfo.startDate);
       date.setDate(periodInfo.startDate.getDate() + index);
       return {
         dayLabel,
         date,
         dateKey: formatDateForApi(date),
       };
     });
   }, [periodInfo]);
   const is1Day = viewMode === '1day';
   const visibleColumns = isMobile ? 1 : (is1Day ? 1 : VISIBLE_COLUMNS);
   const { setWeekOffset, canGoBack, canGoForward, translateX } = useWeekOffset(periodInfo.days.length, visibleColumns);
  const { weekNumber, dateRange } = periodInfo;

  const {
    mealPlan,
    availableRecipes,
    mealPlanId,
    addRecipe,
    removeRecipe,
    moveEntry,
    updateServings,
    removeFromShoppingList,
    markEntriesAsAddedToShoppingList,
    error
  } = useMealPlan(
    recipeApi.getAllRecipes,
    periodInfo,
    groupId,
  );

  // Reset periodOffset when viewMode changes to ensure we're showing the correct period
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    setPeriodOffset(0);
    setWeekOffset(0);
  };

  // Navigate to current period
  const goToToday = () => {
    setPeriodOffset(0);
    setWeekOffset(0);
  };

  // Check if we're viewing the current period
  const isCurrentPeriod = periodOffset === 0;

  const closeRemoveFromShoppingListModal = () => {
    if (isRemovingFromShoppingList) return;
    setEntryToRemoveFromShoppingList(null);
    setShoppingListRemovalError(null);
  };

  const handleRequestRemoveFromShoppingList = (entry: MealPlanEntry) => {
    setShoppingListRemovalError(null);
    setEntryToRemoveFromShoppingList(entry);
  };

  const handleConfirmRemoveFromShoppingList = async () => {
    if (!entryToRemoveFromShoppingList) return;

    setIsRemovingFromShoppingList(true);
    setShoppingListRemovalError(null);
    try {

        if (isPersonalView && entryToRemoveFromShoppingList.source === 'group') {
          setShoppingListRemovalError(
            'Gruppeopskrifter kan kun fjernes fra indkøbslisten via gruppens madplan.'
          );
          setIsRemovingFromShoppingList(false);
          return;
        }
      const resolvedShoppingListId = shoppingList?.id ?? (await shoppingListApi.getShoppingList(groupId)).id;
      const resolvedMealPlanId = mealPlanId ?? entryToRemoveFromShoppingList.mealPlanId;

      await removeFromShoppingList(
        resolvedShoppingListId,
        resolvedMealPlanId,
        entryToRemoveFromShoppingList.id,
      );
      setEntryToRemoveFromShoppingList(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kunne ikke fjerne opskriften fra indkøbslisten. Prøv igen.';
      setShoppingListRemovalError(message);
    } finally {
      setIsRemovingFromShoppingList(false);
    }
  };

  const closeServingsWarningModal = () => {
    if (isApplyingServingsChange) return;
    setPendingServingsChange(null);
    setServingsChangeError(null);
  };

  const handleRequestServingsChange = async (entry: MealPlanEntry, newServings: number) => {
    if (entry.servings === newServings) return;

    if (!entry.addedToShoppingList) {
      await updateServings(entry.id, newServings);
      return;
    }

    setServingsChangeError(null);
    setPendingServingsChange({ entry, newServings });
  };

  const handleConfirmServingsChange = async () => {
    if (!pendingServingsChange) return;

    setIsApplyingServingsChange(true);
    setServingsChangeError(null);
    try {
      const resolvedShoppingListId = shoppingList?.id ?? (await shoppingListApi.getShoppingList(groupId)).id;
      const resolvedMealPlanId = mealPlanId ?? pendingServingsChange.entry.mealPlanId;

      await removeFromShoppingList(
        resolvedShoppingListId,
        resolvedMealPlanId,
        pendingServingsChange.entry.id,
      );

      await updateServings(pendingServingsChange.entry.id, pendingServingsChange.newServings);
      setPendingServingsChange(null);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Kunne ikke opdatere antal personer. Prøv igen.';
      setServingsChangeError(message);
    } finally {
      setIsApplyingServingsChange(false);
    }
  };

  const nonGeneratedEntries = useMemo(() => {
    const flattened = Object.values(mealPlan).flat();

    // Keep only entries that backend has not already added
    const notGenerated = flattened.filter((entry) => !entry.addedToShoppingList);

    // Deduplicate by entry id (safe guard)
    return Array.from(new Map(notGenerated.map((e) => [e.id, e])).values());
  }, [mealPlan]);

  const candidateEntries = useMemo(() => {
    if (!isPersonalView) return nonGeneratedEntries;

    // Personal mealplan generation must not include group meal entries.
    return nonGeneratedEntries.filter((entry) => entry.source !== 'group');
  }, [isPersonalView, nonGeneratedEntries]);

  const forcedExcludedEntryIds = useMemo(() => {
    if (!isPersonalView) return [];
    return nonGeneratedEntries
      .filter((entry) => entry.source === 'group')
      .map((entry) => entry.id);
  }, [isPersonalView, nonGeneratedEntries]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (canGoForward) setWeekOffset(o => o + 1);
    },
    onSwipeRight: () => {
      if (canGoBack) setWeekOffset(o => o - 1);
    },
    threshold: 50
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowViewModeDropdown(false);
    if (showViewModeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showViewModeDropdown]);

  const handleDragStartEntry = (entryId: string, fromDateKey: string) => {
    setDraggedEntry({ entryId, fromDateKey });
    setDragMoveError(null);
  };

  const handleDragEnterDay = (dateKey: string) => {
    if (!draggedEntry) return;
    setDragOverDateKey(dateKey);
  };

  const handleDragEndEntry = () => {
    setDraggedEntry(null);
    setDragOverDateKey(null);
  };

  const handleDropOnDay = async (targetDateKey: string) => {
    if (!draggedEntry) return;

    const { entryId, fromDateKey } = draggedEntry;
    setDraggedEntry(null);
    setDragOverDateKey(null);

    if (fromDateKey === targetDateKey) return;

    try {
      await moveEntry(entryId, fromDateKey, targetDateKey);
      setDragMoveError(null);
    } catch {
      setDragMoveError('Kunne ikke flytte opskriften. Prøv igen.');
    }
  };

    return (
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 pt-1 pb-4 lg:pt-2 lg:pb-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
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

                <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap">
                    {/* Visningsperiode dropdown */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowViewModeDropdown(!showViewModeDropdown);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                            {VIEW_MODE_LABELS[viewMode]}
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showViewModeDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                                {(Object.keys(VIEW_MODE_LABELS) as ViewMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => handleViewModeChange(mode)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition first:rounded-t-lg last:rounded-b-lg ${
                                            viewMode === mode ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
                                        }`}
                                    >
                                        {VIEW_MODE_LABELS[mode]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* I dag knap */}
                    {!isCurrentPeriod && (
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
                        >
                            I dag
                        </button>
                    )}

                    {/* Generér indkøbsliste-knap */}
                    <button
                        onClick={() => setShowShoppingListModal(true)}
                        disabled={!mealPlanId}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white shadow hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Generér indkøbsliste
                    </button>

                    {/* Periode-navigation */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1 py-1">
                        <button
                            onClick={() => setPeriodOffset((o) => o - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all text-sm"
                        >
                            ‹
                        </button>
                        <span className="text-sm font-medium text-slate-600 px-2 whitespace-nowrap">
                            {viewMode === '1day' ? (
                                <>{dateRange} {isCurrentPeriod && <span className="ml-2 text-xs text-indigo-500 font-semibold">I dag</span>}</>
                            ) : (
                                <>Uge {weekNumber} &nbsp;·&nbsp; {dateRange} {isCurrentPeriod && <span className="ml-2 text-xs text-indigo-500 font-semibold">Denne uge</span>}</>
                            )}
                        </span>
                        <button
                            onClick={() => setPeriodOffset((o) => o + 1)}
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

            {dragMoveError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ {dragMoveError}
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
                        width: `${(periodInfo.days.length / visibleColumns) * 100}%`,
                        transform: `translateX(-${translateX}%)`,
                    }}
                >
                    {dayColumns.map(({ dayLabel, date, dateKey }) => {
                        const dayEntries = mealPlan[dateKey] || [];
                        const visibleEntries = dayEntries.filter(entry => {
                            if (!isPersonalView) return true;
                            if (activeFilter === 'all') return true;
                            const sourceName = entry.source === 'group' ? (entry.sourceGroupName || 'Gruppe') : 'Personlig';
                            return sourceName === activeFilter;
                        });

                        return (
                            <div key={dateKey} style={{ width: `${100 / periodInfo.days.length}%` }} className="shrink-0">
                                <DayColumn
                                    day={dayLabel}
                                    date={date}
                                    dateKey={dateKey}
                                    entries={visibleEntries}
                                    isDropTarget={dragOverDateKey === dateKey}
                                    onDragStartEntry={handleDragStartEntry}
                                    onDragEnterDay={handleDragEnterDay}
                                    onDragEndEntry={handleDragEndEntry}
                                    onDropOnDay={handleDropOnDay}
                                    onRecipeClick={(recipeId) => navigate(`/recipes/${recipeId}`)}
                                    onRemoveRecipe={removeRecipe}
                                    onUpdateServings={handleRequestServingsChange}
                                    onRequestRemoveFromShoppingList={handleRequestRemoveFromShoppingList}
                                    isRemovingFromShoppingList={isRemovingFromShoppingList}
                                    onAddClick={() => setSelectedDay({ dateKey, dayLabel })}
                                    isPersonalView={isPersonalView}
                                    showMobileDayNavigation={isMobile && !is1Day}
                                    canGoBackDay={canGoBack}
                                    canGoForwardDay={canGoForward}
                                    onGoToPreviousDay={() => setWeekOffset((offset) => offset - 1)}
                                    onGoToNextDay={() => setWeekOffset((offset) => offset + 1)}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Navigationspile - only show if not in 1-day mode */}
                {!is1Day && canGoBack && (
                    <div className="absolute left-0 top-0 bottom-0 w-20 hidden lg:flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-linear-to-r from-white/70 to-transparent rounded-l-2xl" />
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

                {!is1Day && canGoForward && (
                    <div className="absolute right-0 top-0 bottom-0 w-20 hidden lg:flex items-center justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-linear-to-l from-white/70 to-transparent rounded-r-2xl" />
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
                    day={selectedDay.dayLabel}
                    availableRecipes={availableRecipes}
                    addedRecipes={(mealPlan[selectedDay.dateKey] || []).filter(e => e.recipe).map(e => e.recipe!)}
                    onSelect={(recipe) => {
                        addRecipe(selectedDay.dateKey, recipe);
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
                    groupId={groupId}
                    startDate={formatDateForApi(periodInfo.startDate)}
                    endDate={formatDateForApi(periodInfo.endDate)}
                    candidateEntries={candidateEntries}
                    forcedExcludedEntryIds={forcedExcludedEntryIds}
                    onGenerated={(generatedEntryIds) => {
                      markEntriesAsAddedToShoppingList(generatedEntryIds);
                    }}
                />
            )}

            <Modal
                isOpen={entryToRemoveFromShoppingList !== null}
                onClose={closeRemoveFromShoppingListModal}
                title="Fjern fra indkøbsliste"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-700">
                        Vil du fjerne{' '}
                        <span className="font-semibold">
                            {entryToRemoveFromShoppingList?.recipe?.name ?? 'denne opskrift'}
                        </span>{' '}
                        fra indkøbslisten?
                    </p>
                    {shoppingListRemovalError && (
                        <p className="text-sm text-red-600">⚠️ {shoppingListRemovalError}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={closeRemoveFromShoppingListModal}
                            disabled={isRemovingFromShoppingList}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                        >
                            Annuller
                        </button>
                        <button
                            onClick={handleConfirmRemoveFromShoppingList}
                            disabled={isRemovingFromShoppingList}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isRemovingFromShoppingList ? 'Fjerner…' : 'Fjern'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={pendingServingsChange !== null}
                onClose={closeServingsWarningModal}
                title="Opdater antal personer"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-700">
                        Denne opskrift er allerede tilføjet til indkøbslisten. Hvis du fortsætter,
                        bliver varerne fjernet fra indkøbslisten før antallet af personer opdateres.
                    </p>
                    {servingsChangeError && (
                        <p className="text-sm text-red-600">⚠️ {servingsChangeError}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={closeServingsWarningModal}
                            disabled={isApplyingServingsChange}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                        >
                            Annuller
                        </button>
                        <button
                            onClick={handleConfirmServingsChange}
                            disabled={isApplyingServingsChange}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-amber-600 text-white shadow hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isApplyingServingsChange ? 'Opdaterer…' : 'Fortsæt'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function DayColumn({
                       day,
                       date,
                       dateKey,
                       entries,
                       isDropTarget,
                       isPersonalView,
                       onDragStartEntry,
                       onDragEnterDay,
                       onDragEndEntry,
                       onDropOnDay,
                       onRecipeClick,
                       onRemoveRecipe,
                       onUpdateServings,
                       onRequestRemoveFromShoppingList,
                       isRemovingFromShoppingList,
                       onAddClick,
                       showMobileDayNavigation,
                       canGoBackDay,
                       canGoForwardDay,
                       onGoToPreviousDay,
                       onGoToNextDay,
                   }: {
    day: DayName;
    date: Date;
    dateKey: string;
    entries: MealPlanEntry[];
    isDropTarget: boolean;
    isPersonalView: boolean;
    onDragStartEntry: (entryId: string, fromDateKey: string) => void;
    onDragEnterDay: (dateKey: string) => void;
    onDragEndEntry: () => void;
    onDropOnDay: (dateKey: string) => void;
    onRecipeClick: (recipeId: string) => void;
    onRemoveRecipe: (dateKey: string, recipeId: string) => void;
    onUpdateServings: (entry: MealPlanEntry, newServings: number) => void;
    onRequestRemoveFromShoppingList: (entry: MealPlanEntry) => void;
    isRemovingFromShoppingList: boolean;
    onAddClick: () => void;
    showMobileDayNavigation: boolean;
    canGoBackDay: boolean;
    canGoForwardDay: boolean;
    onGoToPreviousDay: () => void;
    onGoToNextDay: () => void;
}) {
    const dateStr = date.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 py-3 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-white flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-700 tracking-wide uppercase text-xs">{day}</span>
          <span className="text-xs text-slate-500 ml-2">{dateStr}</span>
        </div>
        <div className="flex items-center gap-2">
          {showMobileDayNavigation && canGoBackDay && (
            <button
              type="button"
              onClick={onGoToPreviousDay}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
              aria-label="Vis forrige dag"
            >
              ‹
            </button>
          )}
          {showMobileDayNavigation && canGoForwardDay && (
            <button
              type="button"
              onClick={onGoToNextDay}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
              aria-label="Vis næste dag"
            >
              ›
            </button>
          )}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            title="Tilføj opskrift"
          >
            <span className="text-lg font-semibold">+</span>
          </button>
        </div>
      </div>
      <div
        className={`p-3 sm:p-4 lg:p-5 flex flex-col min-h-44 transition-colors ${isDropTarget ? 'bg-indigo-50/60' : 'bg-white'}`}
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={() => onDragEnterDay(dateKey)}
        onDrop={(event) => {
          event.preventDefault();
          onDropOnDay(dateKey);
        }}
      >
        {entries.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
{entries.filter(e => e.recipe).map((entry) => {
                // En entry kan kun redigeres hvis den er personlig. Gruppe-entries er locked fast.
                const isEditable = !isPersonalView || entry.source !== 'group';
                const showShoppingListCheckmark = entry.addedToShoppingList;
                const isLockedGroupEntryInPersonalView = isPersonalView && entry.source === 'group';
                const canClickShoppingListCheckmark =
                  showShoppingListCheckmark && !isLockedGroupEntryInPersonalView;
                const isDraggable = isEditable;
                return (
                  <div
                    key={entry.id}
                    className={`relative ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    draggable={isDraggable}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', String(entry.id)); // For Safari og Firefox
                      onDragStartEntry(entry.id, dateKey);
                    }}
                    onDragEnd={onDragEndEntry}
                  >
                    <RecipeCard
                      recipe={entry.recipe!}
                      compact
                      showKeywords={false}
                      onClick={() => onRecipeClick(entry.recipe!.id)}
                      onRemove={isEditable ? () => onRemoveRecipe(dateKey, entry.id) : undefined}
                      topRightContent={
                        <div className="flex items-center gap-2">
                          {isEditable ? (
                            <ServingsControl
                              value={entry.servings}
                              onChange={(newVal) => onUpdateServings(entry, newVal)}
                            />
                          ) : (
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                              👥 {entry.servings}
                            </span>
                          )}
                          {showShoppingListCheckmark && (
                            <button
                              type="button"
                              onClick={(event) => {
                                if (!canClickShoppingListCheckmark) return;
                                event.stopPropagation();
                                onRequestRemoveFromShoppingList(entry);
                              }}
                              disabled={isRemovingFromShoppingList || !canClickShoppingListCheckmark}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition ${
                                canClickShoppingListCheckmark
                                  ? 'hover:bg-emerald-200'
                                  : 'opacity-60 cursor-default'
                              } disabled:cursor-not-allowed`}
                              title={canClickShoppingListCheckmark
                                ? 'Fjern fra indkøbsliste'
                                : 'Kan kun fjernes via gruppens madplan'}
                              aria-label={canClickShoppingListCheckmark
                                ? 'Fjern fra indkøbsliste'
                                : 'Tilføjet til indkøbsliste. Kan kun fjernes via gruppens madplan'}
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}
                        </div>
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
                        {entry.source === 'group' && (
                          <span
                            className="inline-flex items-center text-slate-400"
                            title="Denne opskrift kommer fra en gruppe. Gå til gruppens madplan for at ændre den."
                            aria-label="Låst gruppeopskrift"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <rect x="5" y="11" width="14" height="10" rx="2" />
                              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                            </svg>
                          </span>
                        )}
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
                    </>
                ) : (
                    <>
                        <p className="mt-3 text-xs text-slate-400 text-center">Ingen opskrift valgt</p>
                    </>
                )}
            </div>
        </div>
    );
}