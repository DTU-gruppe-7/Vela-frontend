import axiosClient from './axiosClient';
import type { MealPlanEntry, MealPlan } from '../types/MealPlan';

export const mealplanApi = {
  // Hent alle madplaner for brugeren
  getMealPlans: async (): Promise<MealPlan[]> => { 
    try {
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
    date: string,     // Modtager datoen (f.eks. 2026-03-10)
    mealType: string, 
    servings: number  
  ): Promise<MealPlanEntry> => {
    // --- DEBUG LOG START ---
    console.log("🚀 API KALD: addEntry blev kaldt med:", {
      mealplanId,
      recipeId,
      date,
      mealType,
      servings
    });
    // --- DEBUG LOG SLUT ---

    try {
      const response = await axiosClient.post<MealPlanEntry>(
        `/MealPlan/${mealplanId}/entries`,
        {
          recipeId,   // Sender recipeId
          date,       // SENDER DATE (MATCHES C# DTO)
          mealType,   // Sender "Dinner"
          servings    // Sender 4
        }
      );
      
      console.log("✅ API SUCCESS:", response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API FEJL ved tilføjelse:', error);
      throw error;
    }
  },

  // Fjern en opskrift
  removeEntry: async (mealPlanId: string, entryId: string): Promise<void> => {
    try {
      await axiosClient.delete(`/MealPlan/${mealPlanId}/entries/${entryId}`);
    } catch (error) {
      console.error('Fejl ved fjernelse af opskrift:', error);
      throw error;
    }
  },
};