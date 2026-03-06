
import React, { useMemo, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../styles/Sidebar.css'

/**
 * Sidebar - Navigation Sidebar para el Dashboard
 * 
 * OPTIMIZACIÓN: Envuelto con React.memo para prevenir re-renders innecesarios
 * cuando el contenido principal cambia. Solo se re-renderiza si sus props cambian.
 * 
 * Features:
 * - Menú de navegación sin props (no depende del padre)
 * - Información del usuario desde context (siempre sincronizado)
 * - Logout y navegación integrados
 * - CSS modular sin inline styles
 * - Memoización de menuItems con useMemo
 */
const SidebarContent = () => {
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    /**
     * Menu items memoizados - no se recalculan en cada render
     * Movido al interior del componente para evitar recrearlo
     */
    const menuItems = useMemo(() => [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Usuarios', icon: '👥' },
        { id: 'content', label: 'Contenido', icon: '📚' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'settings', label: 'Configuración', icon: '⚙️' },
    ], [])

    /**
     * Logout handler memoizado
     * Evita crear nueva función en cada render
     */
    const handleLogout = useCallback(() => {
        logout()
        navigate('/')
    }, [logout, navigate])

    /**
     * Home navigation handler
     */
    const handleGoHome = useCallback(() => {
        navigate('/')
    }, [navigate])

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <h1 className="sidebar-logo-text">
                    BOOKHEAVEN<span className="sidebar-logo-admin">ADMIN</span>
                </h1>
            </div>

            {/* Usuario Info */}
            <div className="sidebar-user">
                <div className="sidebar-avatar">
                    {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{user?.name || 'Admin'}</div>
                    <div className="sidebar-user-status">● Online</div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="sidebar-nav-item"
                        onClick={(e) => {
                            e.preventDefault()
                            // Navegar según el ID del item
                            const routes = {
                                dashboard: '/dashboard',
                                users: '/usuarios',
                                content: '/contenido',
                                analytics: '/analytics',
                                settings: '/configuracion',
                            }
                            const route = routes[item.id]
                            if (route) {
                                navigate(route)
                            }
                        }}
                    >
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        <span className="sidebar-nav-label">{item.label}</span>
                    </a>
                ))}
            </nav>

            {/* Actions Footer */}
            <div className="sidebar-footer">
                <button
                    onClick={handleGoHome}
                    className="sidebar-btn sidebar-btn-secondary"
                >
                    ← Volver al Sitio
                </button>
                <button
                    onClick={handleLogout}
                    className="sidebar-btn sidebar-btn-primary"
                >
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}

/**
 * Envolvemos con React.memo para que NO se re-renderice
 * cuando cambios en el contenido principal o estado del padre
 * 
 * Esto es CRÍTICO para performance - sin memo, cada cambio en
 * el padre (ej: dashboard data update) causa re-render del sidebar
 */
const Sidebar = React.memo(SidebarContent)

export default Sidebar
