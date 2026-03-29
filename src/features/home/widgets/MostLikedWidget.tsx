import RecipeCard from '../../../components/ui/RecipeCard';
import type { RecipeSummary } from '../../../types/Recipe'

interface Props{
    recipes: RecipeSummary[];
    onRecipeClick?: (id: string) => void
}

const GRID_SIZE = 25;

const build5x5Grid = (recipes: RecipeSummary[]): (RecipeSummary | null)[] => {
    return Array.from({ length: GRID_SIZE }, (_, index) => recipes[index] ?? null);
}

export const MostLikedRecipesWidget = ({ recipes, onRecipeClick }: Props) => {
    const gridItems = build5x5Grid(recipes);

    return (
        <div className="grid grid-cols-5 gap-2">
            {gridItems.map((recipe, index) =>
                recipe ? (
                    <div
                        key={recipe.id}
                        onClick={() => onRecipeClick?.(recipe.id)}
                        className="h-full w-full cursor-pointer"
                    >
                        <RecipeCard recipe={recipe} compact />
                    </div>
                ) : (
                    <div
                        key={'empty-' + index}
                        className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50"
                        />
                    )
                )}
        </div>
    );
};