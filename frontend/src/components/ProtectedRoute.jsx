import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, loading, isActive } = useAuth();
    const location = useLocation();

    if (loading) {
        // Puedes poner un spinner aquí
        return <div className="loading-spinner">Cargando...</div>;
    }

    if (!user) {
        // Redirigir a login si no está autenticado, guardando la ubicación
        return <Navigate to="/" state={{ from: location, openLogin: true }} replace />;
    }

    if (!isActive()) {
        return <Navigate to="/unauthorized" state={{ message: "Tu cuenta está desactivada." }} replace />;
    }

    if (allowedRoles.length > 0) {
        const hasPermission = allowedRoles.includes(user.role?.name);
        if (!hasPermission) {
             // Redirigir si no tiene el rol adecuado
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
