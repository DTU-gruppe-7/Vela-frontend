import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMoreVertical, FiUserMinus, FiShield, FiUser, FiLogOut, FiKey } from 'react-icons/fi';
import { groupApi } from '../../api/groupApi';
import { useAuthStore } from '../../stores/authStore';
import type { Group, GroupMember, GroupRole } from '../../types/Group';

const roleLabelMap: Record<GroupRole, string> = {
    owner: 'Owner',
    administrator: 'Administrator',
    member: 'Medlem',
};

const roleBadgeClass: Record<GroupRole, string> = {
    owner: 'bg-amber-100 text-amber-700',
    administrator: 'bg-blue-100 text-blue-700',
    member: 'bg-slate-100 text-slate-600',
};

const MembersPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const currentUser = useAuthStore((s) => s.user);

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchGroup = async () => {
        if (!groupId) return;
        try {
            setIsLoading(true);
            const data = await groupApi.getGroup(groupId);
            setGroup(data);
        } catch (error) {
            console.error('Fejl ved hentning af gruppe:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const currentMember = group?.members.find((m) => m.userId === currentUser?.userId);
    const myRole = currentMember?.role;

    const handleRemoveMember = async (userId: string) => {
        if (!groupId) return;
        try {
            await groupApi.removeMember(groupId, userId);
            await fetchGroup();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kunne ikke fjerne medlem';
            alert(msg);
        }
        setOpenMenuId(null);
    };

    const handleChangeRole = async (userId: string, newRole: 'administrator' | 'member') => {
        if (!groupId) return;
        try {
            await groupApi.changeRole(groupId, userId, newRole);
            await fetchGroup();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kunne ikke ændre rolle';
            alert(msg);
        }
        setOpenMenuId(null);
    };

    const handleTransferOwnership = async (userId: string) => {
        if (!groupId) return;
        if (!confirm('Er du sikker på at du vil overdrage ejerskab? Du bliver Administrator.')) return;
        try {
            await groupApi.transferOwnership(groupId, userId);
            await fetchGroup();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kunne ikke overdrage ejerskab';
            alert(msg);
        }
        setOpenMenuId(null);
    };

    const handleLeaveGroup = async () => {
        if (!groupId) return;
        if (!confirm('Er du sikker på at du vil forlade gruppen?')) return;
        try {
            await groupApi.leaveGroup(groupId);
            navigate('/groups');
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kunne ikke forlade gruppen';
            alert(msg);
        }
    };

    const getMenuItems = (member: GroupMember) => {
        const items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] = [];

        // Don't show menu for yourself
        if (member.userId === currentUser?.userId) return items;

        if (myRole === 'owner') {
            // Owner can remove anyone except themselves
            items.push({
                label: 'Fjern medlem',
                icon: <FiUserMinus />,
                onClick: () => handleRemoveMember(member.userId),
                danger: true,
            });

            // Owner can change roles to administrator or member
            if (member.role === 'member') {
                items.push({
                    label: 'Gør til Administrator',
                    icon: <FiShield />,
                    onClick: () => handleChangeRole(member.userId, 'administrator'),
                });
            }
            if (member.role === 'administrator') {
                items.push({
                    label: 'Gør til Medlem',
                    icon: <FiUser />,
                    onClick: () => handleChangeRole(member.userId, 'member'),
                });
            }

            // Owner can transfer ownership
            items.push({
                label: 'Overdrag ejerskab',
                icon: <FiKey />,
                onClick: () => handleTransferOwnership(member.userId),
            });
        }

        if (myRole === 'administrator') {
            // Admin can only remove Members (not other Admins or Owner)
            if (member.role === 'member') {
                items.push({
                    label: 'Fjern medlem',
                    icon: <FiUserMinus />,
                    onClick: () => handleRemoveMember(member.userId),
                    danger: true,
                });
                // Admin can promote Member → Admin
                items.push({
                    label: 'Gør til Administrator',
                    icon: <FiShield />,
                    onClick: () => handleChangeRole(member.userId, 'administrator'),
                });
            }
        }

        // Members can't do anything to others
        return items;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="px-6 md:px-10 xl:px-14">
                <p className="text-slate-400">Gruppen blev ikke fundet.</p>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 xl:px-14">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    Medlemmer <span className="text-slate-400 font-normal text-base">({group.members.length})</span>
                </h2>
                {/* Leave group button for non-owners */}
                {myRole && myRole !== 'owner' && (
                    <button
                        onClick={handleLeaveGroup}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        <FiLogOut />
                        Forlad gruppe
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
                {[...group.members].sort((a, b) => {
                    const order: Record<GroupRole, number> = { owner: 0, administrator: 1, member: 2 };
                    return order[a.role] - order[b.role];
                }).map((member) => {
                    const menuItems = getMenuItems(member);
                    const isMe = member.userId === currentUser?.userId;

                    return (
                        <div
                            key={member.userId}
                            className="flex items-center justify-between px-5 py-4 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-700 ring-1 ring-orange-200">
                                    {member.userId.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {member.userId}
                                        {isMe && <span className="ml-2 text-xs text-slate-400">(dig)</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Role badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass[member.role]}`}>
                                    {roleLabelMap[member.role]}
                                </span>

                                {/* Actions dropdown */}
                                {menuItems.length > 0 && (
                                    <div className="relative" ref={openMenuId === member.userId ? menuRef : undefined}>
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === member.userId ? null : member.userId)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                        >
                                            <FiMoreVertical />
                                        </button>

                                        {openMenuId === member.userId && (
                                            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                                                {menuItems.map((item) => (
                                                    <button
                                                        key={item.label}
                                                        onClick={item.onClick}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                                            item.danger
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className="text-base">{item.icon}</span>
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MembersPage;
