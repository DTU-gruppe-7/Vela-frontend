import { useEffect, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";

interface Props {
    children?: ReactNode;
}

const PAGE_PADDING = "p-6 md:p-12";
const GROUP_DETAIL_ROUTE = /^\/groups\/[^/]+/;

function getMainClassName(pathname: string): string {
    if (GROUP_DETAIL_ROUTE.test(pathname)) {
        return 'flex-1 p-0';
    }

    const exactRouteClasses: Record<string, string> = {
        '/': `flex-1 ${PAGE_PADDING} pb-28`,
        '/swipe': `flex-1 ${PAGE_PADDING} pt-8 pb-28`,
        '/groups': `flex-1 ${PAGE_PADDING} pt-8 pb-28`,
        '/recipes': `flex-1 ${PAGE_PADDING} pt-8 pb-28`,
        '/mealplan': 'flex-1 px-2 sm:px-4 lg:px-6 pt-8 pb-28',
        '/shoppinglist': `flex-1 ${PAGE_PADDING} pt-8 pb-28`,
    };

    return exactRouteClasses[pathname] ?? `flex-1 ${PAGE_PADDING} pt-24 pb-28`;
}

function MainLayout({ children }: Props) {
    const location = useLocation();
    const mainClassName = getMainClassName(location.pathname);

    // Hent auth-status og notification actions
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { fetchNotifications, connectToSignalR, disconnectSignalR } = useNotificationStore();

    useEffect(() => {
        if (isAuthenticated) {
            // Hent gamle ulæste notifikationer fra databasen
            fetchNotifications();
            // Start realtids-forbindelsen via WebSockets
            connectToSignalR();
        } else {
            // Luk forbindelsen hvis brugeren logger ud
            disconnectSignalR();
        }
    }, [isAuthenticated, fetchNotifications, connectToSignalR, disconnectSignalR]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Header />
            <main className={mainClassName}>
                {children ?? <Outlet />}
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;