import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiTrash2, FiUser } from 'react-icons/fi';
import type { ShoppingListItem } from '../../../types/ShoppingList';
import QuantityLabel from './QuantityLabel';
import { getDisplayInitials } from '../../../utils/groupMemberDisplay';

interface ShoppingItemProps {
    item: ShoppingListItem;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    showAssignment?: boolean;
    assignees?: { userId: string; label: string }[];
    onAssign?: (itemId: string, assignedUserId: string | null) => Promise<void> | void;
}

function ShoppingItem({ item, onToggle, onRemove, showAssignment = false, assignees = [], onAssign,}: ShoppingItemProps) {
    const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
    const assignMenuRef = useRef<HTMLDivElement | null>(null);
    const recipeName = item.recipeName?.trim();
    const hasRecipeName =
        Boolean(recipeName) &&
        recipeName?.toLowerCase() !== 'null' &&
        recipeName?.toLowerCase() !== 'undefined' &&
        recipeName?.toLowerCase() !== '()';
    const canAssign = showAssignment && assignees.length > 0 && Boolean(onAssign);
    const isAssigned = Boolean(item.assignedUserId);
    const assignedMember = assignees.find((assignee) => assignee.userId === item.assignedUserId);
    const assignedMemberLabel = assignedMember?.label ?? 'Tildelt';
    const assignedMemberInitials = isAssigned ? getDisplayInitials(assignedMemberLabel) : '';
    const shouldShowAssigneeChip = isAssigned;

    useEffect(() => {
        if (!isAssignMenuOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (assignMenuRef.current && !assignMenuRef.current.contains(target)) {
                setIsAssignMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isAssignMenuOpen]);

    const handleAssign = (assignedUserId: string | null): void => {
        setIsAssignMenuOpen(false);
        void onAssign?.(item.id, assignedUserId);
    };

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
            </div>

            {canAssign && (
                <div className="relative h-8 w-44 flex-shrink-0" ref={assignMenuRef}>
                    {shouldShowAssigneeChip && (
                        <div
                            className={`flex h-8 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 shadow-sm transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none group-focus-within:opacity-0 group-focus-within:pointer-events-none ${
                                isAssignMenuOpen ? 'opacity-0 pointer-events-none' : ''
                            }`}
                        >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
                                {assignedMemberInitials}
                            </span>
                            <span className="truncate">{assignedMemberLabel}</span>
                        </div>
                    )}

                    <div
                        className={`absolute inset-0 transition-all duration-200 ${
                            isAssignMenuOpen
                                ? 'opacity-100 pointer-events-auto'
                                : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => setIsAssignMenuOpen((current) => !current)}
                            className={`flex h-8 w-44 items-center justify-between rounded-full border py-1.5 pl-2.5 pr-2 text-xs font-medium shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                                isAssigned
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                            }`}
                            aria-haspopup="menu"
                            aria-expanded={isAssignMenuOpen}
                            aria-label="Åbn tildelingsmenu"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                                        isAssigned ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {isAssigned ? assignedMemberInitials : <FiUser className="text-[11px]" />}
                                </span>
                                <span className="truncate">{isAssigned ? assignedMemberLabel : 'Tildel'}</span>
                            </span>
                            <FiChevronDown className={`text-sm transition-transform ${isAssignMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isAssignMenuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleAssign(null)}
                                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition ${
                                        !item.assignedUserId
                                            ? 'bg-orange-50 text-orange-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                    role="menuitem"
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                                        <FiUser className="text-[11px]" />
                                    </span>
                                    <span className="flex-1 truncate">Ingen tildeling</span>
                                    {!item.assignedUserId && <FiCheck className="text-sm" />}
                                </button>

                                {assignees.map((assignee) => {
                                    const isCurrent = assignee.userId === item.assignedUserId;
                                    return (
                                        <button
                                            key={assignee.userId}
                                            type="button"
                                            onClick={() => handleAssign(assignee.userId)}
                                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition ${
                                                isCurrent
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                            role="menuitem"
                                        >
                                            <span
                                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                                                    isCurrent
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-slate-200 text-slate-600'
                                                }`}
                                            >
                                                {getDisplayInitials(assignee.label)}
                                            </span>
                                            <span className="flex-1 truncate">{assignee.label}</span>
                                            {isCurrent && <FiCheck className="text-sm" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
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
