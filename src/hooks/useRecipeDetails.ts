import { useState, useEffect, useMemo } from "react";
import { recipeApi } from "../api/recipeApi";
import type { Recipe } from "../types/Recipe";

export function useRecipeDetails(recipeId: string | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
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
  }, [recipeId]);

  const instructions = useMemo(() => {
    if (!recipe?.instructionsJson) {
      return [];
    }
    try {
      const parsed = JSON.parse(recipe.instructionsJson);
      
      // Hvis det er et objekt med sections, flatter vi det
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        const flattened: string[] = [];
        Object.entries(parsed).forEach(([section, steps]: [string, unknown]) => {
          flattened.push(`**${section}**`);
          if (Array.isArray(steps)) {
            flattened.push(...steps);
          }
        });
        return flattened;
      }
      
      // Hvis det allerede er et array
      return parsed;
    } catch (e) {
      console.error("Fejl ved parsing af instruktioner:", e);
      return [recipe.instructionsJson]; // Fallback til rå tekst
    }
  }, [recipe?.instructionsJson]);

  return { recipe, loading, error, instructions };
}