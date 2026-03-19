import { useState, useEffect } from 'react';
import { FiPlus, FiShoppingCart, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import type { ShoppingListItem } from '../../types/ShoppingList';
import { usePersonalShoppingList } from './hooks/usePersonalShoppingList';
import ShoppingItem from './ShoppingItem';
import type { AddShoppingListItem } from '../../types/ShoppingList';

function ShoppingListDetailPage() {
    const {
        personalListId,
        shoppingList,
        loading,
        error,
        addItem,
        toogleItem,
        removeItem,
    } = usePersonalShoppingList();

    // Form state for nyt item
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');

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

    const handleAddItem = async () => {
        const name = newItemName.trim();
        if (!name) return;

        const newItem: AddShoppingListItem = {
            ingredientName: name,
            quantity: parseFloat(newItemQuantity) || 0,
            unit: newItemUnit.trim(),
        };

        await addItem(newItem);
        setNewItemName('');
        setNewItemQuantity('');
        setNewItemUnit('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAddItem();
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
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {shoppingList?.name || 'Indkøbsliste'}
                    </h1>
                </div>

                {/* Error state */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Tilføj nyt item */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Tilføj vare..."
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                        />
                        <input
                            type="number"
                            placeholder="Antal"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-20 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                        />
                        <input
                            type="text"
                            placeholder="Enhed"
                            value={newItemUnit}
                            onChange={(e) => setNewItemUnit(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-20 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                        />
                        <button
                            onClick={handleAddItem}
                            disabled={!newItemName.trim()}
                            className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <FiPlus className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Sortering */}
                <div className="flex items-center gap-3 mb-4 px-1">
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

                {/* Ingen personlig liste fundet */}
                {!loading && !personalListId && !error && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FiShoppingCart className="text-5xl mb-4" />
                        <p className="text-lg font-medium">Ingen indkøbsliste fundet</p>
                        <p className="text-sm mt-1">
                            Du har endnu ikke en personlig indkøbsliste.
                        </p>
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

export default ShoppingListDetailPage;