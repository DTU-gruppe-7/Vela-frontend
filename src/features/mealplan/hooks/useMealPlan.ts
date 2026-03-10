import { useState, useEffect, useCallback, useRef } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { DAYS, type WeekInfo } from '../../../utils/weekUtils';
import { mealplanApi} from '../../../api/mealplanApi';
import type { MealPlan, MealPlanEntry } from '../../../types/MealPlan';

type MealPlanData = { [key: string]: RecipeSummary[] };
type MealPlanEntriesMap = { [entryId: string]: MealPlanEntry };

// RETTELSE: Nu er det en funktion, der returnerer friske, tomme arrays hver gang!
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
  // Henter en helt ren, jomfruelig madplan
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
  // Bruger funktionen til at sætte start-statet
  const [mealPlan, setMealPlan] = useState<MealPlanData>(getEmptyMealPlan());
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [entryMap, setEntryMap] = useState<MealPlanEntriesMap>({});
  const creatingPlanRef = useRef(false);

  // A. Hent alle tilgængelige opskrifter (til modallen)
  useEffect(() => {
    fetchRecipes()
      .then(setAvailableRecipes)
      .catch(err => {
        console.error('Fejl ved hentning af opskrifter:', err);
        setError('Kunne ikke hente opskrifter');
      });
  }, [fetchRecipes]);

  // B. Hent selve madplanen - KUN afhængig af ugenummer for at undgå loop
  useEffect(() => {
    const loadMealPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        let plans = await mealplanApi.getMealPlans();
        
        // Hvis brugeren ikke har en madplan, opret en automatisk (men kun én gang)
        if ((!plans || plans.length === 0) && !creatingPlanRef.current) {
          creatingPlanRef.current = true;
          console.log('Ingen madplan fundet - opretter en ny...');
          const newPlan = await mealplanApi.createMealPlan();
          plans = [newPlan];
        }

        if (plans && plans.length > 0) {
          const activePlan = plans[0];
          setMealPlanId(activePlan.id);

          const entries = activePlan.entries || [];
          const entriesMap: MealPlanEntriesMap = {};
          entries.forEach((entry) => {
            entriesMap[entry.id] = entry;
          });
          
          setEntryMap(entriesMap);
          const groupedByDay = convertEntriesToMealPlanData(entries, weekInfo);
          setMealPlan(groupedByDay);
        }
      } catch (err) {
        console.error('Fejl ved indlæsning:', err);
        setError('Kunne ikke indlæse fra server.');
        creatingPlanRef.current = false; // Reset ved fejl så den kan prøve igen
      } finally {
        setLoading(false);
      }
    };

    loadMealPlan();
  }, [weekInfo.weekNumber]); 

  const addRecipe = useCallback(
    async (day: string, recipe: RecipeSummary) => {
      if (!mealPlanId) return;

      const targetDate = getDateStringForDay(day, weekInfo);

      // Optimistic update
      setMealPlan((prev) => ({
        ...prev,
        [day]: [...(prev[day] || []), recipe]
      }));

      try {
        const entry = await mealplanApi.addEntry(mealPlanId, recipe.id, targetDate, "Dinner", 4);
        setEntryMap((prev) => ({ ...prev, [entry.id]: entry }));
      } catch (err) {
        setError('Kunne ikke gemme på serveren.');
        setMealPlan((prev) => ({
          ...prev,
          [day]: prev[day].filter((r) => r.id !== recipe.id)
        }));
      }
    },
    [mealPlanId, weekInfo.weekNumber] // Stabil dependency
  );

  const removeRecipe = useCallback(
    async (day: string, recipeId: string) => {
      const targetDate = getDateStringForDay(day, weekInfo);
      
      const entryId = Object.entries(entryMap).find(
        ([, entry]) => entry.recipeId === recipeId && entry.date?.startsWith(targetDate)
      )?.[0];

      if (entryId) {
        setMealPlan((prev) => ({
          ...prev,
          [day]: prev[day].filter((r) => r.id !== recipeId)
        }));

        try {
          await mealplanApi.removeEntry(mealPlanId!, entryId);
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
    [entryMap, mealPlanId, weekInfo.weekNumber] // Stabil dependency
  );

  return { mealPlan, availableRecipes, addRecipe, removeRecipe, loading, error, mealPlanId };
}