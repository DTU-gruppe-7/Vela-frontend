import axiosClient from './axiosClient';
import axios from 'axios';
import type {
  ShoppingList,
  ShoppingListItem,
  AddShoppingListItem,
  IngredientSearchResult,
} from '../types/ShoppingList';

export const shoppingListApi = {
  /**
   * Hent indkøbsliste. Hvis groupId er angivet, hentes gruppens, ellers den personlige.
   */
  getShoppingList: async (groupId?: string): Promise<ShoppingList> => {
    const url = groupId ? `/shoppingList?groupId=${groupId}` : '/shoppingList';
    const response = await axiosClient.get<ShoppingList>(url);
    return response.data;
  },

  /** Search ingredients for autocomplete */
  searchIngredients: async (
    query: string,
    limit = 10,
  ): Promise<IngredientSearchResult[]> => {
    const response = await axiosClient.get<IngredientSearchResult[]>(
      '/Ingredients/search',
      {
        params: {
          query,
          limit,
        },
      },
    );
    return response.data;
  },

  /** Add a new item to the shoppingList list */
  addItem: async (
    id: string,
    item: AddShoppingListItem
  ): Promise<ShoppingListItem> => {
    const response = await axiosClient.post<ShoppingListItem>(
        `/shoppingList/${id}/items`,
      item,
    );
    return response.data;
  },

  updateItem: async (
    id: string,
    itemId: string,
    item: ShoppingListItem,
  ): Promise<void> => {
    await axiosClient.put(
      `/shoppingList/${id}/items/${itemId}`,
      item,
    );
  },

  /** Remove a single item */
  removeItem: async (id: string, itemId: string): Promise<void> => {
    await axiosClient.delete(
      `/shoppingList/${id}/items/${itemId}`,
    );
  },

  /** Generér indkøbsliste fra en madplan */
  generateShoppingList: async ({
      shoppingListId,
      mealPlanId,
      startDate,
      endDate,
      excludedMealPlanEntryIds = [],
  }: {
    shoppingListId: string;
    mealPlanId: string;
    startDate: string;
    endDate: string;
    excludedMealPlanEntryIds: string[];
}): Promise<ShoppingList> => {
    try {
      const response = await axiosClient.post<ShoppingList>(
          `/shoppingList/${shoppingListId}/from-mealplan/${mealPlanId}`,
          { excludedMealPlanEntryIds },
          {
            params: { startDate, endDate },
          }
      );
      return response.data;
    } catch (error) {
      console.error('Fejl ved generering af indkøbsliste:', error);
      throw error;
    }
  },

  /** Fjern varer tilføjet fra en madplan fra indkøbslisten */
  removeFromMealPlan: async (
    shoppingListId: string,
    mealPlanId: string,
    mealPlanEntryId: string
  ): Promise<void> => {
    try {
      await axiosClient.delete(`/shoppingList/${shoppingListId}/from-mealplan/${mealPlanId}`,
          {
            params: mealPlanEntryId ? { mealPlanEntryId } : undefined,
          }
        );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const backendMessage =
          typeof errorData === 'string'
            ? errorData
            : typeof errorData?.detail === 'string'
              ? errorData.detail
              : typeof errorData?.title === 'string'
                ? errorData.title
            : undefined;
        throw new Error(backendMessage || `REMOVE_FROM_MEALPLAN_FAILED:${error.response?.status ?? 'unknown'}`);
      }
      throw error;
    }
  },
};