import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { type PeriodInfo, formatDateForApi } from '../../../utils/weekUtils';
import { mealplanApi} from '../../../api/mealplanApi';
import type { MealPlanEntry } from '../../../types/MealPlan';
import { recipeApi } from '../../../api/recipeApi';
import { shoppingListApi } from '../../../api/shoppingListApi';
import { groupApi } from '../../../api/groupApi';

type MealPlanData = { [key: string]: MealPlanEntry[] };

function getPeriodDateKeys(periodInfo: PeriodInfo): string[] {
  return periodInfo.days.map((_, index) => {
    const date = new Date(periodInfo.startDate);
    date.setDate(periodInfo.startDate.getDate() + index);
    return formatDateForApi(date);
  });
}

function getEmptyMealPlan(dateKeys: readonly string[]): MealPlanData {
  return Object.fromEntries(dateKeys.map((dateKey) => [dateKey, []]));
}

function convertEntriesToMealPlanData(entries: MealPlanEntry[], periodInfo: PeriodInfo): MealPlanData {
  const periodDateKeys = getPeriodDateKeys(periodInfo);
  const periodDateSet = new Set(periodDateKeys);
  const mealPlan: MealPlanData = getEmptyMealPlan(periodDateKeys);

  entries.forEach((entry) => {
    if (entry.recipe && entry.date) {
      const entryDateKey = entry.date.split('T')[0];
      if (periodDateSet.has(entryDateKey) && !mealPlan[entryDateKey].some((e) => e.id === entry.id)) {
        mealPlan[entryDateKey].push(entry);
      }
    }
  });
  return mealPlan;
}

