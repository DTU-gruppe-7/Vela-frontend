import { getAllergensFromStorage, isAllergenFilterEnabled } from './allergenStorage';

export interface RecipeWithAllergens {
  id: string;
  name: string;
  allergens?: string[];
  // ... andre recipe-properties
}

/**
 * Filter recipes based on user's allergen settings
 * If allergen filter is enabled, removes recipes that contain user's allergens
 * @param recipes - List of recipes to filter
 * @returns Filtered list of recipes (or original list if filter is disabled)
 */
export function filterRecipesByAllergens<T extends RecipeWithAllergens>(recipes: T[]): T[] {
  const filterEnabled = isAllergenFilterEnabled();
  
  if (!filterEnabled) {
    return recipes;
  }

  const userAllergens = getAllergensFromStorage();
  
  if (userAllergens.length === 0) {
    return recipes;
  }

  return recipes.filter((recipe) => {
    // Hvis opskriften ikke har allergen-info, vis den
    if (!recipe.allergens || recipe.allergens.length === 0) {
      return true;
    }

    // Tjek om opskriften indeholder nogen af brugerens allergier
    const recipeAllergenSet = new Set(recipe.allergens);
    const hasUserAllergen = userAllergens.some((allergen) =>
      recipeAllergenSet.has(allergen)
    );

    // Skjul opskriften hvis den indeholder brugerens allergier
    return !hasUserAllergen;
  });
}

/**
 * Get filtered recipes count
 */
export function getFilteredRecipesCount<T extends RecipeWithAllergens>(recipes: T[]): {
  total: number;
  filtered: number;
  hidden: number;
} {
  const filtered = filterRecipesByAllergens(recipes);
  return {
    total: recipes.length,
    filtered: filtered.length,
    hidden: recipes.length - filtered.length,
  };
}
