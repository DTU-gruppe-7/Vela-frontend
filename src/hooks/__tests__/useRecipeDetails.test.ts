import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecipeDetails } from '../useRecipeDetails';

vi.mock('../../api/recipeApi', () => ({
    recipeApi: {
        getRecipeById: vi.fn(),
    },
}));

import { recipeApi } from '../../api/recipeApi';

const mockRecipe = {
    id: 'recipe-1',
    name: 'Test Opskrift',
    category: 'Hovedret',
    thumbnailUrl: '',
    workTime: 'PT30M',
    totalTime: 'PT1H',
    keywordsJson: '[]',
    description: 'En god opskrift',
    servings: 4,
    instructionsJson: '',
    ingredients: [],
};

describe('useRecipeDetails', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(recipeApi.getRecipeById).mockResolvedValue(mockRecipe);
    });

    it('fetches recipe by ID on mount', async () => {
        const { result } = renderHook(() => useRecipeDetails('recipe-1'));

        await waitFor(() => {
            expect(result.current.recipe).toEqual(mockRecipe);
        });

        expect(recipeApi.getRecipeById).toHaveBeenCalledWith('recipe-1');
        expect(result.current.loading).toBe(false);
    });

    it('sets recipe to null when recipeId is null', () => {
        const { result } = renderHook(() => useRecipeDetails(null));

        expect(result.current.recipe).toBeNull();
        expect(recipeApi.getRecipeById).not.toHaveBeenCalled();
    });

    it('uses initialRecipe without fetching', () => {
        const { result } = renderHook(() =>
            useRecipeDetails('recipe-1', { initialRecipe: mockRecipe })
        );

        expect(result.current.recipe).toEqual(mockRecipe);
        expect(result.current.loading).toBe(false);
        expect(recipeApi.getRecipeById).not.toHaveBeenCalled();
    });

    it('sets error on API failure', async () => {
        vi.mocked(recipeApi.getRecipeById).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useRecipeDetails('recipe-1'));

        await waitFor(() => {
            expect(result.current.error).toBe('Kunne ikke hente opskriftsdetaljer.');
        });
    });

    describe('instructions parsing', () => {
        it('parses object format into sections', async () => {
            const recipe = {
                ...mockRecipe,
                instructionsJson: JSON.stringify({
                    'Forberedelse': ['Skær grøntsager', 'Varm ovn'],
                    'Tilberedning': ['Steg i pande', 'Server'],
                }),
            };
            vi.mocked(recipeApi.getRecipeById).mockResolvedValue(recipe);

            const { result } = renderHook(() => useRecipeDetails('recipe-1'));

            await waitFor(() => {
                expect(result.current.instructions).toHaveLength(2);
                expect(result.current.instructions[0].sectionName).toBe('Forberedelse');
                expect(result.current.instructions[0].steps).toEqual(['Skær grøntsager', 'Varm ovn']);
            });
        });

        it('parses array format as single unnamed section', async () => {
            const recipe = {
                ...mockRecipe,
                instructionsJson: JSON.stringify(['Trin 1', 'Trin 2', 'Trin 3']),
            };
            vi.mocked(recipeApi.getRecipeById).mockResolvedValue(recipe);

            const { result } = renderHook(() => useRecipeDetails('recipe-1'));

            await waitFor(() => {
                expect(result.current.instructions).toHaveLength(1);
                expect(result.current.instructions[0].sectionName).toBeNull();
                expect(result.current.instructions[0].steps).toEqual(['Trin 1', 'Trin 2', 'Trin 3']);
            });
        });

        it('handles invalid JSON by falling back to raw string', async () => {
            const recipe = {
                ...mockRecipe,
                instructionsJson: 'This is not valid JSON',
            };
            vi.mocked(recipeApi.getRecipeById).mockResolvedValue(recipe);

            const { result } = renderHook(() => useRecipeDetails('recipe-1'));

            await waitFor(() => {
                expect(result.current.instructions).toHaveLength(1);
                expect(result.current.instructions[0].steps).toEqual(['This is not valid JSON']);
            });
        });

        it('returns empty array when instructionsJson is falsy', async () => {
            const recipe = { ...mockRecipe, instructionsJson: '' };
            vi.mocked(recipeApi.getRecipeById).mockResolvedValue(recipe);

            const { result } = renderHook(() => useRecipeDetails('recipe-1'));

            await waitFor(() => {
                expect(result.current.instructions).toEqual([]);
            });
        });
    });
});