export function useMealPlan(
  fetchRecipes: () => Promise<RecipeSummary[]>,
  periodInfo: PeriodInfo,
  groupId?: string
) {
  const [mealPlan, setMealPlan] = useState<MealPlanData>(getEmptyMealPlan(getPeriodDateKeys(periodInfo)));
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSummary[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<RecipeSummary[]>([]); // Ny state til likes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
/*  const creatingPlanRef = useRef(false);*/

  // Opdater mealPlan når periodInfo ændrer sig
  useEffect(() => {
    setMealPlan(getEmptyMealPlan(getPeriodDateKeys(periodInfo)));
  }, [periodInfo]);

  // 1. Hent alle tilgængelige opskrifter
  useEffect(() => {
    fetchRecipes()
      .then(setAvailableRecipes)
      .catch(() => {
        setError('Kunne ikke hente opskrifter');
      });
  }, [fetchRecipes]);


  useEffect(() => {
    recipeApi.getLikedRecipes()
      .then(data => {
        setLikedRecipes(data);
      })
      .catch(() => {
        setError('Kunne ikke hente likede opskrifter');
      });
  }, []);

  // Lav et lynhurtigt Set af ID'er for filtrering
  const likedIds = useMemo(() => {
    return new Set(likedRecipes.map(r => r.id.toLowerCase()));
  }, [likedRecipes]);

  // Hent madplan for den valgte periode
  useEffect(() => {
    const loadMealPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = formatDateForApi(periodInfo.startDate);
        const endDate = formatDateForApi(periodInfo.endDate);

         // --- GRUPPE-KONTEKST: Hent kun den pågældende gruppes madplan ---
        if (groupId) {
          const plan = await mealplanApi.getMealPlan({ groupId, startDate, endDate });
          if (plan) {
            setMealPlanId(plan.id);
            setMealPlan(convertEntriesToMealPlanData(plan.entries, periodInfo));
          } else {
            setError('Ingen madplan fundet.');
          }
        } else {
          const plan = await mealplanApi.getMealPlan({ startDate, endDate });
          if (plan) {
            setMealPlanId(plan.id);
            setMealPlan(convertEntriesToMealPlanData(plan.entries, periodInfo));
          } else {
            setError('Ingen madplan fundet.');
          }
        }
      } catch {
        setError('Kunne ikke indlæse madplan');
      } finally {
        setLoading(false);
      }
    };
    loadMealPlan();
  }, [periodInfo, groupId]);

  const addRecipe = useCallback(async (dateKey: string, recipe: RecipeSummary) => {
    if (!mealPlanId) return;
    const targetDate = dateKey;
    const tempId = `temp-${Date.now()}`;
    // Start with default servings
    let initialServings = 1;

    // Try to use group size as default servings
    if (groupId) {
      try {
        const group = await groupApi.getGroup(groupId);
        initialServings = group.members?.length || 4;
      } catch {
        // If group fetch fails, keep default
      }
    }

    try {
      try {
        const fullRecipe = await recipeApi.getRecipeById(recipe.id);
        if (fullRecipe && fullRecipe.servings) {
          initialServings = fullRecipe.servings;
        }
      } catch {
        // If fetching full recipe fails, fall back to group size or default servings
      }
      const tempEntry: MealPlanEntry = {
        id: tempId,
        mealPlanId: mealPlanId,
        recipeId: recipe.id,
        recipe,
        date: targetDate,
        mealType: 'Dinner',
        servings: initialServings,
        addedToShoppingList: false,
      };
      setMealPlan(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), tempEntry] }));
      const entry = await mealplanApi.addEntry(mealPlanId, recipe.id, targetDate, "Dinner", initialServings);
      // Erstat midlertidigt entry med det rigtige fra backend, og sikr servings er korrekt
      const finalEntry: MealPlanEntry = { ...entry, servings: entry.servings || initialServings };
      setMealPlan(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(e => e.id === tempId ? finalEntry : e)
      }));
    } catch {
      // Rollback: fjern midlertidigt entry
      setMealPlan(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(e => e.id !== tempId)
      }));
       setError('Kunne ikke gemme');
     }
   }, [mealPlanId, groupId]);

  const updateServings = useCallback(async (entryId: string, newServings: number) => {
    if (!mealPlanId || newServings < 1) return;
    let previousServings: number | undefined;
    for (const entries of Object.values(mealPlan)) {
      const found = entries.find(e => e.id === entryId);
      if (found) { previousServings = found.servings; break; }
    }
    // Optimistic update
    setMealPlan(prev => {
      const next = { ...prev };
      for (const day of Object.keys(next)) {
        next[day] = next[day].map(e => e.id === entryId ? { ...e, servings: newServings } : e);
      }
      return next;
    });
    try {
      await mealplanApi.updateEntryServings(mealPlanId, entryId, newServings);
    } catch {
      // Rollback ved fejl
      if (previousServings !== undefined) {
        setMealPlan(prev => {
          const next = { ...prev };
          for (const day of Object.keys(next)) {
            next[day] = next[day].map(e => e.id === entryId ? { ...e, servings: previousServings! } : e);
          }
          return next;
        });
      }
      setError('Kunne ikke opdatere antal personer');
    }
  }, [mealPlanId, mealPlan]);

  const removeRecipe = useCallback(async (dateKey: string, entryId: string) => {
    setMealPlan(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).filter(e => e.id !== entryId) }));
    try {
      await mealplanApi.removeEntry(mealPlanId!, entryId);
    } catch { setError('Kunne ikke fjerne'); }
  }, [mealPlanId]);

  const moveEntry = useCallback(async (entryId: string, fromDateKey: string, toDateKey: string) => {
    if (!mealPlanId || fromDateKey === toDateKey) return;

    const sourceEntries = mealPlan[fromDateKey] || [];
    const entryToMove = sourceEntries.find((entry) => entry.id === entryId);
    if (!entryToMove) return;

    const movedEntry: MealPlanEntry = {
      ...entryToMove,
      date: toDateKey,
    };

    // Optimistic move in UI.
    setMealPlan((prev) => ({
      ...prev,
      [fromDateKey]: (prev[fromDateKey] || []).filter((entry) => entry.id !== entryId),
      [toDateKey]: [...(prev[toDateKey] || []), movedEntry],
    }));

    try {
      await mealplanApi.updateEntry(mealPlanId, entryId, {
        date: toDateKey,
        servings: entryToMove.servings
      });
    } catch {
      // Rollback if backend update fails.
      setMealPlan((prev) => ({
        ...prev,
        [toDateKey]: (prev[toDateKey] || []).filter((entry) => entry.id !== entryId),
        [fromDateKey]: [...(prev[fromDateKey] || []), entryToMove],
      }));
      throw new Error('MOVE_ENTRY_FAILED');
    }
  }, [mealPlan, mealPlanId]);

  const removeFromShoppingList = useCallback(async (
    shoppingListId: string,
    targetMealPlanId: string,
    entryId: string,
  ) => {
    try {
      await shoppingListApi.removeFromMealPlan(shoppingListId, targetMealPlanId, entryId);
      setMealPlan((prev) => {
        const next: MealPlanData = {};
        for (const day of Object.keys(prev)) {
          next[day] = prev[day].map((entry) =>
            entry.id === entryId
              ? { ...entry, addedToShoppingList: false }
              : entry,
          );
        }
        return next;
      });
    } catch (error) {
      setError('Kunne ikke fjerne fra indkøbslisten');
      throw error;
    }
  }, []);

  const markEntriesAsAddedToShoppingList = useCallback((entryIds: string[]) => {
    if (entryIds.length === 0) return;

    const entryIdSet = new Set(entryIds);
    setMealPlan((prev) => {
      const next: MealPlanData = {};
      for (const day of Object.keys(prev)) {
        next[day] = prev[day].map((entry) =>
          entryIdSet.has(entry.id)
            ? { ...entry, addedToShoppingList: true }
            : entry,
        );
      }
      return next;
    });
  }, []);

  return {
    mealPlan,
    mealPlanId,
    availableRecipes, 
    likedIds, 
    addRecipe, 
    removeRecipe, 
    moveEntry,
    updateServings,
    removeFromShoppingList,
    markEntriesAsAddedToShoppingList,
    loading,
    error 
  };
}