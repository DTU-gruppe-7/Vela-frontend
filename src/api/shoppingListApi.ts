import axiosClient from './axiosClient';
import type {
  ShoppingList,
  ShoppingListItem,
  AddShoppingListItem
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
  generateShoppingList: async (
      mealPlanId: string
  ): Promise<ShoppingList> => {
    try {
      const response = await axiosClient.post<ShoppingList>(
          `/shoppingList/from-mealplan/${mealPlanId}`
      );
      return response.data;
    } catch (error) {
      console.error('Fejl ved generering af indkøbsliste:', error);
      throw error;
    }
  },
};