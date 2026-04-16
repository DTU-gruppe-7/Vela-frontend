import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { AddShoppingListItem } from '../../../types/ShoppingList';
import { useShoppingList } from '../hooks/useShoppingList';
import AddItemForm from '../components/add-item/AddItemForm';
import ItemsSection from '../components/ItemsSection';
import { EmptyListState, ErrorBanner, LoadingList } from '../components/ListStates';
import Toolbar from '../components/Toolbar';
import { shoppingListApi } from '../../../api/shoppingListApi';
import { groupApi } from '../../../api/groupApi';
import type { GroupMember } from '../../../types/Group';
import { getGroupMemberDisplayName } from '../../../utils/groupMemberDisplay';

function ShoppingListPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const { shoppingList, loading, error, addItem, toogleItem, removeItem, assignItem, refetch } = useShoppingList(groupId);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

    useEffect(() => {
        if (!groupId) {
            setGroupMembers([]);
            return;
        }

        let isCancelled = false;

        const fetchGroupMembers = async () => {
            try {
                const group = await groupApi.getGroup(groupId);
                if (!isCancelled) {
                    setGroupMembers(group.members ?? []);
                }
            } catch (err) {
                console.error('Fejl ved hentning af gruppemedlemmer:', err);
                if (!isCancelled) {
                    setGroupMembers([]);
                }
            }
        };

        void fetchGroupMembers();

        return () => {
            isCancelled = true;
        };
    }, [groupId]);

    const assignees = useMemo(
        () => groupMembers.map((member) => ({
            userId: member.userId,
            label: getGroupMemberDisplayName(member),
        })),
        [groupMembers],
    );

    const handleAddItem = async (item: AddShoppingListItem): Promise<void> => {
        await addItem(item);
    };

    const handleClearAll = async () => {
        if (!shoppingList?.id) return;

        const itemIds = (shoppingList.items ?? []).map((item) => item.id);
        if (itemIds.length === 0) return;

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

        const purchasedItemIds = (shoppingList.items ?? [])
            .filter((item) => item.isBought)
            .map((item) => item.id);
        if (purchasedItemIds.length === 0) return;

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

    const handleRemoveGroup = async (itemIds: string[]): Promise<void> => {
        if (!shoppingList?.id || itemIds.length === 0) return;

        try {
            const results = await Promise.allSettled(
                itemIds.map((itemId) => shoppingListApi.removeItem(shoppingList.id, itemId)),
            );

            await refetch();

            if (results.some((result) => result.status === 'rejected')) {
                alert('Nogle varer kunne ikke slettes. Prøv igen.');
            }
        } catch (err) {
            console.error('Fejl ved sletning af gruppevarer:', err);
            alert('Der skete en fejl ved sletning af gruppevarer');
        }
    };

    const items = shoppingList?.items ?? [];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                {error && <ErrorBanner error={error} />}

                <AddItemForm onAddItem={handleAddItem} />

                <Toolbar
                    hasCheckedItems={items.some((item) => item.isBought)}
                    hasItems={items.length > 0}
                    onDeleteChecked={() => {
                        void handleDeleteChecked();
                    }}
                    onClearAll={() => {
                        void handleClearAll();
                    }}
                />

                {loading && !error && <LoadingList />}

                {!loading && shoppingList && (
                    <ItemsSection
                        items={items}
                        onToggle={toogleItem}
                        onRemove={removeItem}
                        onRemoveGroup={handleRemoveGroup}
                        showAssignment={Boolean(groupId)}
                        assignees={assignees}
                        onAssign={assignItem}
                    />
                )}

                {!loading && shoppingList && items.length === 0 && <EmptyListState />}
            </div>
        </div>
    );
}

export default ShoppingListPage;

