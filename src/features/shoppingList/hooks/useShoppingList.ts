import { useState, useEffect, useCallback } from "react";
import { shoppingListApi } from "../../../api/shoppingListApi.ts";
import type { ShoppingList, ShoppingListItem, AddShoppingListItem } from "../../../types/ShoppingList.ts";

export function useShoppingList(groupId?: string) {
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShoppingList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await shoppingListApi.getShoppingList(groupId);
            setShoppingList({ ...data, items: data.items ?? [] });
        } catch (err) {
            console.error('Error loading the list: ', err);
            setError('Kunne ikke hente indkøbslisten. Prøv igen senere.');
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchShoppingList();
    }, [fetchShoppingList, groupId]);

    const addItem = useCallback(async (item: AddShoppingListItem) => {
        if (!shoppingList) return;

        const tempItem: ShoppingListItem = {
            ...item,
            id: `Temp-${Date.now()}`,
            isBought: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setShoppingList(prev => prev
            ? {...prev, items: [...(prev.items ?? []), tempItem]}
            : prev
        );
        try {
            const savedItem = await shoppingListApi.addItem(shoppingList.id, item);
            setShoppingList(prev => {
                if (!prev) return prev;
                const filteredItems = (prev.items ?? []).filter(
                    i => i.id !== tempItem.id &&
                        i.ingredientName.toLowerCase() !== savedItem.ingredientName.toLowerCase()
                )
                return {...prev, items: [...filteredItems, savedItem]};
            });
        } catch (err) {
            console.error('Error adding item: ', err);
            setError('Kunne ikke tilføje varen.');
            // Rul tilbage: fjern det optimistisk tilføjede item
            setShoppingList(prev => prev
                ? { ...prev, items: (prev.items ?? []).filter(i => i.id !== tempItem.id) }
                : prev
            );
        }
    }, [shoppingList]);

    const toogleItem = useCallback(async (itemId: string) => {
        if (!shoppingList || !itemId) return;

        const items = shoppingList.items ?? [];
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newIsBought = !item.isBought;
        const updatedItem = { ...item, isBought: newIsBought };

        setShoppingList(prev => prev
            ? { ...prev, items: (prev.items ?? []).map(i => i.id === itemId ? updatedItem : i) }
            : prev
        );

        try {
            await shoppingListApi.updateItem(shoppingList.id, itemId, updatedItem);
        } catch (err) {
            console.error('Error updating an item: ', err);
            setError('Kunne ikke opdatere varen.');
            setShoppingList(prev => prev
                ? { ...prev, items: (prev.items ?? []).map(i => i.id === itemId ? { ...i, isBought: !newIsBought } : i) }
                : prev
            );
        }
    }, [shoppingList]);

    const removeItem = useCallback(async (itemId: string) => {
        if (!shoppingList || !itemId) return;

        const items = shoppingList.items ?? [];
        const removedItem = items.find(i => i.id === itemId);

        setShoppingList(prev => prev
            ? { ...prev, items: (prev.items ?? []).filter(i => i.id !== itemId) }
            : prev
        );

        try {
            await shoppingListApi.removeItem(shoppingList.id, itemId);
        } catch (err) {
            console.error('Error removing the item', err);
            setError('Kunne ikke fjerne varen.');
            if (removedItem) {
                setShoppingList(prev => prev
                    ? { ...prev, items: [...(prev.items ?? []), removedItem] }
                    : prev
                );
            }
        }
    }, [shoppingList]);

    return {
        shoppingList,
        loading,
        error,
        addItem,
        toogleItem,
        removeItem,
        refetch: fetchShoppingList,
    };
}