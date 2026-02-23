import axiosClient from './axiosClient';
import type { Recipe, RecipeSummary } from '../types/Recipe';

export const recipeApi = {
  // Get all recipes (summary only)
  getAllRecipes: async (): Promise<RecipeSummary[]> => {
    const response = await axiosClient.get<RecipeSummary[]>(`/recipe`);
    return response.data;
  },

  // Get a single recipe by ID
  getRecipeById: async (id: string): Promise<Recipe> => {
    const response = await axiosClient.get<Recipe>(`/recipe/${id}`);
    return response.data;
  },

};
