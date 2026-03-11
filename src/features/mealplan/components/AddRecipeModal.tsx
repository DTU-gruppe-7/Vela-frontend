import { useState } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
import { useState, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import RecipeCard from '../../../components/ui/RecipeCard';
import { useLikedRecipes } from '../hooks/useLikedRecipes';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  availableRecipes: RecipeSummary[];
  addedRecipes: RecipeSummary[];
  onSelect: (recipe: RecipeSummary) => void;
  // Tilføj denne hvis du vil have "Likede" til at virke med dine favoritter
  favoriteIds?: Set<string>; 
}

export function AddRecipeModal({
  isOpen,
  onClose,
  day,
  availableRecipes,
  addedRecipes,
  onSelect,
  favoriteIds = new Set(), // Default til tom hvis den ikke sendes med
}: AddRecipeModalProps) {
  
  const [filterMode, setFilterMode] = useState<'all' | 'liked'>('all');

  // Find ud af hvilke opskrifter der allerede er på madplanen for denne dag
  const addedIds = useMemo(() => new Set(addedRecipes.map((r) => r.id)), [addedRecipes]);

  // Opskrifter der kan vælges (dem der ikke allerede er tilføjet)
  const selectableRecipes = useMemo(() => 
    availableRecipes.filter((r) => !addedIds.has(r.id)),
    [availableRecipes, addedIds]
  );

  // Filtrering baseret på knapperne "Alle" eller "Likede"
  const filteredRecipes = useMemo(() => {
    if (filterMode === 'liked') {
      // Vi tjekker mod favoriteIds sættet
      return selectableRecipes.filter((r) => favoriteIds.has(r.id));
    }
    return selectableRecipes;
  }, [filterMode, selectableRecipes, favoriteIds]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tilføj opskrift – ${day}`}>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
            filterMode === 'all'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setFilterMode('liked')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
            filterMode === 'liked'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Likede
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                className="group text-left focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-2xl transition-transform hover:scale-[1.02]"
              >
                <RecipeCard recipe={recipe} compact />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">
              {filterMode === 'liked'
                ? 'Du har ingen favoritter blandt de tilgængelige opskrifter.'
                : 'Ingen flere opskrifter at tilføje.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}