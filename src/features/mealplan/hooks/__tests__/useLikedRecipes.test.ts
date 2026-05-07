import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLikedRecipes } from '../useLikedRecipes';

vi.mock('../../../../api/recipeApi', () => ({
    recipeApi: {
        getLikedRecipes: vi.fn(),
        recordSwipe: vi.fn(),
    },
}));

import { recipeApi } from '../../../../api/recipeApi';

const mockLikedRecipes = [
    { id: 'recipe-1', name: 'Pasta', category: 'Hovedret', thumbnailUrl: '', workTime: 'PT30M', totalTime: 'PT1H', keywordsJson: '[]' },
    { id: 'recipe-2', name: 'Salat', category: 'Forret', thumbnailUrl: '', workTime: 'PT15M', totalTime: 'PT15M', keywordsJson: '[]' },
];

describe('useLikedRecipes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(recipeApi.getLikedRecipes).mockResolvedValue(mockLikedRecipes);
        vi.mocked(recipeApi.recordSwipe).mockResolvedValue(undefined);
    });

    it('fetches liked recipes on mount', async () => {
        const { result } = renderHook(() => useLikedRecipes());

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });
        expect(result.current.isLoading).toBe(false);
    });

    it('toggleLike adds recipe optimistically', async () => {
        const { result } = renderHook(() => useLikedRecipes());

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });

        const newRecipe = { id: 'recipe-3', name: 'Suppe', category: 'Forret', thumbnailUrl: '', workTime: 'PT20M', totalTime: 'PT40M', keywordsJson: '[]' };

        await act(async () => {
            await result.current.toggleLike(newRecipe);
        });

        expect(result.current.likedRecipes).toHaveLength(3);
        expect(recipeApi.recordSwipe).toHaveBeenCalledWith('recipe-3', 'like');
    });

    it('toggleLike removes recipe optimistically', async () => {
        const { result } = renderHook(() => useLikedRecipes());

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });

        await act(async () => {
            await result.current.toggleLike(mockLikedRecipes[0]);
        });

        expect(result.current.likedRecipes).toHaveLength(1);
        expect(recipeApi.recordSwipe).toHaveBeenCalledWith('recipe-1', 'dislike');
    });

    it('rolls back on API error when liking', async () => {
        vi.mocked(recipeApi.recordSwipe).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useLikedRecipes());

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });

        const newRecipe = { id: 'recipe-3', name: 'Suppe', category: 'Forret', thumbnailUrl: '', workTime: 'PT20M', totalTime: 'PT40M', keywordsJson: '[]' };

        await act(async () => {
            await result.current.toggleLike(newRecipe);
        });

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });
    });

    it('rolls back on API error when unliking', async () => {
        vi.mocked(recipeApi.recordSwipe).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useLikedRecipes());

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });

        await act(async () => {
            await result.current.toggleLike(mockLikedRecipes[0]);
        });

        await waitFor(() => {
            expect(result.current.likedRecipes).toHaveLength(2);
        });
    });

    it('sets error on fetch failure', async () => {
        vi.mocked(recipeApi.getLikedRecipes).mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useLikedRecipes());

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
            expect(result.current.isLoading).toBe(false);
        });
    });
});
