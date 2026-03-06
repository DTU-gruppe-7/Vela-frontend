import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from "../stores/authStore.ts";

function GuestRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const location = useLocation();

    if (isAuthenticated) {
        const from = (location.state as { from?: Location })?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return <Outlet />
}
export default GuestRoute;