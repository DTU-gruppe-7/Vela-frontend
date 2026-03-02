export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  recipeId?: string;
  recipeName?: string;
  addedAt: string;
}

export interface ShoppingList {
  id: string;
  groupId: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

/** Categories used to group shopping items in the UI */
export const ITEM_CATEGORIES = [
  'Frugt & Grønt',
  'Mejeri & Æg',
  'Kød & Fisk',
  'Brød & Bageri',
  'Kolonial',
  'Frost',
  'Drikkevarer',
  'Krydderier & Olie',
  'Andet',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
