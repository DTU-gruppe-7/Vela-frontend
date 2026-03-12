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

  // Opret en ny madplan for brugeren
  createMealPlan: async (): Promise<MealPlan> => {
    try {
      const response = await axiosClient.post<MealPlan>(`/MealPlan`, {
        name: 'Min madplan'
      });
      return response.data;
    } catch (error) {
      console.error('Fejl ved oprettelse af madplan:', error);
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
      
      return response.data;
    } catch (error) {
      console.error('Fejl ved tilføjelse af opskrift:', error);
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

  updateEntryServings: async (
    mealplanId: string,
    entryId: string,
    servings: number
  ): Promise<void> => {
    try {
      // TODO: Erstat med ægte kald, når backend endpoint findes, f.eks.:
      // await axiosClient.put(`/MealPlan/${mealplanId}/entries/${entryId}`, { servings });
      
      // Vi returnerer instant success for at frontend state-opdatering virker
      console.log(`STUB: Opdaterede entry ${entryId} til ${servings} personer i madplan ${mealplanId}`);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulerer netværksforsinkelse
    } catch (error) {
      console.error('Fejl ved opdatering af antal personer:', error);
      throw error;
    }
  }
};