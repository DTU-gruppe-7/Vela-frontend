import axiosClient from './axiosClient';
import type {
  ShoppingList,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingListCreate,
  AddShoppingListItem
} from '../types/ShoppingList';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  errorMessage: string | null;
}
export const shoppingListApi = {
  /** Fetch the shoppingList list for a given group */
  getAllShoppingLists: async (): Promise<ShoppingListSummary[]> => {
    const response = await axiosClient.get<ShoppingListSummary[]>(
        `/shoppingList/`,
    );
    return response.data;
  },

  getShoppingList: async (id: string): Promise<ShoppingList> => {
    const response = await axiosClient.get<ApiResponse<ShoppingList>>(
        `/shoppingList/${id}`,
    );
    return response.data.data;
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
