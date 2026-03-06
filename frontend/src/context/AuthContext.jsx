import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { contentAPI } from '../api/content';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true); // Solo para inicialización de la app
    const [error, setError] = useState(null);

    // Cargar usuario al iniciar si hay token - se ejecuta UNA SOLA VEZ al montar
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token');
            if (storedToken) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                } catch (err) {
                    console.error('Error restoring session:', err);
                    // Token inválido: limpiar sin llamar al backend
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []); // [] → solo al montar, no se re-ejecuta en cada cambio de token

    const register = async (data) => {
        // NO cambiar el loading global durante operaciones del usuario
        try {
            const response = await authAPI.register(data);
            const { token: newToken, user: newUser } = response.data;

            localStorage.setItem('auth_token', newToken);
            setToken(newToken);
            setUser(newUser);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar');
            throw err;
        }
    };

    const login = async (email, password) => {
        // NO cambiar el loading global durante operaciones del usuario
        try {
            const response = await authAPI.login({ email, password });
            const { token: newToken, user: newUser } = response.data;

            localStorage.setItem('auth_token', newToken);
            setToken(newToken);
            setUser(newUser);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            throw err;
        }
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const response = await authAPI.getMe();
            setUser(response.data.user);
        } catch (err) {
            console.error('Error refreshing user:', err);
        }
    };

    const logout = async () => {
        // Limpiar el estado local de inmediato para respuesta instantánea en la UI
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
        // Invalidar el token en el backend (fire-and-forget)
        authAPI.logout().catch(() => {});
    };

    // Helpers de Roles
    const hasRole = (roleName) => user?.role?.name === roleName;
    const isAdmin = () => hasRole('admin');
    const isPremium = () => hasRole('premium');
    const isStandard = () => hasRole('standard');

    // Un usuario Premium tiene acceso a Premium Y Estandar.
    // Un Admin tiene acceso a TODO.
    const canAccessPremium = () => isAdmin() || isPremium();

    const isActive = () => user?.is_active !== false;

    // Gestión de Biblioteca (Mi Lista) Persistente
    const [library, setLibrary] = useState([]);

    // Cargar biblioteca desde el backend o cache local al cambiar el usuario
    useEffect(() => {
        const loadLibrary = async () => {
            if (!user) {
                setLibrary([]);
                return;
            }

            // Intentar cargar desde el cache local específico del usuario para velocidad instantánea
            const cacheKey = `user_library_${user.id}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setLibrary(JSON.parse(cached));
            }

            // Sincronizar con el backend
            try {
                const response = await contentAPI.getFavorites();
                if (response.data.success) {
                    const backendFavorites = response.data.data;
                    setLibrary(backendFavorites);
                    // Actualizar el cache
                    localStorage.setItem(cacheKey, JSON.stringify(backendFavorites));
                }
            } catch (err) {
                console.error('Error fetching favorites from backend:', err);
            }
        };

        loadLibrary();
    }, [user]);

    const addToLibrary = async (item) => {
        if (!user) return false;

        try {
            // Llamada al backend (toggle/add)
            const response = await contentAPI.toggleFavorite(item.type, item.id);

            if (response.data.success) {
                const { action } = response.data;

                if (action === 'added') {
                    const newItem = {
                        id: item.id,
                        type: item.type,
                        titulo: item.titulo || item.title,
                        autor: item.autor || item.author,
                        imagen: item.imagen || item.poster,
                        addedAt: new Date().toISOString()
                    };

                    setLibrary(prev => {
                        const updated = [...prev, newItem];
                        localStorage.setItem(`user_library_${user.id}`, JSON.stringify(updated));
                        return updated;
                    });
                } else {
                    // Si ya existía y el toggle lo borró
                    removeFromLibrary(item.id, item.type);
                }
                return true;
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
        return false;
    };

    const removeFromLibrary = async (id, type) => {
        if (!user) return;

        try {
            // Optimistic update
            setLibrary(prev => {
                const updated = prev.filter(it => !(it.id === id && it.type === type));
                localStorage.setItem(`user_library_${user.id}`, JSON.stringify(updated));
                return updated;
            });

            // Llamada persistente
            await contentAPI.removeFavorite(type, id);
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    const isInLibrary = (id, type) => {
        return library.some(it => Number(it.id) === Number(id) && it.type === type);
    };

    const updateLibraryItem = (id, type, updates) => {
        if (!user) return;

        setLibrary(prev => {
            const updated = prev.map(it => 
                it.id === id && it.type === type 
                    ? { ...it, ...updates }
                    : it
            );
            localStorage.setItem(`user_library_${user.id}`, JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                register,
                login,
                logout,
                isAdmin,
                isPremium,
                isStandard,
                refreshUser,
                canAccessPremium,
                isActive,
                library,
                addToLibrary,
                removeFromLibrary,
                isInLibrary,
                updateLibraryItem,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
