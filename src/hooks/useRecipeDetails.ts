import { useState, useEffect } from "react";
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

  const getInstructions = (): string[] => {
    if (!recipe?.instructionsJson) return [];
    try {
      return JSON.parse(recipe.instructionsJson);
    } catch (e) {
      console.error("Fejl ved parsing af instruktioner:", e);
      return [recipe.instructionsJson]; // Fallback til rå tekst
    }
  };

  return { recipe, loading, error, instructions: getInstructions() };
}