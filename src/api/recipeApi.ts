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

    getNextRecipes: async (limit = 20, category?: string): Promise<RecipeSummary[]> => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (category && category !== "Alle") params.set("category", category);
      const response = await axiosClient.get<RecipeSummary[]>(`/recipe/next?${params}`);
      return response.data;
    },

    recordSwipe: async ( recipeId: string, direction: 'like' | 'dislike' ): Promise<void> => {
      await axiosClient.post(`/swipe`, { recipeId, direction });
    },

    getLikedRecipes: async (): Promise<RecipeSummary[]> => {
      const response = await axiosClient.get<RecipeSummary[]>(`/swipe/liked`);
      return response.data;
    },

    getCategories : async (): Promise<string[]> => {
      const response = await axiosClient.get<string[]>(`/recipe/categories`);
      return response.data;
    }

  };
