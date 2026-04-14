import { IngredientCategory as IngredientCategoryValues } from '../../../types/ShoppingList';
import type { IngredientCategory, ShoppingListItem } from '../../../types/ShoppingList';
import { getIngredientCategoryLabel, normalizeIngredientCategory } from './formOptions';

export interface ItemNameGroup {
  key: string;
  name: string;
  category: IngredientCategory;
  items: ShoppingListItem[];
  totalQuantity: number;
  unitLabel: string;
  allBought: boolean;
  firstSeenIndex: number;
  earliestCreatedAt: number;
}

export interface CategoryGroup {
  category: IngredientCategory;
  label: string;
  groups: ItemNameGroup[];
}

const CATEGORY_ORDER = (Object.values(IngredientCategoryValues) as number[])
  .filter((value, index, values) => Number.isInteger(value) && values.indexOf(value) === index)
  .sort((a, b) => a - b) as IngredientCategory[];

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function parseTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
}

function sortItemsInsideGroup(items: ShoppingListItem[]): ShoppingListItem[] {
  return [...items].sort((a, b) => {
    if (a.isBought !== b.isBought) {
      return Number(a.isBought) - Number(b.isBought);
    }

    const createdAtComparison = parseTimestamp(a.createdAt) - parseTimestamp(b.createdAt);
    if (createdAtComparison !== 0) {
      return createdAtComparison;
    }

    return a.ingredientName.localeCompare(b.ingredientName, 'da');
  });
}

export function groupItemsByCategory(items: ShoppingListItem[]): CategoryGroup[] {
  const groupedByCategory = new Map<IngredientCategory, Map<string, ItemNameGroup>>();

  items.forEach((item, index) => {
    const category = normalizeIngredientCategory(item.category);
    const normalizedName = normalizeName(item.ingredientName);

    if (!groupedByCategory.has(category)) {
      groupedByCategory.set(category, new Map<string, ItemNameGroup>());
    }

    const categoryGroups = groupedByCategory.get(category)!;

    if (!categoryGroups.has(normalizedName)) {
      categoryGroups.set(normalizedName, {
        key: `${category}-${normalizedName}`,
        name: item.ingredientName,
        category,
        items: [],
        totalQuantity: 0,
        unitLabel: '',
        allBought: true,
        firstSeenIndex: index,
        earliestCreatedAt: parseTimestamp(item.createdAt),
      });
    }

    const nameGroup = categoryGroups.get(normalizedName)!;
    nameGroup.items.push(item);
    nameGroup.allBought = nameGroup.allBought && item.isBought;
    nameGroup.earliestCreatedAt = Math.min(nameGroup.earliestCreatedAt, parseTimestamp(item.createdAt));

    if (Number.isFinite(item.quantity) && item.quantity > 0) {
      nameGroup.totalQuantity += item.quantity;
    }
  });

  return CATEGORY_ORDER
    .map((category) => {
      const categoryGroups = groupedByCategory.get(category);
      if (!categoryGroups) {
        return null;
      }

      const groups = Array.from(categoryGroups.values()).map((group) => {
        const unitSet = new Set(
          group.items
            .map((item) => (item.unit ?? '').trim())
            .filter((unit) => unit.length > 0)
            .map((unit) => unit.toLowerCase()),
        );

        return {
          ...group,
          unitLabel: unitSet.size === 1 ? Array.from(unitSet)[0] : '',
          items: sortItemsInsideGroup(group.items),
        };
      });

      groups.sort((a, b) => {
        if (a.allBought !== b.allBought) {
          return Number(a.allBought) - Number(b.allBought);
        }

        const createdAtComparison = a.earliestCreatedAt - b.earliestCreatedAt;
        if (createdAtComparison !== 0) {
          return createdAtComparison;
        }

        return a.firstSeenIndex - b.firstSeenIndex;
      });

      return {
        category,
        label: getIngredientCategoryLabel(category),
        groups,
      } satisfies CategoryGroup;
    })
    .filter((categoryGroup): categoryGroup is CategoryGroup => Boolean(categoryGroup && categoryGroup.groups.length > 0));
}
