export interface Ingredient {
  ingredientName: string;
  quantity: number;
  unit: string;
  section: string;
  rawMeasure: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  workTime: string;
  totalTime: string;
  keywordsJson: string;
}

export interface Recipe extends RecipeSummary {
  description: string;
  servings: number;
  instructionsJson: string;
  ingredients: Ingredient[];
}
