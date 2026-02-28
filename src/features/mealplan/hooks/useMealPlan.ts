import { useState, useEffect } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { DAYS } from '../../../utils/weekUtils';

type MealPlanData = { [key: string]: RecipeSummary[] };

const EMPTY_MEAL_PLAN: MealPlanData = Object.fromEntries(DAYS.map((d) => [d, []]));

export function useMealPlan(fetchRecipes: () => Promise<RecipeSummary[]>) {
  const [mealPlan, setMealPlan] = useState<MealPlanData>(EMPTY_MEAL_PLAN);
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSummary[]>([]);

  useEffect(() => {
    fetchRecipes().then(setAvailableRecipes).catch(console.error);
  }, []);

  const addRecipe = (day: string, recipe: RecipeSummary) =>
    setMealPlan((prev) => ({ ...prev, [day]: [...prev[day], recipe] }));

  const removeRecipe = (day: string, recipeId: string) =>
    setMealPlan((prev) => ({ ...prev, [day]: prev[day].filter((r) => r.id !== recipeId) }));

  return { mealPlan, availableRecipes, addRecipe, removeRecipe };
}
