import type { RecipeSummary } from './Recipe';

export interface MealPlanDay {
    date: Date;
    dayName: string;
    recipe: RecipeSummary | null;
}

export interface WeekInfo {
    weekNumber: number;
    year: number;
    days: MealPlanDay[];
}
