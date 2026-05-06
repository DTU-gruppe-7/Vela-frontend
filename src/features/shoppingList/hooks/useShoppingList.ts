import { useState, useEffect, useCallback } from "react";
import { shoppingListApi } from "../../../api/shoppingListApi.ts";
import type {
    ShoppingList,
    ShoppingListItem,
    AddShoppingListItem,
    ShoppingListOfferOverview,
} from "../../../types/ShoppingList.ts";

export function useShoppingList(groupId?: string) {
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offersOverview, setOffersOverview] = useState<ShoppingListOfferOverview | null>(null);

    const fetchShoppingList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await shoppingListApi.getShoppingList(groupId);
            setShoppingList({ ...data, items: data.items ?? [] });
            const offers = await shoppingListApi.getOffers(data.id);
            setOffersOverview(offers);
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
                return {
                    ...prev,
                    items: (prev.items ?? []).map(i => i.id === tempItem.id ? savedItem : i),
                };
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

        if (!groupId && removedItem?.assignedUserId) {
            setError('Tildelte varer kan ikke slettes i den personlige indkøbsliste.');
            return;
        }

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
    }, [groupId, shoppingList]);

    const handleAssignMember = useCallback(async (itemId: string, userId: string | null) => {
        if (!shoppingList || !itemId) return;

        const currentItem = (shoppingList.items ?? []).find((item) => item.id === itemId);
        if (!currentItem) return;

        const updatedItem: ShoppingListItem = {
            ...currentItem,
            assignedUserId: userId,
        };

        setShoppingList((prev) => prev
            ? { ...prev, items: (prev.items ?? []).map((item) => item.id === itemId ? updatedItem : item) }
            : prev
        );

        try {
            await shoppingListApi.assignItem(shoppingList.id, itemId, userId);
        } catch (err) {
            console.error('Error assigning item: ', err);
            setError('Kunne ikke tildele varen.');
            setShoppingList((prev) => prev
                ? { ...prev, items: (prev.items ?? []).map((item) => item.id === itemId ? currentItem : item) }
                : prev
            );
        }
    }, [shoppingList]);

    const assignGroupItems = useCallback(async (itemIds: string[], userId: string | null) => {
        if (!shoppingList || itemIds.length === 0) return;

        const itemIdSet = new Set(itemIds);
        const currentItems = shoppingList.items ?? [];
        const previousItems = currentItems.map((item) => ({ ...item }));

        setShoppingList((prev) => prev
            ? {
                ...prev,
                items: (prev.items ?? []).map((item) => itemIdSet.has(item.id)
                    ? { ...item, assignedUserId: userId }
                    : item),
            }
            : prev
        );

        try {
            const results = await Promise.allSettled(
                itemIds.map((itemId) => shoppingListApi.assignItem(shoppingList.id, itemId, userId)),
            );
            const hasFailures = results.some((result) => result.status === 'rejected');

            if (hasFailures) {
                console.error('Error assigning group items: ', results);
            }

            if (hasFailures) {
                setShoppingList((prev) => prev
                    ? { ...prev, items: previousItems }
                    : prev
                );
                setError('Kunne ikke tildele alle varerne i gruppen.');
            }
        } catch (err) {
            console.error('Error assigning group items: ', err);
            setShoppingList((prev) => prev
                ? { ...prev, items: previousItems }
                : prev
            );
            setError('Kunne ikke tildele alle varerne i gruppen.');
        }
    }, [shoppingList]);

    const acceptItemOffer = useCallback(async (itemId: string, offerId: string) => {
        if (!shoppingList) return;

        try {
            const updatedItem = await shoppingListApi.acceptOffer(shoppingList.id, itemId, offerId);
            setShoppingList((prev) => prev
                ? { ...prev, items: (prev.items ?? []).map((item) => item.id === itemId ? updatedItem : item) }
                : prev
            );
            const offers = await shoppingListApi.getOffers(shoppingList.id);
            setOffersOverview(offers);
        } catch (err) {
            console.error('Error accepting offer: ', err);
            setError('Kunne ikke anvende tilbuddet.');
        }
    }, [shoppingList]);

    const applyOfferStrategy = useCallback(async (strategy: string) => {
        if (!shoppingList) return;

        try {
            await shoppingListApi.applyOfferStrategy(shoppingList.id, strategy);
            await fetchShoppingList();
        } catch (err) {
            console.error('Error applying strategy: ', err);
            setError('Kunne ikke anvende tilbudsstrategien.');
        }
    }, [fetchShoppingList, shoppingList]);

    return {
        shoppingList,
        offersOverview,
        loading,
        error,
        addItem,
        toogleItem,
        removeItem,
        handleAssignMember,
        assignGroupItems,
        acceptItemOffer,
        applyOfferStrategy,
        assignItem: handleAssignMember,
        refetch: fetchShoppingList,
    };
}
