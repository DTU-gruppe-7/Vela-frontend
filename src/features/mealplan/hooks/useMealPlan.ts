import { useState, useEffect, useCallback } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { DAYS, type WeekInfo } from '../../../utils/weekUtils';
import { mealplanApi} from '../../../api/mealplanApi';
import type { MealPlan, MealPlanEntry } from '../../../types/MealPlan';

type MealPlanData = { [key: string]: RecipeSummary[] };
type MealPlanEntriesMap = { [entryId: string]: MealPlanEntry };

const EMPTY_MEAL_PLAN: MealPlanData = Object.fromEntries(DAYS.map((d) => [d, []]));

function getStorageKey(weekInfo: WeekInfo): string {
  return `mealplan_${weekInfo.monday.getFullYear()}_week_${weekInfo.weekNumber}`;
}

function loadMealPlanFromStorage(weekInfo: WeekInfo): MealPlanData {
  const key = getStorageKey(weekInfo);
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Fejl ved indlæsning fra localStorage:', error);
  }
  return EMPTY_MEAL_PLAN;
}

function saveMealPlanToStorage(weekInfo: WeekInfo, mealPlan: MealPlanData): void {
  const key = getStorageKey(weekInfo);
  try {
    localStorage.setItem(key, JSON.stringify(mealPlan));
  } catch (error) {
    console.error('Fejl ved gemning til localStorage:', error);
  }
}

function convertEntriesToMealPlanData(entries: MealPlanEntry[]): MealPlanData {
  const mealPlan: MealPlanData = { ...EMPTY_MEAL_PLAN };
  entries.forEach((entry) => {
    if (entry.recipe && entry.day) {
      if (!mealPlan[entry.day]) mealPlan[entry.day] = [];
      if (!mealPlan[entry.day].some((r) => r.id === entry.recipe!.id)) {
        mealPlan[entry.day].push(entry.recipe);
      }
    }
  });
  return mealPlan;
}

export function useMealPlan(
  fetchRecipes: () => Promise<RecipeSummary[]>,
  weekInfo: WeekInfo
) {
  const [mealPlan, setMealPlan] = useState<MealPlanData>(EMPTY_MEAL_PLAN);
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [entryMap, setEntryMap] = useState<MealPlanEntriesMap>({});

  // Hent tilgængelige opskrifter
  useEffect(() => {
    fetchRecipes()
      .then(setAvailableRecipes)
      .catch((err) => {
        console.error('Fejl ved hentning af opskrifter:', err);
        setError('Kunne ikke hente opskrifter');
      });
  }, [fetchRecipes]);

  // --- HER ER DEN RETTEDE INDLÆSNING FRA BACKEND ---
  useEffect(() => {
    const loadMealPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const plans: MealPlan[] = await mealplanApi.getMealPlans();
        
        if (plans && plans.length > 0) {
          const activePlan = plans[0]; // Vi tager den første madplan (Min Test Madplan)
          setMealPlanId(activePlan.id);

          const entries = activePlan.entries || [];
          const entriesMap: MealPlanEntriesMap = {};
          entries.forEach((entry) => {
            entriesMap[entry.id] = entry;
          });
          
          setEntryMap(entriesMap);
          const groupedByDay = convertEntriesToMealPlanData(entries);
          setMealPlan(groupedByDay);
          saveMealPlanToStorage(weekInfo, groupedByDay);
        }
      } catch (err) {
        console.error('Fejl ved indlæsning:', err);
        setError('Kunne ikke indlæse fra server. Bruger lokal kopi.');
        setMealPlan(loadMealPlanFromStorage(weekInfo));
      } finally {
        setLoading(false);
      }
    };
    loadMealPlan();
  }, [weekInfo.weekNumber, weekInfo.monday.getFullYear()]);

  const addRecipe = useCallback(
    async (day: string, recipe: RecipeSummary) => {
      if (!mealPlanId) return;

      // Optimistic update
      setMealPlan((prev) => {
        const updated = { ...prev, [day]: [...(prev[day] || []), recipe] };
        saveMealPlanToStorage(weekInfo, updated);
        return updated;
      });

      try {
        // RETTET: Tilføjet mealType og servings så det matcher din nye API
        const entry = await mealplanApi.addEntry(mealPlanId, recipe.id, day, "Dinner", 4);
        setEntryMap((prev) => ({ ...prev, [entry.id]: entry }));
      } catch (err) {
        setError('Kunne ikke gemme på serveren.');
        // Rollback
        setMealPlan((prev) => {
          const rolled = { ...prev, [day]: prev[day].filter((r) => r.id !== recipe.id) };
          saveMealPlanToStorage(weekInfo, rolled);
          return rolled;
        });
      }
    },
    [mealPlanId, weekInfo]
  );

  const removeRecipe = useCallback(
    async (day: string, recipeId: string) => {
      setMealPlan((prev) => {
        const updated = { ...prev, [day]: prev[day].filter((r) => r.id !== recipeId) };
        saveMealPlanToStorage(weekInfo, updated);
        return updated;
      });

      const entryId = Object.entries(entryMap).find(
        ([, entry]) => entry.recipeId === recipeId && entry.day === day
      )?.[0];

      if (entryId) {
        try {
          await mealplanApi.removeEntry(mealPlanId!, entryId); // Rettet til at sende to ID'er
          setEntryMap((prev) => {
            const updated = { ...prev };
            delete updated[entryId];
            return updated;
          });
        } catch (err) {
          setError('Kunne ikke fjerne fra serveren.');
        }
      }
    },
    [entryMap, mealPlanId, weekInfo]
  );

  return { mealPlan, availableRecipes, addRecipe, removeRecipe, loading, error, mealPlanId };
}