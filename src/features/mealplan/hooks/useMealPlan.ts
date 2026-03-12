import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { DAYS, type WeekInfo } from '../../../utils/weekUtils';
import { mealplanApi} from '../../../api/mealplanApi';
import type { MealPlanEntry } from '../../../types/MealPlan';
import { recipeApi } from '../../../api/recipeApi'; // Sikr dig denne import er her

type MealPlanData = { [key: string]: RecipeSummary[] };
type MealPlanEntriesMap = { [entryId: string]: MealPlanEntry };

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
        if (!mealPlan[dayName].some((r) => r.id === entry.recipe!.id)) {
          mealPlan[dayName].push(entry.recipe);
        }
      }
    }
  });
  return mealPlan;
}

export function useMealPlan(
  fetchRecipes: () => Promise<RecipeSummary[]>,
  weekInfo: WeekInfo
) {
  const [mealPlan, setMealPlan] = useState<MealPlanData>(getEmptyMealPlan());
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSummary[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<RecipeSummary[]>([]); // Ny state til likes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [entryMap, setEntryMap] = useState<MealPlanEntriesMap>({});
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
        let plans = await mealplanApi.getMealPlans();
        if ((!plans || plans.length === 0) && !creatingPlanRef.current) {
          creatingPlanRef.current = true;
          const newPlan = await mealplanApi.createMealPlan();
          plans = [newPlan];
        }
        if (plans && plans.length > 0) {
          const activePlan = plans[0];
          setMealPlanId(activePlan.id);
          const entriesMap: MealPlanEntriesMap = {};
          (activePlan.entries || []).forEach(e => entriesMap[e.id] = e);
          setEntryMap(entriesMap);
          setMealPlan(convertEntriesToMealPlanData(activePlan.entries || [], weekInfo));
        }
      } catch (err) {
        setError('Kunne ikke indlæse madplan');
      } finally {
        setLoading(false);
      }
    };
    loadMealPlan();
  }, [weekInfo.weekNumber]);

  const addRecipe = useCallback(async (day: string, recipe: RecipeSummary) => {
    if (!mealPlanId) return;
    const targetDate = getDateStringForDay(day, weekInfo);
    setMealPlan(prev => ({ ...prev, [day]: [...(prev[day] || []), recipe] }));
    try {
      const entry = await mealplanApi.addEntry(mealPlanId, recipe.id, targetDate, "Dinner", 4);
      setEntryMap(prev => ({ ...prev, [entry.id]: entry }));
    } catch {
      setError('Kunne ikke gemme');
    }
  }, [mealPlanId, weekInfo.weekNumber]);

  const removeRecipe = useCallback(async (day: string, recipeId: string) => {
    const targetDate = getDateStringForDay(day, weekInfo);
    const entryId = Object.entries(entryMap).find(([, e]) => e.recipeId === recipeId && e.date?.startsWith(targetDate))?.[0];
    if (entryId) {
      setMealPlan(prev => ({ ...prev, [day]: prev[day].filter(r => r.id !== recipeId) }));
      try {
        await mealplanApi.removeEntry(mealPlanId!, entryId);
        setEntryMap(prev => { const u = {...prev}; delete u[entryId]; return u; });
      } catch { setError('Kunne ikke fjerne'); }
    }
  }, [entryMap, mealPlanId, weekInfo.weekNumber]);

  return { 
    mealPlan,
    mealPlanId,
    availableRecipes, 
    likedIds, 
    addRecipe, 
    removeRecipe, 
    loading, 
    error 
  };
}