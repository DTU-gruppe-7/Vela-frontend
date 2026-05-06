import { useState, useEffect, useRef, useCallback } from "react";
import { recipeApi } from "../api/recipeApi";
import type { RecipeSummary } from "../types/Recipe";

const PREFETCH_THRESHOLD = 5;
const BATCH_SIZE = 20;

export const useRecipeQueue = (category?: string) => {
    const [queue, setQueue] = useState<RecipeSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFetching = useRef(false);

    const fetchMoreRecipes = useCallback(async () => {
        if (isFetching.current) return;

        isFetching.current = true;
        setIsLoading(true);
        try {
            const newBatch = await recipeApi.getNextRecipes({
                limit: BATCH_SIZE,
                category,
            });
            setQueue((prev) => [...prev, ...newBatch]);
        } catch (error) {
            console.error("Failed to fetch more recipes:", error);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [category]);

    useEffect(() => {
            setQueue([]);
            isFetching.current = false;
            fetchMoreRecipes();
    },  [fetchMoreRecipes]);

    const swipe = useCallback((recipeId: string, direction: "like" | "dislike") => {
        // Øjeblikkelig UI-opdatering — blokerer aldrig
        setQueue((prev) => prev.filter((r) => r.id !== recipeId));

        // Retry i baggrunden uden at blokere UI
        let attempt = 0;
        const tryRecord = () => {
            recipeApi.recordSwipe(recipeId, direction).catch(() => {
                if (++attempt < 3) {
                    setTimeout(tryRecord, 500 * 2 ** attempt);
                }
            });
        };
        tryRecord();
    }, []);

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
