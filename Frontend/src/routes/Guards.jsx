import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
function hasSession(user, accessToken) {
    return Boolean(user?.id && accessToken);
}
export function ProtectedRoute() {
    const { user, accessToken } = useSelector((s) => s.auth);
    const location = useLocation();
    if (!hasSession(user, accessToken)) {
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    }
    return <Outlet />;
}
export function AdminRoute() {
    const { user, accessToken } = useSelector((s) => s.auth);
    if (!hasSession(user, accessToken))
        return <Navigate to="/login" replace/>;
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')
        return <Navigate to="/home" replace/>;
    return <Outlet />;
}
export function GuestRoute() {
    const { user, accessToken } = useSelector((s) => s.auth);
    if (hasSession(user, accessToken)) {
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
        return <Navigate to={isAdmin ? '/admin' : '/home'} replace/>;
    }
    return <Outlet />;
}
