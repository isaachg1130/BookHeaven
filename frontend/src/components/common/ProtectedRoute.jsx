// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole = null, requirePremium = false }) => {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/" state={{ openLogin: true }} replace />;
    }

    // Validar que la cuenta esté activa
    if (!user.is_active) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Cuenta desactivada</h2>
                    <p className="mt-2 text-gray-600">Tu cuenta ha sido desactivada. Contacta con soporte.</p>
                    <button 
                        onClick={logout}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        );
    }

    // Validar rol requerido
    if (requiredRole) {
        const hasRole = user.role?.name === requiredRole;
        if (!hasRole) {
            return <Navigate to="/" replace />;
        }
    }

    // Validar acceso premium
    if (requirePremium) {
        const isPremium = user.role?.name === 'premium';
        const isAdmin = user.role?.name === 'admin';
        
        if (!isPremium && !isAdmin) {
            return <Navigate to="/payment/checkout?plan=premium_1month" replace />;
        }

        // Si es premium, validar que no haya expirado
        if (isPremium && user.premium_expires_at) {
            const expiresAt = new Date(user.premium_expires_at);
            if (expiresAt < new Date()) {
                return <Navigate to="/payment/checkout?plan=premium_1month" replace />;
            }
        }
    }

    return children;
};
