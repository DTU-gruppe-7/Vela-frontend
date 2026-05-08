import { useMemo, useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import type { ShoppingListItem, StoreOffer } from '../../../types/ShoppingList';
import { AssignmentMenu } from './AssignmentMenu';
import ShoppingItem from './ShoppingItem';
import OfferPickerModal from './OfferPickerModal';
import { groupItemsByCategory } from '../utils/groupItems';
import { formatShoppingQuantityLabel } from '../utils/quantityDisplay';

interface ItemsSectionProps {
  items: ShoppingListItem[];
  onToggle: (id: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
  onRemoveGroup: (itemIds: string[]) => Promise<void> | void;
  isPersonalList?: boolean;
  showAssignment?: boolean;
  assignees?: { userId: string; label: string }[];
  onAssign?: (itemId: string, assignedUserId: string | null) => Promise<void> | void;
  onAssignGroup?: (itemIds: string[], assignedUserId: string | null) => Promise<void> | void;
  offersByGroupKey?: Map<string, StoreOffer | undefined>;
  allOffersByGroupKey?: Map<string, StoreOffer[]>;
  onAcceptGroupOffer?: (groupKey: string, offerId: string) => Promise<void> | void;
}

function formatOfferSummary(offer: StoreOffer): string {
  const hasPackage =
    offer.packageQuantity != null &&
    offer.packageUnit &&
    !(offer.packageUnit === 'stk' && offer.packageQuantity === 1);
  if (hasPackage) {
    const qty = Number.isInteger(offer.packageQuantity)
      ? String(offer.packageQuantity)
      : offer.packageQuantity!.toLocaleString('da-DK', { maximumFractionDigits: 2 });
    return `${offer.productName} · ${qty} ${offer.packageUnit} · ${offer.price.toFixed(2)} kr`;
  }
  return `${offer.productName} · ${offer.price.toFixed(2)} kr`;
}

function ItemsSection({
  items,
  onToggle,
  onRemove,
  onRemoveGroup,
  isPersonalList = false,
  showAssignment = false,
  assignees = [],
  onAssign,
  onAssignGroup,
  offersByGroupKey,
  allOffersByGroupKey,
  onAcceptGroupOffer,
}: ItemsSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [offerModalGroupKey, setOfferModalGroupKey] = useState<string | null>(null);

  const groupedCategories = useMemo(() => groupItemsByCategory(items), [items]);

  const toggleGroupExpanded = (key: string): void => {
    setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const markGroupAsBought = async (groupItems: ShoppingListItem[]): Promise<void> => {
    const uncheckedIds = groupItems.filter((item) => !item.isBought).map((item) => item.id);
    for (const itemId of uncheckedIds) {
      await onToggle(itemId);
    }
  };

  const getGroupQuantityLabel = (groupItems: ShoppingListItem[], quantity: number, unitLabel: string): string => {
    if (quantity <= 0) {
      return `${groupItems.length} varer`;
    }
    const quantityLabel = formatShoppingQuantityLabel(quantity, unitLabel);
    return `${quantityLabel} (${groupItems.length} varer)`;
  };

  const getGroupAssignmentState = (groupItems: ShoppingListItem[]): { assignedUserId: string | null; isMixed: boolean } => {
    if (groupItems.length === 0) {
      return { assignedUserId: null, isMixed: false };
    }
    const firstAssignedUserId = groupItems[0].assignedUserId;
    const isUniform = groupItems.every((item) => item.assignedUserId === firstAssignedUserId);
    if (isUniform) {
      return { assignedUserId: firstAssignedUserId, isMixed: false };
    }
    return { assignedUserId: null, isMixed: true };
  };

  const handleGroupAssign = async (groupItems: ShoppingListItem[], assignedUserId: string | null): Promise<void> => {
    if (!onAssignGroup) return;
    await onAssignGroup(groupItems.map((item) => item.id), assignedUserId);
  };

  const activeModalGroup = offerModalGroupKey
    ? groupedCategories
        .flatMap((c) => c.groups)
        .find((g) => g.key === offerModalGroupKey)
    : null;
  const activeModalOffers = offerModalGroupKey ? (allOffersByGroupKey?.get(offerModalGroupKey) ?? []) : [];
  const activeModalBestOffer = offerModalGroupKey ? offersByGroupKey?.get(offerModalGroupKey) : undefined;

  return (
    <>
      <div className="flex flex-col gap-5">
        {groupedCategories.map((category) => (
          <section key={category.category} className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{category.label}</h2>

            <div className="flex flex-col gap-2">
              {category.groups.map((group) => {
                const isMultiItemGroup = group.items.length > 1;
                const canAssignGroup = showAssignment && isMultiItemGroup && Boolean(onAssignGroup);
                const groupAssignmentState = getGroupAssignmentState(group.items);
                const bestOffer = offersByGroupKey?.get(group.key);
                const allOffers = allOffersByGroupKey?.get(group.key) ?? [];

                if (group.items.length === 1) {
                  const item = group.items[0];
                  const canRemoveItem = !isPersonalList || !item.assignedUserId;
                  return (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggle={onToggle}
                      onRemove={onRemove}
                      canRemove={canRemoveItem}
                      showAssignment={showAssignment}
                      assignees={assignees}
                      onAssign={onAssign}
                      bestOffer={bestOffer}
                      allOffers={allOffers}
                      onAcceptOffer={onAcceptGroupOffer
                        ? (_itemId, offerId) => onAcceptGroupOffer(group.key, offerId)
                        : undefined}
                    />
                  );
                }

                const isExpanded = expandedGroups[group.key];
                const isGroupChecked = group.allBought;
                const groupQuantityLabel = getGroupQuantityLabel(group.items, group.totalQuantity, group.unitLabel);
                const canRemoveGroup = !isPersonalList || group.items.every((item) => !item.assignedUserId);

                return (
                  <div key={group.key} className="rounded-xl bg-white">
                    <div className="group flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:shadow-sm">
                      <button
                        type="button"
                        onClick={() => { void markGroupAsBought(group.items); }}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                          isGroupChecked
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                        title="Marker alle i gruppen som købt"
                      >
                        <FiCheck className={`text-xs ${isGroupChecked ? 'text-white' : 'text-gray-500'}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleGroupExpanded(group.key)}
                        className="flex flex-1 items-center justify-between text-left"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-medium capitalize text-gray-800">{group.name}</span>
                          <span className="ml-2 text-xs text-gray-400">{groupQuantityLabel}</span>
                          {bestOffer && (
                            <div className="mt-0.5 leading-tight">
                              <p className="text-xs font-medium text-emerald-700">{formatOfferSummary(bestOffer)}</p>
                              <p className="text-xs text-emerald-600/80">{bestOffer.storeName}</p>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-400">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</span>
                      </button>

                      {!isGroupChecked && allOffers.length > 0 && onAcceptGroupOffer && (
                        <button
                          type="button"
                          onClick={() => setOfferModalGroupKey(group.key)}
                          className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          Vælg tilbud
                        </button>
                      )}

                      {canAssignGroup && (
                        <AssignmentMenu
                          assignees={assignees}
                          assignedUserId={groupAssignmentState.assignedUserId}
                          enabled={showAssignment}
                          isMixed={groupAssignmentState.isMixed}
                          onAssign={(assignedUserId) => handleGroupAssign(group.items, assignedUserId)}
                          ariaLabel={`Åbn tildelingsmenu for hele gruppen ${group.name}`}
                          wrapperClassName="relative h-8 w-44 flex-shrink-0"
                        />
                      )}

                      {canRemoveGroup && (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Er du sikker på at du vil slette alle "${group.name}" varer (${group.items.length})? Dette kan ikke fortrydes.`,
                            );
                            if (!confirmed) return;
                            void onRemoveGroup(group.items.map((item) => item.id));
                          }}
                          className="shrink-0 p-1.5 text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                          aria-label="Fjern varegruppe"
                          title="Slet alle varer i gruppen"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="ml-8 flex flex-col gap-2 pb-2 pr-2">
                        {group.items.map((item) => (
                          <ShoppingItem
                            key={item.id}
                            item={item}
                            onToggle={onToggle}
                            onRemove={onRemove}
                            canRemove={!isPersonalList || !item.assignedUserId}
                            showAssignment={showAssignment && !isMultiItemGroup}
                            assignees={assignees}
                            onAssign={onAssign}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {offerModalGroupKey && activeModalGroup && activeModalOffers.length > 0 && (
        <OfferPickerModal
          ingredientName={activeModalGroup.name}
          offers={activeModalOffers}
          selectedOfferId={activeModalBestOffer?.id}
          onSelect={(offerId) => {
            void onAcceptGroupOffer?.(offerModalGroupKey, offerId);
            setOfferModalGroupKey(null);
          }}
          onClose={() => setOfferModalGroupKey(null)}
        />
      )}
    </>
  );
}

export default ItemsSection;
