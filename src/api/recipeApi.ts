  import axiosClient from './axiosClient';
  import type { Recipe, RecipeSummary } from '../types/Recipe';

  const serializeExclude = (exclude?: string[]): string | undefined => {
    if (!exclude || exclude.length === 0) return undefined;

    const normalized = Array.from(
      new Set(
        exclude
          .map((item) => item.trim().toLowerCase())
          .filter((item) => item.length > 0),
      ),
    );

    return normalized.length > 0 ? normalized.join(',') : undefined;
  };

  const buildQuery = (params: Record<string, string | number | undefined>): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    return searchParams.toString();
  };

  interface GetRecipesOptions {
    exclude?: string[];
  }

  interface GetNextRecipesOptions {
    limit?: number;
    category?: string;
    exclude?: string[];
  }

  interface GetMostLikedRecipesOptions {
    limit?: number;
    exclude?: string[];
  }

  export const recipeApi = {
    // Get all recipes (summary only)
      getAllRecipes: async (options: GetRecipesOptions = {}): Promise<RecipeSummary[]> => {
        const query = buildQuery({
          exclude: serializeExclude(options.exclude),
        });
        const endpoint = query ? `/recipe?${query}` : '/recipe';
        const response = await axiosClient.get<RecipeSummary[]>(endpoint);
        return response.data;
    },

    // Get a single recipe by ID
    getRecipeById: async (id: string): Promise<Recipe> => {
      const response = await axiosClient.get<Recipe>(`/recipe/${id}`);
      return response.data;
    },

    getNextRecipes: async ({ limit = 20, category, exclude }: GetNextRecipesOptions = {}): Promise<RecipeSummary[]> => {
      const query = buildQuery({
        limit,
        category: category && category !== 'Alle' ? category : undefined,
        exclude: serializeExclude(exclude),
      });
      const endpoint = query ? `/recipe/next?${query}` : '/recipe/next';
      const response = await axiosClient.get<RecipeSummary[]>(endpoint);
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
    },

    getMostLikedRecipes: async ({ limit = 20, exclude }: GetMostLikedRecipesOptions = {}): Promise<RecipeSummary[]> => {
      const query = buildQuery({
        limit,
        exclude: serializeExclude(exclude),
      });
      const endpoint = query ? '/recipe/most-liked?' + query : '/recipe/most-liked';
      const response = await axiosClient.get<RecipeSummary[]>(endpoint)
      return response.data;
    }
  };
