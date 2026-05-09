import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiUser } from 'react-icons/fi';
import { getDisplayInitials } from '../../../utils/groupMemberDisplay';

interface AssignmentMenuAssignee {
  userId: string;
  label: string;
}

interface AssignmentMenuProps {
  assignees: AssignmentMenuAssignee[];
  assignedUserId: string | null;
  onAssign?: (assignedUserId: string | null) => Promise<void> | void;
  enabled?: boolean;
  isMixed?: boolean;
  emptyLabel?: string;
  mixedLabel?: string;
  ariaLabel?: string;
  wrapperClassName?: string;
}

export function AssignmentMenu({
  assignees,
  assignedUserId,
  onAssign,
  enabled = true,
  isMixed = false,
  emptyLabel = 'Tildel',
  mixedLabel = 'Blandet tildeling',
  ariaLabel = 'Åbn tildelingsmenu',
  wrapperClassName = 'relative h-8 w-44 flex-shrink-0',
}: AssignmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const canAssign = enabled && assignees.length > 0 && Boolean(onAssign);
  const assignedMember = assignees.find((assignee) => assignee.userId === assignedUserId);
  const hasAssignedUser = Boolean(assignedUserId) && Boolean(assignedMember);
  const shouldShowStatusChip = hasAssignedUser || isMixed;
  const statusLabel = isMixed ? mixedLabel : hasAssignedUser ? assignedMember?.label ?? emptyLabel : emptyLabel;
  const statusInitials = hasAssignedUser ? getDisplayInitials(statusLabel) : '';
  const isAssignedState = hasAssignedUser;
  const selectionValue = isMixed ? null : assignedUserId;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleAssign = (nextAssignedUserId: string | null): void => {
    setIsOpen(false);
    void onAssign?.(nextAssignedUserId);
  };

  if (!canAssign) {
    return null;
  }

  return (
    <div className={wrapperClassName} ref={menuRef}>
      {shouldShowStatusChip && (
        <div
          className={`flex h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-medium shadow-sm transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none group-focus-within:opacity-0 group-focus-within:pointer-events-none ${
            isMixed
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          } ${isOpen ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
              isMixed ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isMixed ? <FiUser className="text-[11px]" /> : statusInitials}
          </span>
          <span className="truncate">{statusLabel}</span>
        </div>
      )}

      <div
        className={`absolute inset-0 transition-all duration-200 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`flex h-8 w-44 items-center justify-between rounded-full border py-1.5 pl-2.5 pr-2 text-xs font-medium shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300 ${
            isAssignedState
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
              : isMixed
                ? 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
          }`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                isAssignedState
                  ? 'bg-emerald-600 text-white'
                  : isMixed
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isAssignedState ? statusInitials : isMixed ? <FiUser className="text-[11px]" /> : <FiUser className="text-[11px]" />}
            </span>
            <span className="truncate">{statusLabel}</span>
          </span>
          <FiChevronDown className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70"
          >
            <button
              type="button"
              onClick={() => handleAssign(null)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition ${
                !selectionValue ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
              role="menuitem"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                <FiUser className="text-[11px]" />
              </span>
              <span className="flex-1 truncate">Ingen tildeling</span>
              {!selectionValue && <FiCheck className="text-sm" />}
            </button>

            {assignees.map((assignee) => {
              const isCurrent = assignee.userId === selectionValue;
              return (
                <button
                  key={assignee.userId}
                  type="button"
                  onClick={() => handleAssign(assignee.userId)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition ${
                    isCurrent ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  role="menuitem"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
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
  );
}




