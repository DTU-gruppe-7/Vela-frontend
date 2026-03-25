import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiUserMinus, FiUserPlus, FiUsers, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { groupApi } from '../../api/groupApi';
import { useAuth } from '../../hooks/useAuth';
import type { Group } from '../../types/Group';
import InviteGroupModal from './modal/GroupInviteModal';
import { canManageGroup, getCurrentUserGroupRole } from '../../utils/groupAccess';
import { getCurrentUserDisplayName, getGroupMemberDisplayName } from '../../utils/groupMemberDisplay';

export default function GroupManagePage() {
    const { groupId } = useParams<{ groupId: string }>();
    const { user } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const userIdentifiers = useMemo(
        () => [user?.id, user?.userId, user?.email],
        [user?.id, user?.userId, user?.email]
    );

    const currentRole = useMemo(
        () => getCurrentUserGroupRole(group, ...userIdentifiers),
        [group, userIdentifiers]
    );

    const hasManageAccess = canManageGroup(currentRole);

    const fetchGroup = async () => {
        if (!groupId) return;

        try {
            setIsLoading(true);
            setError(null);
            const data = await groupApi.getGroup(groupId);
            setGroup(data);
        } catch {
            setError('Kunne ikke hente gruppedata.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupId]);

    const handleRemoveMember = async (memberId: string) => {
        if (!groupId || !hasManageAccess) return;

        try {
            setIsRemoving(memberId);
            await groupApi.removeMember(groupId, memberId);
            await fetchGroup();
        } catch {
            setError('Kunne ikke fjerne medlemmet.');
        } finally {
            setIsRemoving(null);
        }
    };

    if (isLoading) {
        return (
            <div className="px-6 md:px-10 xl:px-14 py-6 flex items-center gap-3 text-slate-500">
                <FiLoader className="animate-spin" />
                <span>Henter gruppeadministration...</span>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="px-6 md:px-10 xl:px-14 py-6 text-slate-500">
                Gruppen blev ikke fundet.
            </div>
        );
    }

    if (!hasManageAccess) {
        return (
            <div className="px-6 md:px-10 xl:px-14 py-6">
                <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    <p className="font-bold mb-2">Adgang nægtet</p>
                    <p className="text-sm">Kun ejere og administratorer kan administrere denne gruppe.</p>
                    <Link
                        to={`/groups/${group.id}/mealplan`}
                        className="inline-block mt-4 text-sm font-semibold text-amber-900 underline"
                    >
                        Tilbage til madplan
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 xl:px-14 py-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Administrer gruppe</h2>
                    <p className="text-slate-500 text-sm mt-1">Håndter medlemmer og invitationer for {group.name}.</p>
                </div>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-bold text-white hover:bg-orange-600 transition"
                >
                    <FiUserPlus />
                    Inviter medlem
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 text-slate-700">
                    <FiUsers />
                    <p className="font-bold">Medlemmer ({group.members.length})</p>
                </div>

                {group.members.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-slate-500">Ingen medlemmer i gruppen endnu.</div>
                ) : (
                    <ul>
                        {group.members.map((member) => {
                            const normalizedUserIdentifiers = userIdentifiers
                                .filter((identifier): identifier is string => Boolean(identifier))
                                .map((identifier) => identifier.toLowerCase());
                            const isSelf = normalizedUserIdentifiers.includes(member.userId.toLowerCase());
                            const roleLabel = member.role === 'member' ? 'Medlem' : member.role;
                            const displayName = isSelf
                                ? getCurrentUserDisplayName(user)
                                : getGroupMemberDisplayName(member);

                            return (
                                <li
                                    key={member.userId}
                                    className="px-5 py-4 border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800 break-all">{displayName}</p>
                                        {member.email && (
                                            <p className="text-xs text-slate-500 mt-0.5 break-all">{member.email}</p>
                                        )}
                                        <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Rolle: {roleLabel}</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member.userId)}
                                        disabled={isSelf || isRemoving === member.userId}
                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={isSelf ? 'Du kan ikke fjerne dig selv herfra.' : 'Fjern medlem'}
                                    >
                                        {isRemoving === member.userId ? <FiLoader className="animate-spin" /> : <FiUserMinus />}
                                        Fjern
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 flex gap-3 text-sm">
                <FiAlertTriangle className="mt-0.5" />
                <p>
                    Medlemsadministration påvirker alle i gruppen med det samme. Tjek gerne rollerne, inden du fjerner medlemmer.
                </p>
            </div>

            <InviteGroupModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                groupName={group.name}
                groupId={group.id}
            />
        </div>
    );
}
