import type { RecipeSummary } from './Recipe';

export interface MealPlanEntry {
  id: string;
  recipeId: string;
  recipe?: RecipeSummary; // Backenden sender typisk hele opskriften med tilbage
  date: string;           // VIGTIGT: Dette er nu 'date' (ISO-streng fra C#) i stedet for 'day'
  mealType: string;       // f.eks. "Dinner"
  servings: number;       // f.eks. 4
}

export interface MealPlan {
  id: string;
  name?: string;
  userId?: string;
  groupId?: string;
  entries: MealPlanEntry[];
}