import { useState } from 'react';
import type { RecipeSummary } from '../../../types/Recipe';
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
}

export function AddRecipeModal({
  isOpen,
  onClose,
  day,
  availableRecipes,
  addedRecipes,
  onSelect,
}: AddRecipeModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLiked, setShowOnlyLiked] = useState(true);

  // Hent liked opskrifter via hooket. Kører kun når modalen er åben.
  const { likedRecipes, isLoading: isLoadingLiked } = useLikedRecipes();

  const addedIds = new Set(addedRecipes.map((r) => r.id));

  // Vælg hvilken liste vi kigger i ("Mine favoritter" eller "Alle")
  const sourceRecipes = showOnlyLiked ? likedRecipes : availableRecipes;

  // Filtrer først dem fra som allerede er tilføjet, og derefter ud fra søgeordet
  const selectableRecipes = sourceRecipes
    .filter((r) => !addedIds.has(r.id))
    .filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Nulstil alt state når modalen lukkes
  const handleClose = () => {
    setSearchTerm('');
    setShowOnlyLiked(true); // Reset til at vise Liked by default næste gang
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Tilføj opskrift – ${day}`}>
      <div className="mb-4 flex flex-col gap-3">
        {/* Toggle knapper for Liked vs All */}
        <div className="flex bg-slate-100 p-1 mx-auto rounded-xl inline-flex w-fit">
          <button
            onClick={() => setShowOnlyLiked(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showOnlyLiked
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            Dine Favoritter
          </button>
          <button
            onClick={() => setShowOnlyLiked(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showOnlyLiked
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
          >
            Alle Opskrifter
          </button>
        </div>

        {/* Søgefelt */}
        <input
          type="text"
          placeholder={`Søg i ${showOnlyLiked ? 'favoritter' : 'alle opskrifter'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-400 text-slate-700"
        />
      </div>

      {isLoadingLiked && showOnlyLiked ? (
        <p className="text-sm text-slate-400 text-center py-8">Indlæser dine favoritter...</p>
      ) : selectableRecipes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {selectableRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => {
                onSelect(recipe);
                setSearchTerm(''); // Nulstil søgefeltet efter valg
              }}
              className="text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl transition-transform hover:scale-[1.02] active:scale-95"
            >
              <RecipeCard recipe={recipe} compact />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">
          {sourceRecipes.length === 0
            ? (showOnlyLiked ? 'Du har ikke nogen favoritopskrifter endnu.' : 'Indlæser opskrifter...')
            : searchTerm
              ? 'Ingen opskrifter matchede din søgning.'
              : 'Alle opskrifter i denne kategori er allerede tilføjet til denne dag.'}
        </p>
      )}
    </Modal>
  );
}
