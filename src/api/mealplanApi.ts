import axiosClient from './axiosClient';
import type { MealPlanEntry, MealPlan } from '../types/MealPlan';

export const mealplanApi = {
  // Hent alle madplaner for brugeren (Vi bruger nu det hardcodede endpoint)
  getMealPlans: async (): Promise<MealPlan[]> => { // Bemærk det er en liste []
    try {
      // Ret ruten til at matche din controller: /api/MealPlan
      const response = await axiosClient.get<MealPlan[]>(`/MealPlan`);
      return response.data;
    } catch (error) {
      console.error('Fejl ved hentning af madplaner:', error);
      throw error;
    }
  },

  // Tilføj en opskrift til en madplan
  addEntry: async (
    mealplanId: string,
    recipeId: string,
    day: string,
    mealType: string, // Tilføjet da din backend forventer MealType
    servings: number  // Tilføjet da din backend forventer Servings
  ): Promise<MealPlanEntry> => {
    try {
      // Din backend rute: /api/MealPlan/{mealPlanId}/entries
      const response = await axiosClient.post<MealPlanEntry>(
        `/MealPlan/${mealplanId}/entries`,
        {
          recipeId,
          day,
          mealType,
          servings
        }
      );
      return response.data;
    } catch (error) {
      console.error('Fejl ved tilføjelse af opskrift:', error);
      throw error;
    }
  },

  // Fjern en opskrift
  removeEntry: async (mealPlanId: string, entryId: string): Promise<void> => {
    try {
      // Din backend rute kræver både mealPlanId og entryId
      await axiosClient.delete(`/MealPlan/${mealPlanId}/entries/${entryId}`);
    } catch (error) {
      console.error('Fejl ved fjernelse af opskrift:', error);
      throw error;
    }
  },
};