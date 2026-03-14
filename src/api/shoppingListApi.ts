import axiosClient from './axiosClient';
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListCreate,
  AddShoppingListItem
} from '../types/ShoppingList';

export const shoppingListApi = {
  /** Fetch the personal shopping list (no groupId) */
  getPersonalShoppingList: async (): Promise<ShoppingList> => {
    const response = await axiosClient.get<ShoppingList>(`/shoppingList`);
    return response.data;
  },

  /** Fetch the shopping list for a specific group */
  getGroupShoppingList: async (groupId: string): Promise<ShoppingList> => {
    const response = await axiosClient.get<ShoppingList>(
        `/shoppingList`,
        { params: { groupId } },
    );
    return response.data;
  },

  getShoppingList: async (id: string): Promise<ShoppingList> => {
    const response = await axiosClient.get<ShoppingList>(
        `/shoppingList/${id}`,
    );
    return response.data;
  },

  createShoppingList: async(data: ShoppingListCreate): Promise<ShoppingList> => {
    const response = await axiosClient.post<ShoppingList>(
        `/shoppingList`,
        data,
    );
    return response.data;
  },

  deleteShoppingList: async (id: string): Promise<void> => {
    await axiosClient.delete(
        `/shoppingList/${id}`
    )
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
      mealPlanId: string,
      existingListId?: string,
      groupId?: string
  ): Promise<ShoppingList> => {
    try {
      const params: Record<string, string> = {};
      if (existingListId) params.existingListId = existingListId;
      if (groupId) params.groupId = groupId;

      const response = await axiosClient.post<ShoppingList>(
          `/shoppingList/from-mealplan/${mealPlanId}`,
          null,
          { params }
      );
      return response.data;
    } catch (error) {
      console.error('Fejl ved generering af indkøbsliste:', error);
      throw error;
    }
  },
};
