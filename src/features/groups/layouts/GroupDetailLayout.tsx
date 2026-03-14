import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiShoppingCart, FiHeart, FiChevronLeft, FiLoader } from 'react-icons/fi';
import { groupApi } from '../../../api/groupApi';
import { type Group } from '../../../types/Group';

const GroupDetailLayout: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const location = useLocation();

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            if (!groupId) return;
            try {
                setIsLoading(true);
                const data = await groupApi.getGroup(groupId);
                setGroup(data);
            } catch (error) {
                console.error("Fejl ved hentning af gruppe:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroup();
    }, [groupId]);

    const groupName = group?.name || (isLoading ? "Henter..." : "Ukendt Gruppe");

    const navItems = [
        { label: 'Madplan', path: 'mealplan', icon: <FiCalendar /> },
        { label: 'Indkøbslister', path: 'shoppinglist', icon: <FiShoppingCart /> },
        { label: 'Liked Recipes', path: 'liked-recipes', icon: <FiHeart /> },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex">
            {/* Sidebar - Fast i venstre side og korrekt højde under headeren */}
            <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white z-40 flex flex-col">
                <div className="p-6 flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-300 tracking-[0.2em] mb-10 px-2">Menu</p>
                    
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const fullPath = `/groups/${groupId}/${item.path}`;
                            const isActive = location.pathname.includes(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={fullPath}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all
                                        ${isActive
                                            ? 'bg-orange-500 text-white shadow-xl shadow-orange-100'
                                            : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50/50'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Medlemmer sektion i bunden */}
                <div className="p-6 pt-4">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-4 px-2">Medlemmer</p>
                    <div className="flex -space-x-2 px-2">
                        {isLoading ? (
                            <FiLoader className="animate-spin text-slate-400 ml-2" />
                        ) : group?.members && group.members.length > 0 ? (
                            group.members.slice(0, 5).map((member, i) => (
                                <div key={member.userId|| i} className="w-9 h-9 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700 shadow-sm ring-1 ring-orange-200" title={member.userId}>
                                    U{i + 1}
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-slate-400 ml-2">Ingen medlemmer</span>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area - Sømløs baggrund uden luft mod venstremenu */}
            <main className="flex-1 ml-64 min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="pt-6 md:pt-8 pb-0 w-full">
                    {/* Header */}
                    <div className="flex items-center gap-5 md:gap-6 mb-8 md:mb-10 px-6 md:px-10 xl:px-14">
                        <Link 
                            to="/groups" 
                            className="group flex items-center justify-center w-10 h-10 bg-slate-50 rounded-full text-slate-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        >
                            <FiChevronLeft className="text-xl" />
                        </Link>
                        <div>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Gruppeaktivitet</p>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{groupName}</h1>
                        </div>
                    </div>

                    {/* Full-bleed Outlet: indhold går helt ud til kanterne */}
                    <div className="w-full bg-slate-50 min-h-[calc(100vh-13rem)]">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GroupDetailLayout;
