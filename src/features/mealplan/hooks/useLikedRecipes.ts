import { useState, useEffect } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { recipeApi } from '../../../api/recipeApi';

export function useLikedRecipes() {
    const [likedRecipes, setLikedRecipes] = useState<RecipeSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Reset state when (re)fetching
        setIsLoading(true);
        setError(null);

        recipeApi.getLikedRecipes()
            .then(setLikedRecipes)
            .catch((err) => {
                console.error(err);
                setError(err instanceof Error ? err : new Error('Failed to load liked recipes'));
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { likedRecipes, isLoading, error };
}
