import { useState, useMemo, useRef, useEffect } from 'react';
import {
    FiPlus,
    FiSearch,
    FiTrash2,
    FiChevronDown,
    FiChevronRight,
    FiShoppingCart,
    FiCheck,
} from 'react-icons/fi';
import ShoppingItem from './ShoppingItem';
import type { ShoppingItem as ShoppingItemType } from '../../types/ShoppingList';
import { ITEM_CATEGORIES, type ItemCategory } from '../../types/ShoppingList';
import { shoppingApi } from '../../api/shoppingApi';

// TODO: Replace with real group ID from auth/group context
const CURRENT_GROUP_ID = 'default';

function ShoppingListPage() {
    // ---- data state (same pattern as RecipePage) ----
    const [items, setItems] = useState<ShoppingItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ---- UI state ----
    const [searchQuery, setSearchQuery] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Andet');
    const [showAddForm, setShowAddForm] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const inputRef = useRef<HTMLInputElement>(null);

    // ---- fetch data on mount (same pattern as RecipePage) ----
    useEffect(() => {
        fetchShoppingList();
    }, []);

    const fetchShoppingList = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await shoppingApi.getShoppingList(CURRENT_GROUP_ID);
            setItems(data.items);
        } catch (err) {
            setError('Kunne ikke hente indkøbslisten. Prøv igen senere.');
            console.error('Error fetching shopping list:', err);
        } finally {
            setLoading(false);
        }
    };

    // Focus input when add-form opens
    useEffect(() => {
        if (showAddForm) inputRef.current?.focus();
    }, [showAddForm]);

    // ---- derived ----
    const filtered = useMemo(() => {
        if (!searchQuery) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q) ||
                i.recipeName?.toLowerCase().includes(q),
        );
    }, [items, searchQuery]);

    const grouped = useMemo(() => {
        const map = new Map<string, ShoppingItemType[]>();
        for (const cat of ITEM_CATEGORIES) {
            const catItems = filtered.filter((i) => i.category === cat);
            if (catItems.length > 0) map.set(cat, catItems);
        }
        // items with unknown categories
        const unknown = filtered.filter(
            (i) => !(ITEM_CATEGORIES as readonly string[]).includes(i.category),
        );
        if (unknown.length > 0) {
            map.set('Andet', [...(map.get('Andet') ?? []), ...unknown]);
        }
        return map;
    }, [filtered]);

    const totalCount = items.length;
    const checkedCount = items.filter((i) => i.checked).length;
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    // ---- handlers (optimistic updates + API calls) ----
    const toggleItem = async (id: string) => {
        const item = items.find((i) => i.id === id);
        if (!item) return;
        // Optimistic update
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
        );
        try {
            await shoppingApi.toggleItem(CURRENT_GROUP_ID, id, !item.checked);
        } catch {
            // Rollback on failure
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, checked: item.checked } : i)),
            );
        }
    };

    const removeItem = async (id: string) => {
        const prev = items;
        // Optimistic update
        setItems((curr) => curr.filter((i) => i.id !== id));
        try {
            await shoppingApi.removeItem(CURRENT_GROUP_ID, id);
        } catch {
            // Rollback on failure
            setItems(prev);
        }
    };

    const clearChecked = async () => {
        const prev = items;
        // Optimistic update
        setItems((curr) => curr.filter((i) => !i.checked));
        try {
            await shoppingApi.clearChecked(CURRENT_GROUP_ID);
        } catch {
            // Rollback on failure
            setItems(prev);
        }
    };

    const addItem = async () => {
        const name = newItemName.trim();
        if (!name) return;
        try {
            const created = await shoppingApi.addItem(CURRENT_GROUP_ID, {
                name,
                quantity: Number(newItemQty) || 0,
                unit: newItemUnit.trim(),
                category: newItemCategory,
            });
            setItems((prev) => [created, ...prev]);
            setNewItemName('');
            setNewItemQty('');
            setNewItemUnit('');
            inputRef.current?.focus();
        } catch (err) {
            console.error('Error adding item:', err);
        }
    };

    const toggleCategory = (cat: string) => {
        setCollapsedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // ---- skeleton loading (same pattern as RecipePage) ----
    const SkeletonItem = () => (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white animate-pulse">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
    );

    // ---- render ----
    return (
        <div className="min-h-screen bg-emerald-50/30">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                {/* ---------- Header ---------- */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <FiShoppingCart className="text-emerald-600" />
                        Indkøbsliste
                    </h1>
                    {checkedCount > 0 && (
                        <button
                            onClick={clearChecked}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                        >
                            <FiTrash2 className="text-sm" />
                            Ryd afkrydsede ({checkedCount})
                        </button>
                    )}
                </div>

                {/* ---------- Progress bar ---------- */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>{checkedCount} af {totalCount} varer afkrydset</span>
                        <span className="font-medium text-emerald-600">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* ---------- Search ---------- */}
                <div className="relative mb-4">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Søg varer, kategorier eller opskrifter…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition shadow-sm"
                    />
                </div>

                {/* ---------- Add-item form ---------- */}
                <div className="mb-6">
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition"
                        >
                            <FiPlus />
                            Tilføj vare
                        </button>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Varenavn *"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="Antal"
                                    value={newItemQty}
                                    onChange={(e) => setNewItemQty(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                                />
                                <input
                                    type="text"
                                    placeholder="Enhed"
                                    value={newItemUnit}
                                    onChange={(e) => setNewItemUnit(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                                />
                            </div>

                            {/* Category picker */}
                            <div className="flex flex-wrap gap-1.5">
                                {ITEM_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setNewItemCategory(cat)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                                            newItemCategory === cat
                                                ? 'bg-emerald-500 text-white border-emerald-500'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    onClick={addItem}
                                    disabled={!newItemName.trim()}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <FiCheck className="text-sm" />
                                    Tilføj
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewItemName('');
                                        setNewItemQty('');
                                        setNewItemUnit('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Annuller
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ---------- Grouped items ---------- */}
                {/* Error state (same pattern as RecipePage) */}
                {error && (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={fetchShoppingList}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
                        >
                            Prøv igen
                        </button>
                    </div>
                )}

                {/* Loading skeleton (same pattern as RecipePage) */}
                {loading && !error && (
                    <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonItem key={i} />
                        ))}
                    </div>
                )}

                {/* Content (only when not loading and no error) */}
                {!loading && !error && grouped.size === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FiShoppingCart className="text-5xl mb-4" />
                        <p className="text-lg font-medium">Listen er tom</p>
                        <p className="text-sm mt-1">
                            {searchQuery
                                ? 'Ingen varer matcher din søgning'
                                : 'Tilføj varer eller generer fra en opskrift'}
                        </p>
                    </div>
                )}

                {!loading && !error && (
                <div className="space-y-4">
                    {Array.from(grouped.entries()).map(([category, catItems]) => {
                        const isCollapsed = collapsedCategories.has(category);
                        const catChecked = catItems.filter((i) => i.checked).length;
                        const unchecked = catItems.filter((i) => !i.checked);
                        const checked = catItems.filter((i) => i.checked);
                        const sorted = [...unchecked, ...checked];

                        return (
                            <div key={category}>
                                {/* Category header */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="flex items-center gap-2 w-full px-1 py-2 group"
                                >
                                    {isCollapsed ? (
                                        <FiChevronRight className="text-gray-400 text-sm" />
                                    ) : (
                                        <FiChevronDown className="text-gray-400 text-sm" />
                                    )}
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        {category}
                                    </span>
                                    <span className="text-[10px] text-gray-400 ml-1">
                                        {catChecked}/{catItems.length}
                                    </span>
                                    <div className="flex-1 h-px bg-gray-200 ml-2" />
                                </button>

                                {/* Items */}
                                {!isCollapsed && (
                                    <div className="space-y-1 ml-1">
                                        {sorted.map((item) => (
                                            <ShoppingItem
                                                key={item.id}
                                                item={item}
                                                onToggle={toggleItem}
                                                onRemove={removeItem}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                )}

                {/* ---------- Footer summary ---------- */}
                {!loading && !error && totalCount > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-8">
                        {totalCount} {totalCount === 1 ? 'vare' : 'varer'} i alt ·{' '}
                        {checkedCount} afkrydset
                    </p>
                )}
            </div>
        </div>
    );
}

export default ShoppingListPage;
