import type { IngredientSearchResult, IngredientCategory } from '../../../types/ShoppingList';
import { IngredientCategory as IngredientCategoryValues } from '../../../types/ShoppingList';

export const INGREDIENT_SEARCH_LIMIT = 8;
export const INGREDIENT_SEARCH_DEBOUNCE_MS = 250;
export const STACKED_LAYOUT_MEDIA_QUERY = '(max-width: 1023px)';

export const INGREDIENT_CATEGORY_OPTIONS = [
  { value: IngredientCategoryValues.Other, label: 'Andet' },
  { value: IngredientCategoryValues.Vegetables, label: 'Grøntsager' },
  { value: IngredientCategoryValues.Fruits, label: 'Frugt' },
  { value: IngredientCategoryValues.Meat, label: 'Kød' },
  { value: IngredientCategoryValues.Fish, label: 'Fisk' },
  { value: IngredientCategoryValues.Dairy, label: 'Mejeri' },
  { value: IngredientCategoryValues.Eggs, label: 'Æg' },
  { value: IngredientCategoryValues.Grains, label: 'Korn og gryn' },
  { value: IngredientCategoryValues.Bread, label: 'Brød' },
  { value: IngredientCategoryValues.Legumes, label: 'Bælgfrugter' },
  { value: IngredientCategoryValues.HerbsAndSpices, label: 'Urter og krydderier' },
  { value: IngredientCategoryValues.OilsAndFats, label: 'Olier og fedt' },
  { value: IngredientCategoryValues.Condiments, label: 'Krydderier og smagsgivere' },
  { value: IngredientCategoryValues.NutsAndSeeds, label: 'Nødder og frø' },
  { value: IngredientCategoryValues.Sweeteners, label: 'Sødemidler' },
  { value: IngredientCategoryValues.Beverages, label: 'Drikkevarer' },
  { value: IngredientCategoryValues.CannedGoods, label: 'Konserves' },
] as const;

const INGREDIENT_CATEGORY_LOOKUP: Record<string, IngredientCategory> = {
  other: IngredientCategoryValues.Other,
  vegetables: IngredientCategoryValues.Vegetables,
  vegetable: IngredientCategoryValues.Vegetables,
  fruits: IngredientCategoryValues.Fruits,
  fruit: IngredientCategoryValues.Fruits,
  meat: IngredientCategoryValues.Meat,
  fish: IngredientCategoryValues.Fish,
  dairy: IngredientCategoryValues.Dairy,
  eggs: IngredientCategoryValues.Eggs,
  egg: IngredientCategoryValues.Eggs,
  grains: IngredientCategoryValues.Grains,
  grain: IngredientCategoryValues.Grains,
  bread: IngredientCategoryValues.Bread,
  legumes: IngredientCategoryValues.Legumes,
  legume: IngredientCategoryValues.Legumes,
  herbsandspices: IngredientCategoryValues.HerbsAndSpices,
  herbs_and_spices: IngredientCategoryValues.HerbsAndSpices,
  oilsandfats: IngredientCategoryValues.OilsAndFats,
  oils_and_fats: IngredientCategoryValues.OilsAndFats,
  condiments: IngredientCategoryValues.Condiments,
  nutsandseeds: IngredientCategoryValues.NutsAndSeeds,
  nuts_and_seeds: IngredientCategoryValues.NutsAndSeeds,
  sweeteners: IngredientCategoryValues.Sweeteners,
  beverages: IngredientCategoryValues.Beverages,
  cannedgoods: IngredientCategoryValues.CannedGoods,
  canned_goods: IngredientCategoryValues.CannedGoods,
};

export const UNIT_OPTIONS = [
  { value: '', label: 'Ingen enhed' },
  { value: 'stk', label: 'stk' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'dl', label: 'dl' },
  { value: 'l', label: 'l' },
] as const;

const SUPPORTED_UNITS = new Set<string>(['stk', 'g', 'kg', 'ml', 'dl', 'l']);

export function getIngredientCategoryLabel(category: IngredientCategory): string {
  return INGREDIENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? 'Andet';
}

export function normalizeIngredientCategory(
  category: IngredientSearchResult['category'] | null | undefined,
): IngredientCategory {
  if (category === null || category === undefined) {
    return IngredientCategoryValues.Other;
  }

  if (typeof category === 'number') {
    return (Object.values(IngredientCategoryValues) as number[]).includes(category)
      ? (category as IngredientCategory)
      : IngredientCategoryValues.Other;
  }

  const trimmed = category.trim();
  if (!trimmed) {
    return IngredientCategoryValues.Other;
  }

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9_]+/g, '');
  return INGREDIENT_CATEGORY_LOOKUP[normalized] ?? IngredientCategoryValues.Other;
}

export function mapBackendUnitToFormUnit(unit: string | null | undefined): string {
  const normalized = (unit ?? '').trim().toLowerCase();

  if (!normalized) return '';
  if (normalized === 'ml') return 'dl';

  return SUPPORTED_UNITS.has(normalized) ? normalized : '';
}
