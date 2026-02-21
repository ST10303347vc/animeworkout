import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '@/stores/useStore';

export const ProtectedRoute = () => {
    const user = useStore((state) => state.user);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // If user is logged in but hasn't picked a sensei, force them to
    if (!user.senseiId) {
        return <Navigate to="/select-sensei" replace />;
    }

    return <Outlet />;
};

export const SenseiRoute = () => {
    const user = useStore((state) => state.user);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // If they already have a sensei, they don't need to be here
    if (user.senseiId) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
