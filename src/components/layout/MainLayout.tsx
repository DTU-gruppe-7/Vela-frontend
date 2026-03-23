import { useEffect, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";

interface Props {
    children?: ReactNode;
}

function MainLayout({ children }: Props) {
    const location = useLocation();
    const isGroupDetailRoute = /^\/groups\/[^/]+/.test(location.pathname);

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
            <main className={isGroupDetailRoute ? "flex-1 p-0" : "flex-1 p-6 md:p-12 pt-24 pb-28"}>
                {children ?? <Outlet />}
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;