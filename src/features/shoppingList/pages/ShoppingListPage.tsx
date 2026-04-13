import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiArrowDown, FiArrowUp, FiLoader, FiPlus, FiSearch, FiShoppingCart } from 'react-icons/fi';
import type { IngredientSearchResult, ShoppingListItem, AddShoppingListItem } from '../../../types/ShoppingList';
import { IngredientCategory } from '../../../types/ShoppingList';
import { useShoppingList } from '../hooks/useShoppingList';
import ShoppingItem from '../components/ShoppingItem';
import { shoppingListApi } from '../../../api/shoppingListApi';

const INGREDIENT_SEARCH_LIMIT = 8;
const INGREDIENT_SEARCH_DEBOUNCE_MS = 250;
const STACKED_LAYOUT_MEDIA_QUERY = '(max-width: 1023px)';

const INGREDIENT_CATEGORY_OPTIONS = [
    { value: IngredientCategory.Other, label: 'Andet' },
    { value: IngredientCategory.Vegetables, label: 'Grøntsager' },
    { value: IngredientCategory.Fruits, label: 'Frugt' },
    { value: IngredientCategory.Meat, label: 'Kød' },
    { value: IngredientCategory.Fish, label: 'Fisk' },
    { value: IngredientCategory.Dairy, label: 'Mejeri' },
    { value: IngredientCategory.Eggs, label: 'Æg' },
    { value: IngredientCategory.Grains, label: 'Korn og gryn' },
    { value: IngredientCategory.Bread, label: 'Brød' },
    { value: IngredientCategory.Legumes, label: 'Bælgfrugter' },
    { value: IngredientCategory.HerbsAndSpices, label: 'Urter og krydderier' },
    { value: IngredientCategory.OilsAndFats, label: 'Olier og fedt' },
    { value: IngredientCategory.Condiments, label: 'Krydderier og smagsgivere' },
    { value: IngredientCategory.NutsAndSeeds, label: 'Nødder og frø' },
    { value: IngredientCategory.Sweeteners, label: 'Sødemidler' },
    { value: IngredientCategory.Beverages, label: 'Drikkevarer' },
    { value: IngredientCategory.CannedGoods, label: 'Konserves' },
] as const;

const INGREDIENT_CATEGORY_LOOKUP: Record<string, IngredientCategory> = {
    other: IngredientCategory.Other,
    vegetables: IngredientCategory.Vegetables,
    vegetable: IngredientCategory.Vegetables,
    fruits: IngredientCategory.Fruits,
    fruit: IngredientCategory.Fruits,
    meat: IngredientCategory.Meat,
    fish: IngredientCategory.Fish,
    dairy: IngredientCategory.Dairy,
    eggs: IngredientCategory.Eggs,
    egg: IngredientCategory.Eggs,
    grains: IngredientCategory.Grains,
    grain: IngredientCategory.Grains,
    bread: IngredientCategory.Bread,
    legumes: IngredientCategory.Legumes,
    legume: IngredientCategory.Legumes,
    herbsandspices: IngredientCategory.HerbsAndSpices,
    herbs_and_spices: IngredientCategory.HerbsAndSpices,
    oilsandfats: IngredientCategory.OilsAndFats,
    oils_and_fats: IngredientCategory.OilsAndFats,
    condiments: IngredientCategory.Condiments,
    nutsandseeds: IngredientCategory.NutsAndSeeds,
    nuts_and_seeds: IngredientCategory.NutsAndSeeds,
    sweeteners: IngredientCategory.Sweeteners,
    beverages: IngredientCategory.Beverages,
    cannedgoods: IngredientCategory.CannedGoods,
    canned_goods: IngredientCategory.CannedGoods,
};

function getIngredientCategoryLabel(category: IngredientCategory): string {
    return INGREDIENT_CATEGORY_OPTIONS.find(option => option.value === category)?.label ?? 'Andet';
}

function normalizeIngredientCategory(category: IngredientSearchResult['category']): IngredientCategory {
    if (typeof category === 'number') {
        return (Object.values(IngredientCategory) as number[]).includes(category)
            ? category as IngredientCategory
            : IngredientCategory.Other;
    }

    const trimmed = category.trim();
    if (/^-?\d+$/.test(trimmed)) {
        const numericCategory = Number(trimmed);
        return (Object.values(IngredientCategory) as number[]).includes(numericCategory)
            ? numericCategory as IngredientCategory
            : IngredientCategory.Other;
    }

    const normalized = trimmed.toLowerCase().replace(/[^a-z0-9_]+/g, '');
    return INGREDIENT_CATEGORY_LOOKUP[normalized] ?? IngredientCategory.Other;
}

function ShoppingListPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const {
        shoppingList,
        loading,
        error,
        addItem,
        toogleItem,
        removeItem,
        refetch,
    } = useShoppingList(groupId);

    // Form state for nyt item
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('1');
    const [newItemUnit, setNewItemUnit] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>(IngredientCategory.Other);
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

    // Sorterings state
    type SortOption = 'name' | 'updatedAt' | 'createdAt';

    const [sortBy, setSortBy] = useState<SortOption>(() => {
        const saved = localStorage.getItem('shoppingListSort');
        return (saved as SortOption) || 'name';
    });
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
        const saved = localStorage.getItem('shoppingListSortDirection');
        return (saved as 'asc' | 'desc') || 'asc';
    });

    // Gem sorteringspræferencer til localStorage
    useEffect(() => {
        localStorage.setItem('shoppingListSort', sortBy);
        localStorage.setItem('shoppingListSortDirection', sortDirection);
    }, [sortBy, sortDirection]);

    useEffect(() => {
        const query = newItemName.trim();
        const hasSelectedIngredient = selectedIngredientName && query.toLowerCase() === selectedIngredientName.toLowerCase();

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

    const resetForm = () => {
        setNewItemName('');
        setNewItemQuantity('1');
        setNewItemUnit('');
        setNewItemCategory(IngredientCategory.Other);
        setSelectedIngredient(null);
        setIngredientSuggestions([]);
        setIngredientSearchLoading(false);
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(0);
        if (isStackedLayout) {
            setIsAddFormExpanded(false);
        }
    };

    const selectIngredientSuggestion = (ingredient: IngredientSearchResult) => {
        setSelectedIngredient(ingredient);
        setNewItemName(ingredient.name);
        setNewItemUnit(ingredient.unit ?? '');
        setNewItemCategory(normalizeIngredientCategory(ingredient.category));
        setIngredientSuggestions([]);
        setIngredientSearchLoading(false);
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(0);
    };

    const handleAddItem = async () => {
        const name = newItemName.trim();
        if (!name) return;

        const quantity = Number(newItemQuantity);
        const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

        const newItem: AddShoppingListItem = {
            ingredientId: selectedIngredient?.id ?? null,
            ingredientName: name,
            category: newItemCategory,
            quantity: normalizedQuantity,
            unit: newItemUnit.trim() || selectedIngredient?.unit?.trim() || '',
            assignedUserId: null,
        };

        await addItem(newItem);
        resetForm();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAddItem();
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isSuggestionOpen || ingredientSuggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex((current) => Math.min(current + 1, ingredientSuggestions.length - 1));
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex((current) => Math.max(current - 1, 0));
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setIsSuggestionOpen(false);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            selectIngredientSuggestion(ingredientSuggestions[activeSuggestionIndex] ?? ingredientSuggestions[0]);
        }
    };

    const handleNameChange = (value: string) => {
        setNewItemName(value);

        if (isStackedLayout && !isAddFormExpanded) {
            setIsAddFormExpanded(true);
        }

        if (selectedIngredient) {
            setSelectedIngredient(null);
            setNewItemUnit('');
            setNewItemCategory(IngredientCategory.Other);
    const handleClearAll = async () => {
        if (!shoppingList?.id) return;
        
        const confirmed = window.confirm('Er du sikker på at du vil slette hele din indkøbsliste? Dette kan ikke fortrydes.');
        
        if (!confirmed) return;

        try {
            await shoppingListApi.clearAll(shoppingList.id);
            await refetch();
        } catch (err) {
            console.error('Fejl ved sletning af indkøbsliste:', err);
            alert('Der skete en fejl ved sletning af indkøbslisten');
        }
    };

    const handleDeleteChecked = async () => {
        if (!shoppingList?.id) return;
        
        const confirmed = window.confirm('Er du sikker på at du vil slette alle dine købte varer? Dette kan ikke fortrydes.');
        
        if (!confirmed) return;

        try {
            await shoppingListApi.clearPurchased(shoppingList.id);
            await refetch();
        } catch (err) {
            console.error('Fejl ved sletning af købte varer:', err);
            alert('Der skete en fejl ved sletning af købte varer');
        }
    };

    // Sorteringsfunktion
    const sortItems = (items: ShoppingListItem[]) => {
        return [...items].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.ingredientName.localeCompare(b.ingredientName, 'da');
                    break;
                case 'updatedAt':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    // Opdel items i ikke-købt og købt (sorteret separat)
    const uncheckedItems = sortItems(shoppingList?.items?.filter(i => !i.isBought) ?? []);
    const checkedItems = sortItems(shoppingList?.items?.filter(i => i.isBought) ?? []);
    const isAddButtonActive = newItemName.trim().length > 0;
    const showExpandedAddControls = !isStackedLayout || isAddFormExpanded;
    const showCollapsedAddButton = isStackedLayout && !isAddFormExpanded && isAddButtonActive;

    // Skeleton loading
    const SkeletonItem = () => (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Error state */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Tilføj nyt item */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
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
                        <div className="relative w-full lg:min-w-0 lg:flex-1">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tilføj vare..."
                                value={newItemName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                onKeyDown={handleNameKeyDown}
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
                                className="w-full px-3 py-2 pl-10 text-sm capitalize text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                            />

                            {isSuggestionOpen && (ingredientSearchLoading || ingredientSuggestions.length > 0) && (
                                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                                    {ingredientSearchLoading ? (
                                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                                            <FiLoader className="animate-spin" />
                                            <span>Søger ingredienser...</span>
                                        </div>
                                    ) : (
                                        <ul className="max-h-72 overflow-auto py-1">
                                            {ingredientSuggestions.map((ingredient, index) => {
                                                const category = normalizeIngredientCategory(ingredient.category);
                                                const isActive = index === activeSuggestionIndex;

                                                return (
                                                    <li key={ingredient.id}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(event) => event.preventDefault()}
                                                            onClick={() => selectIngredientSuggestion(ingredient)}
                                                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                                                            className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${isActive ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-gray-800 capitalize">{ingredient.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {getIngredientCategoryLabel(category)}
                                                                </p>
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

                        {showExpandedAddControls && (
                            <>
                                <select
                                    value={newItemCategory}
                                    onChange={(e) => setNewItemCategory(Number(e.target.value) as IngredientCategory)}
                                    className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition lg:w-52"
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
                                    onChange={(e) => setNewItemQuantity(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition lg:w-24"
                                />

                                <input
                                    type="text"
                                    placeholder="Enhed"
                                    value={newItemUnit}
                                    onChange={(e) => setNewItemUnit(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition lg:w-24"
                                />

                                <button
                                    onClick={handleAddItem}
                                    disabled={!isAddButtonActive}
                                    className={`flex shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 ${isStackedLayout ? 'h-10 w-full' : 'h-10 w-10 self-end lg:self-auto'}`}
                                >
                                    <FiPlus className="text-lg" />
                                </button>
                            </>
                        )}

                        {showCollapsedAddButton && (
                            <button
                                onClick={handleAddItem}
                                disabled={!isAddButtonActive}
                                className="flex h-10 w-full items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiPlus className="text-lg" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sortering */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 font-medium">Sorter efter:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                            <option value="name">Navn</option>
                            <option value="updatedAt">Senest opdateret</option>
                            <option value="createdAt">Tilføjet senest</option>
                        </select>
                        <button
                            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                            title={sortDirection === 'asc' ? 'Stigende' : 'Faldende'}
                        >
                            {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                            {sortDirection === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDeleteChecked}
                            disabled={checkedItems.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Slet alle købt varer"
                        >
                            <FiTrash2 />
                            Slet købte
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={!shoppingList?.items || shoppingList.items.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Slet hele indkøbslisten"
                        >
                            <FiTrash2 />
                            Slet alt
                        </button>
                    </div>
                </div>

                {/* Loading state */}
                {loading && !error && (
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonItem key={i} />
                        ))}
                    </div>
                )}

                {/* Item-liste */}
                {!loading && shoppingList && (
                    <div className="flex flex-col gap-2">
                        {/* Ikke-købte items */}
                        {uncheckedItems.map((item) => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                onToggle={toogleItem}
                                onRemove={removeItem}
                            />
                        ))}

                        {/* Separator hvis der er købte items */}
                        {checkedItems.length > 0 && uncheckedItems.length > 0 && (
                            <div className="flex items-center gap-3 py-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">
                                    Købt ({checkedItems.length})
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                        )}

                        {/* Købte items */}
                        {checkedItems.map((item) => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                onToggle={toogleItem}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && shoppingList && (shoppingList.items?.length ?? 0) === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FiShoppingCart className="text-5xl mb-4" />
                        <p className="text-lg font-medium">Listen er tom</p>
                        <p className="text-sm mt-1">
                            Tilføj varer med feltet ovenfor
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShoppingListPage;