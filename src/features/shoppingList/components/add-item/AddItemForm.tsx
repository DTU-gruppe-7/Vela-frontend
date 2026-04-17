import { useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import type { AddShoppingListItem, IngredientCategory, IngredientSearchResult } from '../../../../types/ShoppingList';
import { IngredientCategory as IngredientCategoryValues } from '../../../../types/ShoppingList';
import { shoppingListApi } from '../../../../api/shoppingListApi';
import {
  INGREDIENT_CATEGORY_OPTIONS,
  INGREDIENT_SEARCH_DEBOUNCE_MS,
  INGREDIENT_SEARCH_LIMIT,
  mapBackendUnitToFormUnit,
  STACKED_LAYOUT_MEDIA_QUERY,
  UNIT_OPTIONS,
  normalizeIngredientCategory,
} from '../../utils/formOptions';
import AutocompleteInput from './AutocompleteInput';

interface AddItemFormProps {
  onAddItem: (item: AddShoppingListItem) => Promise<void>;
}

function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>(IngredientCategoryValues.Other);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientSearchResult | null>(null);

  const [ingredientSuggestions, setIngredientSuggestions] = useState<IngredientSearchResult[]>([]);
  const [ingredientSearchLoading, setIngredientSearchLoading] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [isNameInputFocused, setIsNameInputFocused] = useState(false);

  const [isStackedLayout, setIsStackedLayout] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(STACKED_LAYOUT_MEDIA_QUERY).matches;
  });
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);
  const addFormRef = useRef<HTMLDivElement | null>(null);

  const selectedIngredientName = selectedIngredient?.name ?? '';

  useEffect(() => {
    const query = newItemName.trim();
    const hasSelectedIngredient =
      selectedIngredientName && query.toLowerCase() === selectedIngredientName.toLowerCase();

    if (!isNameInputFocused || query.length < 2 || hasSelectedIngredient) {
      setIngredientSuggestions([]);
      setIngredientSearchLoading(false);
      setIsSuggestionOpen(false);
      return;
    }

    let isCancelled = false;
    setIngredientSearchLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await shoppingListApi.searchIngredients(query, INGREDIENT_SEARCH_LIMIT);
        if (isCancelled) return;

        setIngredientSuggestions(results);
        setIsSuggestionOpen(results.length > 0);
        setActiveSuggestionIndex(0);
      } catch (error) {
        console.error('Error searching ingredients:', error);
        if (!isCancelled) {
          setIngredientSuggestions([]);
          setIsSuggestionOpen(false);
        }
      } finally {
        if (!isCancelled) {
          setIngredientSearchLoading(false);
        }
      }
    }, INGREDIENT_SEARCH_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [newItemName, selectedIngredientName, isNameInputFocused]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(STACKED_LAYOUT_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsStackedLayout(event.matches);
    };

    setIsStackedLayout(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  const resetForm = (): void => {
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('');
    setNewItemCategory(IngredientCategoryValues.Other);
    setSelectedIngredient(null);
    setIngredientSuggestions([]);
    setIngredientSearchLoading(false);
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(0);

    if (isStackedLayout) {
      setIsAddFormExpanded(false);
    }
  };

  const selectIngredientSuggestion = (ingredient: IngredientSearchResult): void => {
    setSelectedIngredient(ingredient);
    setNewItemName(ingredient.name);
    setNewItemUnit(mapBackendUnitToFormUnit(ingredient.unit));
    setNewItemCategory(normalizeIngredientCategory(ingredient.category));
    setIngredientSuggestions([]);
    setIngredientSearchLoading(false);
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(0);
  };

  const handleAddItem = async (): Promise<void> => {
    const name = newItemName.trim();
    if (!name) return;

    const quantity = Number(newItemQuantity);
    const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

    const newItem: AddShoppingListItem = {
      ingredientId: selectedIngredient?.id ?? null,
      ingredientName: name,
      category: newItemCategory,
      quantity: normalizedQuantity,
      unit: newItemUnit,
      assignedUserId: null,
    };

    await onAddItem(newItem);
    resetForm();
  };

  const handleQuantityKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAddItem();
    }
  };

  const handleNameChange = (value: string): void => {
    setNewItemName(value);

    if (isStackedLayout && !isAddFormExpanded) {
      setIsAddFormExpanded(true);
    }

    if (selectedIngredient) {
      setSelectedIngredient(null);
      setNewItemUnit('');
      setNewItemCategory(IngredientCategoryValues.Other);
    }
  };

  const isAddButtonActive = newItemName.trim().length > 0;
  const showExpandedAddControls = !isStackedLayout || isAddFormExpanded;
  const showCollapsedAddButton = isStackedLayout && !isAddFormExpanded && isAddButtonActive;

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        ref={addFormRef}
        onBlurCapture={() => {
          if (!isStackedLayout) return;

          window.setTimeout(() => {
            const activeElement = document.activeElement;
            if (!addFormRef.current) return;

            if (!activeElement || !addFormRef.current.contains(activeElement)) {
              setIsAddFormExpanded(false);
            }
          }, 0);
        }}
        className="flex flex-col gap-3 lg:flex-row lg:items-start"
      >
        <AutocompleteInput
          value={newItemName}
          suggestions={ingredientSuggestions}
          isLoading={ingredientSearchLoading}
          isOpen={isSuggestionOpen}
          activeIndex={activeSuggestionIndex}
          onValueChange={handleNameChange}
          onFocus={() => {
            if (isStackedLayout) {
              setIsAddFormExpanded(true);
            }
            setIsNameInputFocused(true);
            if (ingredientSuggestions.length > 0) {
              setIsSuggestionOpen(true);
            }
          }}
          onBlur={() => {
            setIsNameInputFocused(false);
            setIsSuggestionOpen(false);
          }}
          onCloseSuggestions={() => setIsSuggestionOpen(false)}
          onSelectSuggestion={selectIngredientSuggestion}
          onActiveIndexChange={(updater) => setActiveSuggestionIndex((current) => updater(current))}
          onSubmit={() => {
            void handleAddItem();
          }}
        />

        {showExpandedAddControls && (
          <>
            <select
              value={newItemCategory}
              onChange={(event) => setNewItemCategory(Number(event.target.value) as IngredientCategory)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300 lg:w-52"
            >
              {INGREDIENT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              step="1"
              placeholder="Antal"
              value={newItemQuantity}
              onChange={(event) => setNewItemQuantity(event.target.value)}
              onKeyDown={handleQuantityKeyDown}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300 lg:w-24"
            />

            <select
              value={newItemUnit}
              onChange={(event) => setNewItemUnit(event.target.value)}
              onKeyDown={handleQuantityKeyDown}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300 lg:w-32"
            >
              {UNIT_OPTIONS.map((option) => (
                <option key={option.value || 'empty'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                void handleAddItem();
              }}
              disabled={!isAddButtonActive}
              className={`flex shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 ${isStackedLayout ? 'h-10 w-full' : 'h-10 w-10 self-end lg:self-auto'}`}
            >
              <FiPlus className="text-lg" />
            </button>
          </>
        )}

        {showCollapsedAddButton && (
          <button
            onClick={() => {
              void handleAddItem();
            }}
            disabled={!isAddButtonActive}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiPlus className="text-lg" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AddItemForm;


