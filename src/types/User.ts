export type Allergen = 
  | 'peanuts'
  | 'tree_nuts'
  | 'milk'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'soy'
  | 'wheat'
  | 'sesame'
  | 'mustard'
  | 'celery'
  | 'lupin'
  | 'mollusks';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  allergens: Allergen[];
  createdAt?: string;
  updatedAt?: string;
}

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  peanuts: 'Jordnødder',
  tree_nuts: 'Nødder (træ)',
  milk: 'Mælk',
  eggs: 'Æg',
  fish: 'Fisk',
  shellfish: 'Skalldyr',
  soy: 'Soja',
  wheat: 'Hvede',
  sesame: 'Sesam',
  mustard: 'Sennep',
  celery: 'Selleri',
  lupin: 'Lupiner',
  mollusks: 'Bløddyr'
};

export const ALL_ALLERGENS: Allergen[] = [
  'peanuts',
  'tree_nuts',
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'soy',
  'wheat',
  'sesame',
  'mustard',
  'celery',
  'lupin',
  'mollusks'
];
