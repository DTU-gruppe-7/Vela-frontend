import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { DAYS, type WeekInfo } from '../../../utils/weekUtils';
import { mealplanApi} from '../../../api/mealplanApi';
import type { MealPlanEntry } from '../../../types/MealPlan';
import { recipeApi } from '../../../api/recipeApi';

type MealPlanData = { [key: string]: MealPlanEntry[] };

function getEmptyMealPlan(): MealPlanData {
  return Object.fromEntries(DAYS.map((d) => [d, []]));
}

function getDateStringForDay(dayName: string, weekInfo: WeekInfo): string {
  const dayIndex = DAYS.indexOf(dayName);
  const date = new Date(weekInfo.monday);
  date.setDate(date.getDate() + dayIndex);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function convertEntriesToMealPlanData(entries: MealPlanEntry[], weekInfo: WeekInfo): MealPlanData {
  const mealPlan: MealPlanData = getEmptyMealPlan();
  const weekDates = DAYS.map(day => getDateStringForDay(day, weekInfo));

  entries.forEach((entry) => {
    if (entry.recipe && entry.date) {
      const entryDateOnly = entry.date.split('T')[0];
      const dayIndex = weekDates.indexOf(entryDateOnly);
      if (dayIndex !== -1) {
        const dayName = DAYS[dayIndex];
        if (!mealPlan[dayName].some((e) => e.id === entry.id)) {
          mealPlan[dayName].push(entry);
        }
      }
    }
  });
  return mealPlan;
}

export function useMealPlan(
  fetchRecipes: () => Promise<RecipeSummary[]>,
  weekInfo: WeekInfo,
  groupId?: string
) {
  const [mealPlan, setMealPlan] = useState<MealPlanData>(getEmptyMealPlan());
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSummary[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<RecipeSummary[]>([]); // Ny state til likes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const creatingPlanRef = useRef(false);

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

  // Hent madplan for den valgte uge
  useEffect(() => {
    const loadMealPlan = async () => {
      setLoading(true);
      try {
        let plans;
        plans = await mealplanApi.getMealPlans();
        if ((!plans || plans.length === 0) && !creatingPlanRef.current) {
          creatingPlanRef.current = true;
          const newPlan = await mealplanApi.createMealPlan();
          plans = [newPlan];
        }
        if (plans && plans.length > 0) {
          const activePlan = plans[0];
          setMealPlanId(activePlan.id);
          setMealPlan(convertEntriesToMealPlanData(activePlan.entries || [], weekInfo));
        }
      } catch (err) {
        setError('Kunne ikke indlæse madplan');
      } finally {
        setLoading(false);
      }
    };
    loadMealPlan();
  }, [weekInfo.weekNumber, groupId]);

  const addRecipe = useCallback(async (day: string, recipe: RecipeSummary) => {
    if (!mealPlanId) return;
    const targetDate = getDateStringForDay(day, weekInfo);
    const tempId = `temp-${Date.now()}`;
    // Default servings; will be overridden if recipe details are available
    let initialServings = 4;
    try {
      try {
        const fullRecipe = await recipeApi.getRecipeById(recipe.id);
        if (fullRecipe && typeof fullRecipe.servings === 'number') {
          initialServings = fullRecipe.servings;
        }
      } catch {
        // If fetching full recipe fails, fall back to default servings
      }
      const tempEntry: MealPlanEntry = {
        id: tempId,
        recipeId: recipe.id,
        recipe,
        date: targetDate,
        mealType: 'Dinner',
        servings: initialServings,
      };
      setMealPlan(prev => ({ ...prev, [day]: [...(prev[day] || []), tempEntry] }));
      const entry = await mealplanApi.addEntry(mealPlanId, recipe.id, targetDate, "Dinner", initialServings);
      // Erstat midlertidigt entry med det rigtige fra backend, og sikr servings er korrekt
      const finalEntry: MealPlanEntry = { ...entry, servings: entry.servings || initialServings };
      setMealPlan(prev => ({
        ...prev,
        [day]: prev[day].map(e => e.id === tempId ? finalEntry : e)
      }));
    } catch {
      // Rollback: fjern midlertidigt entry
      setMealPlan(prev => ({
        ...prev,
        [day]: prev[day].filter(e => e.id !== tempId)
      }));
      setError('Kunne ikke gemme');
    }
  }, [mealPlanId, weekInfo.weekNumber]);

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

  const removeRecipe = useCallback(async (day: string, entryId: string) => {
    setMealPlan(prev => ({ ...prev, [day]: prev[day].filter(e => e.id !== entryId) }));
    try {
      await mealplanApi.removeEntry(mealPlanId!, entryId);
    } catch { setError('Kunne ikke fjerne'); }
  }, [mealPlanId]);

  return { 
    mealPlan,
    mealPlanId,
    availableRecipes, 
    likedIds, 
    addRecipe, 
    removeRecipe, 
    updateServings,
    loading, 
    error 
  };
}