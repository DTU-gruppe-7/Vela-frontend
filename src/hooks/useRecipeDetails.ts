import { useState, useEffect, useMemo } from "react";
import { recipeApi } from "../api/recipeApi";
import type { Recipe } from "../types/Recipe";

interface UseRecipeDetailsOptions {
  initialRecipe?: Recipe | null;
}

export function useRecipeDetails(recipeId: string | null, options: UseRecipeDetailsOptions = {}) {
  const [recipe, setRecipe] = useState<Recipe | null>(options.initialRecipe ?? null);
  const [loading, setLoading] = useState(!options.initialRecipe);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
      return;
    }

    if (options.initialRecipe?.id === recipeId) {
      setLoading(false);
      return;
    }

    const loadRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await recipeApi.getRecipeById(recipeId);
        setRecipe(data);
      } catch (err) {
        console.error("Fejl ved hentning af opskrift:", err);
        setError("Kunne ikke hente opskriftsdetaljer.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId, options.initialRecipe]);

  const instructions = useMemo(() => {
    if (!recipe?.instructionsJson) {
      return [];
    }
    try {
      const parsed = JSON.parse(recipe.instructionsJson);
      
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return Object.entries(parsed).map(([section, steps]) => ({
          sectionName: section,
          steps: Array.isArray(steps) ? steps : [steps]
        }));
      }
      
      if (Array.isArray(parsed)) {
        return [{ sectionName: null, steps: parsed }];
      }

      return [{ sectionName: null, steps: [parsed] }];
    } catch (e) {
      console.error("Fejl ved parsing af instruktioner:", e);
      return [{ sectionName: null, steps: [recipe.instructionsJson] }];
    }
  }, [recipe?.instructionsJson]);

  return { recipe, loading, error, instructions };
}
