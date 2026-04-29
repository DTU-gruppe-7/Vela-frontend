import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isHydrating = useAuthStore((s) => s.isHydrating);
    const location = useLocation();

    if (isHydrating) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;