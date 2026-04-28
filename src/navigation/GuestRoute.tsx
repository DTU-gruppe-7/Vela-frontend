import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from "../stores/authStore.ts";

function GuestRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />
}
export default GuestRoute;