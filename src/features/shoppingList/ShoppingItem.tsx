import { FiCheck, FiTrash2 } from 'react-icons/fi';
import type { ShoppingListItem } from '../../types/ShoppingList';

interface ShoppingItemProps {
    item: ShoppingListItem;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
}

function ShoppingItem({ item, onToggle, onRemove }: ShoppingItemProps) {
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
                onClick={() => onToggle(item.id)}
                className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
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
                    className={`text-sm font-medium transition-all duration-200 ${
                        item.isBought
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                    }`}
                >
                    {item.ingredientName}
                </span>
                {(item.quantity > 0 || item.unit) && (
                    <span className="ml-2 text-xs text-gray-400">
                        {item.quantity > 0 && item.quantity} {item.unit}
                    </span>
                )}
            </div>

            {/* Delete */}
            <button
                onClick={() => onRemove(item.id)}
                className="flex-shrink-0 p-1.5 text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                aria-label="Fjern vare"
            >
                <FiTrash2 className="text-sm" />
            </button>
        </div>
    );
}

export default ShoppingItem;
