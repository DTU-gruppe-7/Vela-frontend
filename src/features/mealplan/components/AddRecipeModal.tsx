import type { RecipeSummary } from '../../../types/Recipe';
import { useState, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import RecipeCard from '../../../components/ui/RecipeCard';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  availableRecipes: RecipeSummary[];
  addedRecipes: RecipeSummary[];
  onSelect: (recipe: RecipeSummary) => void;
}

export function AddRecipeModal({
  isOpen,
  onClose,
  day,
  availableRecipes,
  addedRecipes,
  onSelect,
}: AddRecipeModalProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'liked'>('all');
  const addedIds = new Set(addedRecipes.map((r) => r.id));
  const selectableRecipes = availableRecipes.filter((r) => !addedIds.has(r.id));

  const filteredRecipes = useMemo(() => {
    if (filterMode === 'liked') {
      return selectableRecipes.filter((r) => r.liked);
    }
    return selectableRecipes;
  }, [filterMode, selectableRecipes]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tilføj opskrift – ${day}`}>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filterMode === 'all'
                ? 'bg-orange-500 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setFilterMode('liked')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filterMode === 'liked'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Likede
        </button>
      </div>


      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
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
          {filterMode === 'liked' && selectableRecipes.some((r) => r.liked) === false
            ? 'Du har ingen favoritter endnu.'
            : selectableRecipes.length === 0
            ? 'Alle opskrifter er allerede tilføjet til denne dag.'
            : 'Indlæser opskrifter...'}
        </p>
      )}
    </Modal>
  );
}
