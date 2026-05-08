import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { RecipeSummary } from '../../../types/Recipe';
import { Modal } from '../../../components/ui/Modal';
import RecipeCard from '../../../components/ui/RecipeCard';
import { useLikedRecipes } from '../hooks/useLikedRecipes';
import { groupApi } from '../../../api/groupApi';
import type { DayName } from '../../../utils/weekUtils';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayName;
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

  const { groupId } = useParams<{ groupId: string }>();
  const [filterMode, setFilterMode] = useState<'all' | 'liked'>('liked');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMatchIds, setGroupMatchIds] = useState<Set<string>>(new Set());

  // Hent likede opskrifter fra backend via hooket (til individuel brug)
  const { likedRecipes } = useLikedRecipes();
  const favoriteIds = useMemo(() => new Set(likedRecipes.map((r) => r.id)), [likedRecipes]);

  // Find ud af hvilke opskrifter der allerede er på madplanen for denne dag
  const addedIds = useMemo(() => new Set(addedRecipes.map((r) => r.id)), [addedRecipes]);

  // Hent gruppens matches, hvis vi er i en gruppe-kontekst
  useEffect(() => {
    if (groupId && isOpen) {
      groupApi.getMatches(groupId)
        .then(matches => {
          if (matches) {
            setGroupMatchIds(new Set(matches.map(m => m.recipeId)));
          }
        })
        .catch(err => console.error("Fejl ved hentning af gruppens matches til modal:", err));
    }
  }, [groupId, isOpen]);

  // Opskrifter der kan vælges (dem der ikke allerede er tilføjet)
  const selectableRecipes = useMemo(() =>
    availableRecipes.filter((r) => !addedIds.has(r.id)),
    [availableRecipes, addedIds]
  );

  // Filtrering baseret på knapperne "Alle" eller "Likede/Fælles" samt søgeord
  const filteredRecipes = useMemo(() => {
    let recipes = selectableRecipes;

    if (filterMode === 'liked') {
      if (groupId) {
        // Vi tjekker mod gruppens matches
        recipes = recipes.filter((r) => groupMatchIds.has(r.id));
      } else {
        // Vi tjekker mod personlige likes
        recipes = recipes.filter((r) => favoriteIds.has(r.id));
      }
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      recipes = recipes.filter((r) => r.name.toLowerCase().includes(lowerSearch));
    }

    return recipes;
  }, [filterMode, selectableRecipes, favoriteIds, groupId, groupMatchIds, searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tilføj opskrift – ${day}`}>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterMode('liked')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition ${filterMode === 'liked'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          {groupId ? 'Fælles Matches' : 'Likede'}
        </button>
        <button
          onClick={() => setFilterMode('all')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition ${filterMode === 'all'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Alle
        </button>
        <input
          type="text"
          placeholder="Søg efter opskrift..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label="Søg efter opskrift"
        />
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => onSelect(recipe)}
                className="group text-left focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-2xl transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <RecipeCard recipe={recipe} compact />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">
              {filterMode === 'liked'
                ? (groupId ? 'Gruppen har ingen fælles opskrifter at tilføje.' : 'Du har ingen favoritter blandt de tilgængelige opskrifter.')
                : 'Ingen flere opskrifter at tilføje.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}