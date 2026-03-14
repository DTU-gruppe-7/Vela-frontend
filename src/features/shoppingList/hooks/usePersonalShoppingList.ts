import { useMemo } from 'react';
import { useShoppingLists } from './useShoppingLists';
import { useShoppingList } from './useShoppingList';

export function usePersonalShoppingList() {
    const { shoppingLists, loading: listsLoading, error: listsError } = useShoppingLists();

    const personalListId = useMemo(() => {
        return shoppingLists.find(l => !l.groupId)?.id;
    }, [shoppingLists]);

    const {
        shoppingList,
        loading: detailLoading,
        error: detailError,
        ...actions
    } = useShoppingList(personalListId);

    return {
        personalListId,
        shoppingList,
        loading: listsLoading || detailLoading,
        error: listsError || detailError,
        ...actions,
    };
}
