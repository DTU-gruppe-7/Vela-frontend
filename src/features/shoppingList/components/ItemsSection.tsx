import { useMemo, useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import type { ShoppingListItem } from '../../../types/ShoppingList';
import ShoppingItem from './ShoppingItem';
import { groupItemsByCategory } from '../utils/groupItems';
import { formatShoppingQuantityLabel } from '../utils/quantityDisplay';

interface ItemsSectionProps {
  items: ShoppingListItem[];
  onToggle: (id: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
  onRemoveGroup: (itemIds: string[]) => Promise<void> | void;
  showAssignment?: boolean;
  assignees?: { userId: string; label: string }[];
  onAssign?: (itemId: string, assignedUserId: string | null) => Promise<void> | void;
}

function ItemsSection({
  items,
  onToggle,
  onRemove,
  onRemoveGroup,
  showAssignment = false,
  assignees = [],
  onAssign,
}: ItemsSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  return (
    <div className="flex flex-col gap-5">
      {groupedCategories.map((category) => (
        <section key={category.category} className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{category.label}</h2>

          <div className="flex flex-col gap-2">
            {category.groups.map((group) => {
              if (group.items.length === 1) {
                const item = group.items[0];
                return (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={onToggle}
                    onRemove={onRemove}
                    showAssignment={showAssignment}
                    assignees={assignees}
                    onAssign={onAssign}
                  />
                );
              }

              const isExpanded = !!expandedGroups[group.key];
              const isGroupChecked = group.allBought;
              const groupQuantityLabel = getGroupQuantityLabel(group.items, group.totalQuantity, group.unitLabel);

              return (
                <div key={group.key} className="rounded-xl bg-white">
                  <div className="group flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        void markGroupAsBought(group.items);
                      }}
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
                      </div>
                      <span className="text-gray-400">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Er du sikker på at du vil slette alle "${group.name}" varer (${group.items.length})? Dette kan ikke fortrydes.`,
                        );

                        if (!confirmed) return;
                        void onRemoveGroup(group.items.map((item) => item.id));
                      }}
                      className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-red-200 text-red-500 transition-all duration-200 hover:border-red-300 hover:bg-red-50"
                      title="Slet alle varer i gruppen"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-8 flex flex-col gap-2 pb-2 pr-2">
                      {group.items.map((item) => (
                        <ShoppingItem
                          key={item.id}
                          item={item}
                          onToggle={onToggle}
                          onRemove={onRemove}
                          showAssignment={showAssignment}
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
  );
}

export default ItemsSection;

