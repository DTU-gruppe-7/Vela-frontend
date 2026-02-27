import { useState, useEffect, useRef, useCallback } from "react";
import { recipeApi } from "../api/recipeApi";
import type { Recipe } from "../types/Recipe";

const PREFETCH_THRESHOLD = 5;
const BATCH_SIZE = 20;

export const useRecipeQueue = () => {
    const [queue, setQueue] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFetching = useRef(false);

    const fetchMoreRecipes = useCallback(async () => {
        if (isFetching.current) return;

        isFetching.current = true;
        setIsLoading(true);
        try {
            const newBatch = await recipeApi.getNextRecipe(BATCH_SIZE);
            setQueue((prev) => [...prev, ...newBatch]);
        } catch (error) {
            console.error("Failed to fetch more recipes:", error);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        fetchMoreRecipes();
    }, [fetchMoreRecipes]);

    const swipe = useCallback(
        async (recipeId: string, direction: "like" | "dislike") => {
            // Optimistisk UI – fjern kortet med det same
            setQueue((prev) => prev.filter((r) => r.id !== recipeId));

            // Fire-and-forget til backend
            recipeApi.recordSwipe(recipeId, direction).catch((error) => {
                console.error("Failed to record swipe:", error);
            });
        },
        [],
    );

    // Prefetch når køen er ved at løbe tør
    useEffect(() => {
        if (queue.length <= PREFETCH_THRESHOLD && queue.length > 0) {
            fetchMoreRecipes();
        }
    }, [queue.length, fetchMoreRecipes]);   

    return {
        queue,
        swipe,
        isLoading: isLoading && queue.length === 0,
    } as const;
};
