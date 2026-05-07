import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecipeQueue } from '../useRecipeQueue';

// Mock the recipeApi module
vi.mock('../../api/recipeApi', () => ({
    recipeApi: {
        getNextRecipes: vi.fn(),
        recordSwipe: vi.fn(),
    },
}));

import { recipeApi } from '../../api/recipeApi';

const mockRecipes = Array.from({ length: 20 }, (_, i) => ({
    id: `recipe-${i}`,
    name: `Recipe ${i}`,
    category: 'Hovedret',
    thumbnailUrl: '',
    workTime: 'PT30M',
    totalTime: 'PT1H',
    keywordsJson: '[]',
}));

describe('useRecipeQueue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(recipeApi.getNextRecipes).mockResolvedValue(mockRecipes);
        vi.mocked(recipeApi.recordSwipe).mockResolvedValue(undefined);
    });

    it('fetches initial batch on mount', async () => {
        const { result } = renderHook(() => useRecipeQueue());

        await waitFor(() => {
            expect(result.current.queue).toHaveLength(20);
        });

        expect(recipeApi.getNextRecipes).toHaveBeenCalledWith({
            limit: 20,
            category: undefined,
        });
    });

    it('isLoading is true while queue is empty and loading', () => {
        // Delay the API response
        vi.mocked(recipeApi.getNextRecipes).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useRecipeQueue());
        expect(result.current.isLoading).toBe(true);
    });

    it('swipe removes recipe from queue immediately', async () => {
        const { result } = renderHook(() => useRecipeQueue());

        await waitFor(() => {
            expect(result.current.queue).toHaveLength(20);
        });

        act(() => {
            result.current.swipe('recipe-0', 'like');
        });

        expect(result.current.queue).toHaveLength(19);
        expect(result.current.queue.find(r => r.id === 'recipe-0')).toBeUndefined();
    });

    it('swipe calls recordSwipe API in the background', async () => {
        const { result } = renderHook(() => useRecipeQueue());

        await waitFor(() => {
            expect(result.current.queue).toHaveLength(20);
        });

        act(() => {
            result.current.swipe('recipe-5', 'dislike');
        });

        await waitFor(() => {
            expect(recipeApi.recordSwipe).toHaveBeenCalledWith('recipe-5', 'dislike');
        });
    });

    it('resets queue when category changes', async () => {
        const { result, rerender } = renderHook(
            ({ category }) => useRecipeQueue(category),
            { initialProps: { category: undefined as string | undefined } }
        );

        await waitFor(() => {
            expect(result.current.queue).toHaveLength(20);
        });

        // Change category
        vi.mocked(recipeApi.getNextRecipes).mockResolvedValue([mockRecipes[0]]);
        rerender({ category: 'Dessert' });

        await waitFor(() => {
            expect(recipeApi.getNextRecipes).toHaveBeenCalledWith({
                limit: 20,
                category: 'Dessert',
            });
        });
    });
});
