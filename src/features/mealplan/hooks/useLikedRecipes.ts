import { useState, useEffect, useCallback } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { recipeApi } from '../../../api/recipeApi';

export function useLikedRecipes() {
    const [likedRecipes, setLikedRecipes] = useState<RecipeSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchLikedRecipes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await recipeApi.getLikedRecipes();
            setLikedRecipes(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err : new Error('Failed to load liked recipes'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLikedRecipes();
    }, [fetchLikedRecipes]);

    const toggleLike = async (recipe: RecipeSummary) => {
        const isCurrentlyLiked = likedRecipes.some((r) => r.id === recipe.id);

        // Optimistisk opdatering (UI skifter med det samme)
        if (isCurrentlyLiked) {
            setLikedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
        } else {
            setLikedRecipes((prev) => [...prev, recipe]);
        }

        try {
            await recipeApi.recordSwipe(recipe.id, isCurrentlyLiked ? 'dislike' : 'like');
        } catch (err) {
            console.error('Fejl ved toggle like:', err);
            // Rul tilbage ved fejl
            if (isCurrentlyLiked) {
                setLikedRecipes((prev) => [...prev, recipe]);
            } else {
                setLikedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
            }
        }
    };

    return { likedRecipes, isLoading, error, toggleLike, refetch: fetchLikedRecipes };
}
