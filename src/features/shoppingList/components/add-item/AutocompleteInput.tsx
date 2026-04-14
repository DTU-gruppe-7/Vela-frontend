import { FiLoader, FiSearch } from 'react-icons/fi';
import type { IngredientSearchResult } from '../../../../types/ShoppingList';
import { getIngredientCategoryLabel, normalizeIngredientCategory } from '../../utils/formOptions';

interface AutocompleteInputProps {
  value: string;
  suggestions: IngredientSearchResult[];
  isLoading: boolean;
  isOpen: boolean;
  activeIndex: number;
  onValueChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onCloseSuggestions: () => void;
  onSelectSuggestion: (ingredient: IngredientSearchResult) => void;
  onActiveIndexChange: (updater: (current: number) => number) => void;
  onSubmit: () => void;
}

function AutocompleteInput({
  value,
  suggestions,
  isLoading,
  isOpen,
  activeIndex,
  onValueChange,
  onFocus,
  onBlur,
  onCloseSuggestions,
  onSelectSuggestion,
  onActiveIndexChange,
  onSubmit,
}: AutocompleteInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSubmit();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onActiveIndexChange((current) => Math.min(current + 1, suggestions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onActiveIndexChange((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseSuggestions();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onSelectSuggestion(suggestions[activeIndex] ?? suggestions[0]);
    }
  };

  return (
    <div className="relative w-full lg:min-w-0 lg:flex-1">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Tilføj vare..."
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pl-10 text-sm capitalize text-gray-700 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300"
      />

      {isOpen && (isLoading || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
              <FiLoader className="animate-spin" />
              <span>Søger ingredienser...</span>
            </div>
          ) : (
            <ul className="max-h-72 overflow-auto py-1">
              {suggestions.map((ingredient, index) => {
                const category = normalizeIngredientCategory(ingredient.category);
                const isActive = index === activeIndex;

                return (
                  <li key={ingredient.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelectSuggestion(ingredient)}
                      onMouseEnter={() => onActiveIndexChange(() => index)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${isActive ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium capitalize text-gray-800">{ingredient.name}</p>
                        <p className="text-xs text-gray-500">{getIngredientCategoryLabel(category)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500">
                        {ingredient.unit && <span>{ingredient.unit}</span>}
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          eksisterende
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;


