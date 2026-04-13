import axios from 'axios';
import axiosClient from './axiosClient';
import type { MealPlanEntry, MealPlan } from '../types/MealPlan';

interface GetMealPlanParams {
  groupId?: string;
  startDate?: string;
  endDate?: string;
}

export const mealplanApi = {
  // Hent alle madplaner for brugeren
  getMealPlan: async (params?: GetMealPlanParams): Promise<MealPlan | null> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.groupId) {
        queryParams.append('groupId', params.groupId);
      }
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/MealPlan?${queryString}` : '/MealPlan';

      const response = await axiosClient.get<MealPlan>(url);
      return response.data ?? null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
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
      await axiosClient.put(`/MealPlan/${mealplanId}/entries/${entryId}`, { servings });
    } catch (error) {
      console.error('Fejl ved opdatering af antal personer:', error);
      throw error;
    }
  }
  
};