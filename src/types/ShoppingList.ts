export const IngredientCategory = {
  Other: 0,
  Vegetables: 1,
  Fruits: 2,
  Meat: 3,
  Fish: 4,
  Dairy: 5,
  Eggs: 6,
  Grains: 7,
  Bread: 8,
  Legumes: 9,
  HerbsAndSpices: 10,
  OilsAndFats: 11,
  Condiments: 12,
  NutsAndSeeds: 13,
  Sweeteners: 14,
  Beverages: 15,
  CannedGoods: 16,
} as const;

export type IngredientCategory = (typeof IngredientCategory)[keyof typeof IngredientCategory];

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

export interface AddShoppingListItem {
  ingredientId: string | null;
  ingredientName: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  assignedUserId: string | null;
}

export interface IngredientSearchResult {
  id: string;
  name: string;
  unit: string;
  category: IngredientCategory | string;
}

export interface ShoppingListItem extends AddShoppingListItem {
  id: string;
  price?: string;
  shop?: string;
  recipeName?: string;
  isBought: boolean;
  createdAt: string;
  updatedAt: string;
}
