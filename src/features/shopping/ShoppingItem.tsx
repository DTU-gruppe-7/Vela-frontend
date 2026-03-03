import { FiCheck, FiTrash2 } from 'react-icons/fi';
import type { ShoppingItem as ShoppingItemType } from '../../types/ShoppingList';

interface ShoppingItemProps {
    item: ShoppingItemType;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
}

function ShoppingItem({ item, onToggle, onRemove }: ShoppingItemProps) {
    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.checked
                    ? 'bg-gray-50 opacity-60'
                    : 'bg-white hover:shadow-sm'
            }`}
        >
            {/* Checkbox */}
            <button
                onClick={() => onToggle(item.id)}
                className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    item.checked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400'
                }`}
            >
                {item.checked && <FiCheck className="text-xs" />}
            </button>

            {/* Item info */}
            <div className="flex-1 min-w-0">
                <span
                    className={`text-sm font-medium transition-all duration-200 ${
                        item.checked
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                    }`}
                >
                    {item.name}
                </span>
                {(item.quantity > 0 || item.unit) && (
                    <span className="ml-2 text-xs text-gray-400">
                        {item.quantity > 0 && item.quantity} {item.unit}
                    </span>
                )}
            </div>

            {/* Recipe source badge */}
            {item.recipeName && (
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 rounded-full truncate max-w-[120px]">
                    {item.recipeName}
                </span>
            )}

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
