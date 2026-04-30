import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from "../stores/authStore.ts";

function GuestRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isHydrating = useAuthStore((s) => s.isHydrating);

    if (isHydrating) return null;

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />
}
export default GuestRoute;