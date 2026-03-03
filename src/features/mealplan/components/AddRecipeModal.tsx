import type { RecipeSummary } from '../../../types/Recipe';
import { Modal } from '../../../components/ui/Modal';
import RecipeCard from '../../../components/ui/RecipeCard';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  availableRecipes: RecipeSummary[];
  addedRecipes: RecipeSummary[];
  onSelect: (recipe: RecipeSummary) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export function AddRecipeModal({
  isOpen,
  onClose,
  day,
  availableRecipes,
  addedRecipes,
  onSelect,
  isLoading = false,
  error = null,
}: AddRecipeModalProps) {
  const addedIds = new Set(addedRecipes.map((r) => r.id));
  const selectableRecipes = availableRecipes.filter((r) => !addedIds.has(r.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tilføj opskrift – ${day}`}>
      {isLoading ? (
        <p className="text-sm text-slate-400 text-center py-8">Indlæser opskrifter...</p>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-8">Kunne ikke indlæse opskrifter.</p>
      ) : selectableRecipes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {selectableRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onSelect(recipe)}
              className="text-left focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-2xl"
            >
              <RecipeCard recipe={recipe} compact />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">
          {availableRecipes.length === 0
            ? 'Ingen foretrukne opskrifter fundet.'
            : 'Alle opskrifter er allerede tilføjet til denne dag.'}
        </p>
      )}
    </Modal>
  );
}
