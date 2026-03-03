import { useState, useEffect } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { recipeApi } from '../../../api/recipeApi';

export function useLikedRecipes() {
    const [likedRecipes, setLikedRecipes] = useState<RecipeSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        recipeApi.getLikedRecipes()
            .then(setLikedRecipes)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    return { likedRecipes, isLoading };
}
