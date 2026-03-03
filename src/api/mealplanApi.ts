import axiosClient from './axiosClient';
import type { RecipeSummary } from '../types/Recipe';

export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId: string;
  day: string; // 'Mandag', 'Tirsdag', osv.
  addedAt: string;
  notes?: string;
  recipe?: RecipeSummary;
}

export interface MealPlanDto {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  entries: MealPlanEntry[];
}

export const mealplanApi = {
  // Get current user's meal plan
  getMealPlan: async (): Promise<MealPlanDto> => {
    try {
      const response = await axiosClient.get<MealPlanDto>(`/mealplan/current`);
      return response.data;
    } catch (error) {
      console.error('Fejl ved hentning af madplan:', error);
      throw error;
    }
  },

  // Add a recipe entry to a specific meal plan
  addEntry: async (
    mealplanId: string,
    recipeId: string,
    day: string,
    notes?: string
  ): Promise<MealPlanEntry> => {
    try {
      const response = await axiosClient.post<MealPlanEntry>(
        `/mealplan/${mealplanId}/entries`,
        {
          recipeId,
          day,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Fejl ved tilføjelse af opskrift:', error);
      throw error;
    }
  },

  // Remove a recipe entry from current user's meal plan
  removeEntry: async (entryId: string): Promise<void> => {
    try {
      await axiosClient.delete(`/mealplan/entries/${entryId}`);
    } catch (error) {
      console.error('Fejl ved fjernelse af opskrift:', error);
      throw error;
    }
  },

  // Update week's meal plan (optional - for batch updates)
  updateWeekPlan: async (
    mealplanId: string,
    entries: Omit<MealPlanEntry, 'id' | 'addedAt'>[]
  ): Promise<MealPlanDto> => {
    try {
      const response = await axiosClient.put<MealPlanDto>(
        `/mealplan/${mealplanId}`,
        { entries }
      );
      return response.data;
    } catch (error) {
      console.error('Fejl ved opdatering af madplan:', error);
      throw error;
    }
  },
};
