export interface ShoppingListSummary {
  id: string;
  name: string;
  userId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList extends ShoppingListSummary {
  items: ShoppingListItem[];
}

export interface ShoppingListCreate {
  name: string;
  groupId?: string;
}

export interface AddShoppingListItem {
  ingredientName: string;
  quantity: number;
  unit?: string;
  assignedUserId?: string;
}

export interface ShoppingListItem extends AddShoppingListItem {
  id: string;
  price?: string;
  shop?: string;
  isBought: boolean;
  createdAt: string;
  updatedAt: string;
}
