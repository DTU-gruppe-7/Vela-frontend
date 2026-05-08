import { describe, it, expect, beforeEach, vi } from 'vitest';
import { filterRecipesByAllergens, getFilteredRecipesCount } from '../recipeFilter';

// Mock allergenStorage module
vi.mock('../allergenStorage', () => ({
    getAllergensFromStorage: vi.fn(() => []),
    isAllergenFilterEnabled: vi.fn(() => false),
}));

import { getAllergensFromStorage, isAllergenFilterEnabled } from '../allergenStorage';

const mockRecipes = [
    { id: '1', name: 'Pasta Carbonara', allergens: ['wheat', 'milk', 'eggs'] },
    { id: '2', name: 'Grøntsagssuppe', allergens: [] },
    { id: '3', name: 'Fisketaco', allergens: ['wheat', 'fish'] },
    { id: '4', name: 'Frugt Salat', allergens: undefined },
    { id: '5', name: 'Pandekager', allergens: ['wheat', 'milk'] },
];

describe('filterRecipesByAllergens', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns all recipes when filter is disabled', () => {
        vi.mocked(isAllergenFilterEnabled).mockReturnValue(false);

        const result = filterRecipesByAllergens(mockRecipes);
        expect(result).toHaveLength(5);
    });

    it('returns all recipes when filter is enabled but no allergens set', () => {
        vi.mocked(isAllergenFilterEnabled).mockReturnValue(true);
        vi.mocked(getAllergensFromStorage).mockReturnValue([]);

        const result = filterRecipesByAllergens(mockRecipes);
        expect(result).toHaveLength(5);
    });

    it('filters out recipes with matching allergens', () => {
        vi.mocked(isAllergenFilterEnabled).mockReturnValue(true);
        vi.mocked(getAllergensFromStorage).mockReturnValue(['fish']);

        const result = filterRecipesByAllergens(mockRecipes);
        expect(result).toHaveLength(4);
        expect(result.find(r => r.id === '3')).toBeUndefined();
    });

    it('keeps recipes without allergen data (safe default)', () => {
        vi.mocked(isAllergenFilterEnabled).mockReturnValue(true);
        vi.mocked(getAllergensFromStorage).mockReturnValue(['wheat']);

        const result = filterRecipesByAllergens(mockRecipes);
        // Recipes 1,3,5 have wheat → filtered out. Recipes 2,4 remain.
        expect(result).toHaveLength(2);
        expect(result.map(r => r.id)).toEqual(['2', '4']);
    });

    it('filters out recipe on any single allergen match', () => {
        vi.mocked(isAllergenFilterEnabled).mockReturnValue(true);
        vi.mocked(getAllergensFromStorage).mockReturnValue(['eggs', 'fish']);

        const result = filterRecipesByAllergens(mockRecipes);
        // Recipe 1 has eggs, Recipe 3 has fish → both filtered
        expect(result).toHaveLength(3);
        expect(result.map(r => r.id)).toEqual(['2', '4', '5']);
    });
});

describe('getFilteredRecipesCount', () => {
    it('returns correct counts', () => {
        vi.mocked(isAllergenFilterEnabled).mockReturnValue(true);
        vi.mocked(getAllergensFromStorage).mockReturnValue(['wheat']);

        const result = getFilteredRecipesCount(mockRecipes);
        expect(result.total).toBe(5);
        expect(result.filtered).toBe(2);
        expect(result.hidden).toBe(3);
    });
});
