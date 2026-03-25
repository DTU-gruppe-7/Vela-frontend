import axiosClient from './axiosClient';
import type { ShoppingListItem, ShoppingList } from '../types/ShoppingList';

export const shoppingApi = {
  /** Fetch the shopping list for a given group */
  getShoppingList: async (groupId: string): Promise<ShoppingList> => {
    const response = await axiosClient.get<ShoppingList>(
      `/groups/${groupId}/shoppinglist`,
    );
    return response.data;
  },

  /** Add a new item to the shopping list */
  addItem: async (
    groupId: string,
    item: Omit<ShoppingListItem, 'id' | 'checked' | 'addedAt'>,
  ): Promise<ShoppingListItem> => {
    const response = await axiosClient.post<ShoppingListItem>(
      `/groups/${groupId}/shoppinglist/items`,
      item,
    );
    return response.data;
  },

  /** Toggle the checked state of an item */
  toggleItem: async (
    groupId: string,
    itemId: string,
    checked: boolean,
  ): Promise<void> => {
    await axiosClient.patch(
      `/groups/${groupId}/shoppinglist/items/${itemId}`,
      { checked },
    );
  },

  /** Remove a single item */
  removeItem: async (groupId: string, itemId: string): Promise<void> => {
    await axiosClient.delete(
      `/groups/${groupId}/shoppinglist/items/${itemId}`,
    );
  },

  /** Clear all checked items */
  clearChecked: async (groupId: string): Promise<void> => {
    await axiosClient.delete(
      `/groups/${groupId}/shoppinglist/checked`,
    );
  },
};
