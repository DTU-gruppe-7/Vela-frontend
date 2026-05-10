import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { StoreOffer, AddShoppingListItem } from '../../../types/ShoppingList';
import { useShoppingList } from '../hooks/useShoppingList';
import AddItemForm from '../components/add-item/AddItemForm';
import ItemsSection from '../components/ItemsSection';
import { EmptyListState, ErrorBanner, LoadingList } from '../components/ListStates';
import Toolbar from '../components/Toolbar';
import OffersPanel from '../components/OffersPanel';
import { shoppingListApi } from '../../../api/shoppingListApi';
import { groupApi } from '../../../api/groupApi';
import type { GroupMember } from '../../../types/Group';
import { getGroupMemberDisplayName } from '../../../utils/groupMemberDisplay';

function ShoppingListPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const {
        shoppingList,
        loading,
        error,
        addItem,
        toogleItem,
        removeItem,
        handleAssignMember,
        assignGroupItems,
        offersOverview,
        acceptGroupOffer,
        refetch,
    } = useShoppingList(groupId);
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
    const isPersonalList = !groupId;

    useEffect(() => {
        if (!groupId) {
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

    const visibleGroupMembers = useMemo<GroupMember[]>(() => (groupId ? groupMembers : []), [groupId, groupMembers]);

    const allStoreNames = useMemo<string[]>(() => {
        const names = new Set<string>();
        for (const groupOffer of offersOverview?.groups ?? []) {
            for (const offer of groupOffer.offers) names.add(offer.storeName);
        }
        // Ekskluderede butikker kendes fra listen, selvom backend filtrerer dem fra offers
        for (const storeName of shoppingList?.excludedStores ?? []) {
            names.add(storeName);
        }
        return Array.from(names).sort();
    }, [offersOverview, shoppingList?.excludedStores]);

    // Excluded stores are persisted via backend. Derive selected stores as the
    // inverse: all known stores minus the excluded ones.
    const excludedStores = useMemo<Set<string>>(
        () => new Set(shoppingList?.excludedStores ?? []),
        [shoppingList?.excludedStores],
    );

    const displayedSelectedStores = useMemo<Set<string>>(() => {
        return new Set(allStoreNames.filter((s) => !excludedStores.has(s)));
    }, [allStoreNames, excludedStores]);

    const handleToggleStore = async (storeName: string): Promise<void> => {
        if (!shoppingList?.id) return;
        if (excludedStores.has(storeName)) {
            await shoppingListApi.removeExcludedStore(shoppingList.id, storeName);
        } else {
            await shoppingListApi.addExcludedStore(shoppingList.id, storeName);
        }
        await refetch();
    };

    const allFilteredOffersByGroupKey = useMemo<Map<string, StoreOffer[]>>(() => {
        if (!offersOverview) return new Map();
        return new Map(offersOverview.groups.map((groupOffer) => {
            const eligible = displayedSelectedStores.size === 0
                ? groupOffer.offers
                : groupOffer.offers.filter((o) => displayedSelectedStores.has(o.storeName));
            return [groupOffer.groupKey, eligible];
        }));
    }, [offersOverview, displayedSelectedStores]);

    const filteredOffersByGroupKey = useMemo<Map<string, StoreOffer | undefined>>(() => {
        return new Map(Array.from(allFilteredOffersByGroupKey.entries()).map(([groupKey, eligible]) => {
            const storedBestOffer = offersOverview?.groups.find((g) => g.groupKey === groupKey)?.bestOffer;
            if (storedBestOffer && eligible.some((o) => o.id === storedBestOffer.id)) {
                return [groupKey, storedBestOffer];
            }
            const cheapest = eligible.reduce<StoreOffer | undefined>(
                (best, o) => (!best || o.price < best.price ? o : best),
                undefined,
            );
            return [groupKey, cheapest];
        }));
    }, [allFilteredOffersByGroupKey, offersOverview]);

    const filteredSummary = useMemo(() => {
        let total = 0;
        let covered = 0;
        let uncovered = 0;
        for (const offer of filteredOffersByGroupKey.values()) {
            if (offer) { total += offer.price; covered++; }
            else { uncovered++; }
        }
        return { total, covered, uncovered };
    }, [filteredOffersByGroupKey]);

    const assignees = useMemo(
        () => visibleGroupMembers.map((member) => ({
            userId: member.userId,
            label: getGroupMemberDisplayName(member),
        })),
        [visibleGroupMembers],
    );

    const handleAddItem = async (item: AddShoppingListItem): Promise<void> => {
        await addItem(item);
    };

    const deleteRemovableItems = async (itemIds: string[]): Promise<void> => {
        if (!shoppingList?.id || itemIds.length === 0) return;

        const deletableItemIds = isPersonalList
            ? itemIds.filter((itemId) => {
                const item = (shoppingList.items ?? []).find((candidate) => candidate.id === itemId);
                return !item?.assignedUserId;
            })
            : itemIds;

        const skippedAssignedItems = isPersonalList && deletableItemIds.length !== itemIds.length;

        if (deletableItemIds.length === 0) {
            if (skippedAssignedItems) {
                alert('Tildelte varer kan ikke slettes i den personlige indkøbsliste.');
            }

            return;
        }

        const results = await Promise.allSettled(
            deletableItemIds.map((itemId) => shoppingListApi.removeItem(shoppingList.id, itemId)),
        );

        await refetch();

        const hasFailures = results.some((result) => result.status === 'rejected');

        if (hasFailures && skippedAssignedItems) {
            alert('Nogle varer kunne ikke slettes, og tildelte varer blev bevaret.');
        } else if (hasFailures) {
            alert('Nogle varer kunne ikke slettes. Prøv igen.');
        } else if (skippedAssignedItems) {
            alert('Tildelte varer kan ikke slettes i den personlige indkøbsliste.');
        }
    };

    const handleClearAll = async () => {
        if (!shoppingList?.id) return;

        const itemIds = (shoppingList.items ?? []).map((item) => item.id);
        if (itemIds.length === 0) return;

        const confirmed = window.confirm('Er du sikker på at du vil slette hele din indkøbsliste? Dette kan ikke fortrydes.');

        if (!confirmed) return;

        try {
            await deleteRemovableItems(itemIds);
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
            await deleteRemovableItems(purchasedItemIds);
        } catch (err) {
            console.error('Fejl ved sletning af købte varer:', err);
            alert('Der skete en fejl ved sletning af købte varer');
        }
    };

    const handleRemoveGroup = async (itemIds: string[]): Promise<void> => {
        if (!shoppingList?.id || itemIds.length === 0) return;

        try {
            await deleteRemovableItems(itemIds);
        } catch (err) {
            console.error('Fejl ved sletning af gruppevarer:', err);
            alert('Der skete en fejl ved sletning af gruppevarer');
        }
    };

    const items = shoppingList?.items ?? [];
    const hasOnlyAssignedItems = isPersonalList && items.length > 0 && items.every((item) => Boolean(item.assignedUserId));

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-screen-2xl px-4 pt-2 pb-10 sm:px-6 sm:pt-3 lg:px-8">
                {error && <ErrorBanner error={error} />}

                <AddItemForm onAddItem={handleAddItem} />
                <OffersPanel
                    groups={offersOverview?.groups ?? []}
                    allStoreNames={allStoreNames}
                    selectedStores={displayedSelectedStores}
                    onToggleStore={handleToggleStore}
                    onSelectAll={() => {
                        if (!shoppingList?.id) return;
                        void Promise.all(
                            Array.from(excludedStores).map((s) =>
                                shoppingListApi.removeExcludedStore(shoppingList.id, s),
                            ),
                        ).then(() => refetch());
                    }}
                    onDeselectAll={() => {
                        if (!shoppingList?.id) return;
                        void Promise.all(
                            allStoreNames
                                .filter((s) => !excludedStores.has(s))
                                .map((s) => shoppingListApi.addExcludedStore(shoppingList.id, s)),
                        ).then(() => refetch());
                    }}
                    filteredTotal={filteredSummary.total}
                    coveredItemCount={filteredSummary.covered}
                    uncoveredItemCount={filteredSummary.uncovered}
                />

                <Toolbar
                    hasCheckedItems={items.some((item) => item.isBought)}
                    hasItems={items.length > 0}
                    disableBulkActions={hasOnlyAssignedItems}
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
                        isPersonalList={isPersonalList}
                        showAssignment={Boolean(groupId)}
                        assignees={assignees}
                        onAssign={handleAssignMember}
                        onAssignGroup={assignGroupItems}
                        offersByGroupKey={filteredOffersByGroupKey}
                        allOffersByGroupKey={allFilteredOffersByGroupKey}
                        onAcceptGroupOffer={acceptGroupOffer}
                    />
                )}

                {!loading && shoppingList && items.length === 0 && <EmptyListState />}
            </div>
        </div>
    );
}

export default ShoppingListPage;
