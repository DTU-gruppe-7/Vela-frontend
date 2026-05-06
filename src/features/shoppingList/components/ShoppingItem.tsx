import { useState } from 'react';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import type { ShoppingListItem, StoreOffer } from '../../../types/ShoppingList';
import { AssignmentMenu } from './AssignmentMenu';
import OfferPickerModal from './OfferPickerModal';
import QuantityLabel from './QuantityLabel';

interface ShoppingItemProps {
    item: ShoppingListItem;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    canRemove?: boolean;
    showAssignment?: boolean;
    assignees?: { userId: string; label: string }[];
    onAssign?: (itemId: string, assignedUserId: string | null) => Promise<void> | void;
    bestOffer?: StoreOffer;
    allOffers?: StoreOffer[];
    onAcceptOffer?: (itemId: string, offerId: string) => Promise<void> | void;
}

function formatQuantity(quantity: number, unit: string): string {
    const formatted = Number.isInteger(quantity)
        ? quantity.toString()
        : quantity.toLocaleString('da-DK', { maximumFractionDigits: 2 });
    return `${formatted} ${unit}`;
}

function ShoppingItem({
    item,
    onToggle,
    onRemove,
    canRemove = true,
    showAssignment = false,
    assignees = [],
    onAssign,
    bestOffer,
    allOffers,
    onAcceptOffer,
}: ShoppingItemProps) {
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const recipeName = item.recipeName?.trim();
    const hasRecipeName =
        Boolean(recipeName) &&
        recipeName?.toLowerCase() !== 'null' &&
        recipeName?.toLowerCase() !== 'undefined' &&
        recipeName?.toLowerCase() !== '()';

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.isBought
                    ? 'bg-gray-50 opacity-60'
                    : 'bg-white hover:shadow-sm'
            }`}
        >
            {/* Checkbox */}
            <button
                type="button"
                onClick={() => onToggle(item.id)}
                className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    item.isBought
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400'
                }`}
            >
                {item.isBought && <FiCheck className="text-xs" />}
            </button>

            {/* Item info */}
            <div className="flex-1 min-w-0">
                <span
                    className={`text-sm font-medium transition-all duration-200 capitalize ${
                        item.isBought
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                    }`}
                >
                    {item.ingredientName}
                </span>
                {(item.quantity > 0 || item.unit) && (
                    <QuantityLabel
                        quantity={item.quantity}
                        unit={item.unit}
                        className="ml-2 text-xs text-gray-400"
                    />
                )}
                {hasRecipeName && (
                    <p className="mt-1 text-xs text-gray-500">
                        Fra opskrift:{' '}
                        <span className="font-medium text-gray-600">
                            {recipeName}
                        </span>
                    </p>
                )}
                {bestOffer && (
                    <div className="mt-1 leading-tight">
                        <p className="text-xs font-medium text-emerald-700">
                            {bestOffer.productName}
                            {bestOffer.packageQuantity && bestOffer.packageUnit && !(bestOffer.packageUnit === 'stk' && bestOffer.packageQuantity === 1)
                                ? ` · ${formatQuantity(bestOffer.packageQuantity, bestOffer.packageUnit)} · ${bestOffer.price.toFixed(2)} kr`
                                : ` · ${bestOffer.price.toFixed(2)} kr`}
                        </p>
                        <p className="text-xs text-emerald-600/80">{bestOffer.storeName}</p>
                    </div>
                )}
            </div>

            <AssignmentMenu
                assignees={assignees}
                assignedUserId={item.assignedUserId}
                enabled={showAssignment}
                onAssign={onAssign ? (assignedUserId: string | null) => onAssign(item.id, assignedUserId) : undefined}
                ariaLabel="Åbn tildelingsmenu"
            />

            {!item.isBought && allOffers && allOffers.length > 0 && onAcceptOffer && (
                <>
                    <button
                        type="button"
                        onClick={() => setOfferModalOpen(true)}
                        className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        Vælg tilbud
                    </button>
                    {offerModalOpen && (
                        <OfferPickerModal
                            ingredientName={item.ingredientName}
                            offers={allOffers}
                            selectedOfferId={bestOffer?.id}
                            onSelect={(offerId) => void onAcceptOffer(item.id, offerId)}
                            onClose={() => setOfferModalOpen(false)}
                        />
                    )}
                </>
            )}

            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 p-1.5 text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    aria-label="Fjern vare"
                >
                    <FiTrash2 className="text-sm" />
                </button>
            )}
        </div>
    );
}

export default ShoppingItem;
