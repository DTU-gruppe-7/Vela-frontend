import { useState, useEffect, useCallback } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { DAYS, type WeekInfo } from '../../../utils/weekUtils';
import { mealplanApi, type MealPlanEntry, type MealPlanDto } from '../../../api/mealplanApi';

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
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Fejl ved indlæsning af madplan fra localStorage:', error);
  }
  return EMPTY_MEAL_PLAN;
}

function saveMealPlanToStorage(weekInfo: WeekInfo, mealPlan: MealPlanData): void {
  const key = getStorageKey(weekInfo);
  try {
    localStorage.setItem(key, JSON.stringify(mealPlan));
  } catch (error) {
    console.error('Fejl ved gemning af madplan til localStorage:', error);
  }
}

function convertEntriesToMealPlanData(entries: MealPlanEntry[]): MealPlanData {
  const mealPlan: MealPlanData = { ...EMPTY_MEAL_PLAN };
  
  entries.forEach((entry) => {
    if (entry.recipe && entry.day) {
      if (!mealPlan[entry.day]) {
        mealPlan[entry.day] = [];
      }
      // Undgå duplikater
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

  // Load available recipes once
  useEffect(() => {
    fetchRecipes()
      .then(setAvailableRecipes)
      .catch((err) => {
        console.error('Fejl ved hentning af tilgængelige opskrifter:', err);
        setError('Kunne ikke hente opskrifter');
      });
  }, [fetchRecipes]);

  // Load meal plan from backend
  useEffect(() => {
    const loadMealPlan = async () => {
      setLoading(true);
      setError(null);

      try {
        // Hent madplanen fra backend
        const mealPlanData: MealPlanDto = await mealplanApi.getMealPlan();
        
        if (!mealPlanData?.id) {
          throw new Error('Ingen madplan ID fra server');
        }

        setMealPlanId(mealPlanData.id);

        // Konverter backend entries til UI-format
        const entries = mealPlanData.entries || [];
        const entriesMap: MealPlanEntriesMap = {};
        entries.forEach((entry) => {
          entriesMap[entry.id] = entry;
        });
        
        setEntryMap(entriesMap);
        
        // Konverter til grupperet efter dag format
        const groupedByDay = convertEntriesToMealPlanData(entries);
        setMealPlan(groupedByDay);
        saveMealPlanToStorage(weekInfo, groupedByDay);
      } catch (err) {
        console.error('Fejl ved indlæsning af madplan fra server:', err);
        setError('Kunne ikke indlæse madplan fra server.');
        
        // Fallback til localStorage
        const cached = loadMealPlanFromStorage(weekInfo);
        setMealPlan(cached);
      } finally {
        setLoading(false);
      }
    };

    loadMealPlan();
  }, [weekInfo.weekNumber, weekInfo.monday.getFullYear()]);

  const addRecipe = useCallback(
    async (day: string, recipe: RecipeSummary) => {
      if (!mealPlanId) {
        setError('Madplan ID ikke tilgængelig');
        return;
      }

      // Optimistic update - opdater lokal state med det samme
      setMealPlan((prev) => {
        const updated = { ...prev };
        if (!updated[day]) {
          updated[day] = [];
        }
        // Undgå duplikater
        if (!updated[day].some((r) => r.id === recipe.id)) {
          updated[day] = [...updated[day], recipe];
        }
        saveMealPlanToStorage(weekInfo, updated);
        return updated;
      });

      // Gem til backend
      try {
        const entry = await mealplanApi.addEntry(mealPlanId, recipe.id, day);
        setEntryMap((prev) => ({ ...prev, [entry.id]: entry }));
      } catch (err) {
        console.error('Fejl ved tilføjelse af opskrift til server:', err);
        setError('Kunne ikke gemme opskriften på serveren. Det er gemt lokalt.');
        
        // Rollback local state and localStorage if backend fails
        setMealPlan((prev) => {
          const rolled = {
            ...prev,
            [day]: prev[day].filter((r) => r.id !== recipe.id),
          };
          saveMealPlanToStorage(weekInfo, rolled);
          return rolled;
        });
      }
    },
    [mealPlanId, weekInfo]
  );

  const removeRecipe = useCallback(
    async (day: string, recipeId: string) => {
      // Optimistic update - fjern fra lokal state med det samme
      setMealPlan((prev) => {
        const updated = { ...prev };
        updated[day] = updated[day].filter((r) => r.id !== recipeId);
        saveMealPlanToStorage(weekInfo, updated);
        return updated;
      });

      // Find entry ID for this recipe
      const entryId = Object.entries(entryMap).find(
        ([, entry]) => entry.recipeId === recipeId && entry.day === day
      )?.[0];

      if (entryId) {
        try {
          await mealplanApi.removeEntry(entryId);
          setEntryMap((prev) => {
            const updated = { ...prev };
            delete updated[entryId];
            return updated;
          });
        } catch (err) {
          console.error('Fejl ved fjernelse af opskrift fra server:', err);
          setError('Kunne ikke fjerne opskriften fra serveren.');
          
          // Rollback - læg opskriften tilbage og opdater localStorage hvis sletningen fejlede
          const recipe = availableRecipes.find((r) => r.id === recipeId);
          if (recipe) {
            setMealPlan((prev) => {
              const rolled = {
                ...prev,
                [day]: [...prev[day], recipe],
              };
              saveMealPlanToStorage(weekInfo, rolled);
              return rolled;
            });
          }
        }
      }
    },
    [entryMap, weekInfo, availableRecipes]
  );

  return {
    mealPlan,
    availableRecipes,
    addRecipe,
    removeRecipe,
    loading,
    error,
    mealPlanId,
  };
}
