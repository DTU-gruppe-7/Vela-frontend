import { useState, useEffect, useCallback } from 'react';
import { shoppingListApi } from '../../../api/shoppingListApi';
import type { ShoppingListSummary, ShoppingListCreate } from '../../../types/ShoppingList';

export function useShoppingLists() {
    const [shoppingLists, setShoppingLists] = useState<ShoppingListSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShoppingLists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await shoppingListApi.getAllShoppingLists();
            setShoppingLists(data);
        } catch (err) {
            console.error('Error retrieving shopping lists:', err);
            setError('Kunne ikke hente indkøbslister. Prøv igen senere.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShoppingLists();
    }, [fetchShoppingLists]);

    const createShoppingList = useCallback(async (data: ShoppingListCreate): Promise<ShoppingListSummary | null> => {
        try {
            const created = await shoppingListApi.createShoppingList(data);
            // Optimistisk: tilføj til listen med det samme
            setShoppingLists(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Error creating the shopping list:', err);
            setError('Kunne ikke oprette indkøbslisten.');
            return null;
        }
    }, []);

    const deleteShoppingList = useCallback(async (id: string): Promise<boolean> => {
        try{
            await shoppingListApi.deleteShoppingList(id);
            setShoppingLists(prev => prev.filter(list => list.id !== id));
            return true;
        } catch (err) {
            console.error('Error deleting shopping list:', err);
            setError('Kunne ikke slette indkøbslisten.');
            return false;
        }
    }, []);

    return { shoppingLists, loading, error, refetch: fetchShoppingLists, createShoppingList, deleteShoppingList };
}