import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Sidebar - Componente de navegación del dashboard
 * 
 * Optimizaciones:
 * - useMemo para menuItems (items no cambian)
 * - useLocation() para detectar ruta activa sin estado redundante
 * - React.memo para evitar re-renders innecesarios
 * - No depende de props volátiles
 */
const Sidebar = ({ activeTab, setActiveTab, collapsed = false, setCollapsed }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Memoizar items para evitar recálculos
    const menuItems = useMemo(() => [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'users', label: 'Usuarios', icon: '👥', path: '/usuarios' },
        { id: 'content', label: 'Contenido', icon: '📚', path: '/contenido' },
        { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' },
    ], []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarWidth = collapsed ? '80px' : '250px';

    return (
        <div
            style={{
                width: sidebarWidth,
                height: '100vh',
                background: '#141414',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1000,
                transition: 'width 0.3s ease',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '20px',
                    borderBottom: '1px solid #333',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}
            >
                {!collapsed && (
                    <h1
                        style={{
                            color: '#D4A76A',
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                        }}
                    >
                        BOOKHEAVEN
                        <span style={{ color: 'white', fontSize: '0.8rem' }}>ADMIN</span>
                    </h1>
                )}
                <button
                    onClick={() => setCollapsed?.(!collapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#D4A76A',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                    }}
                    title={collapsed ? 'Expandir' : 'Contraer'}
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            {/* User Info */}
            {!collapsed && (
                <div
                    style={{
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderBottom: '1px solid #333',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {user?.name || 'Admin'}
                        </div>
                        <div style={{ color: '#D4A76A', fontSize: '0.7rem' }}>● Online</div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '20px 0', overflow: 'auto' }}>
                {menuItems.map(item => {
                    const isActive = activeTab === item.id || location.pathname === item.path;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                navigate(item.path);
                            }}
                            title={collapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                gap: '15px',
                                width: '100%',
                                padding: collapsed ? '15px 10px' : '15px 25px',
                                background: isActive ? 'rgba(212, 167, 106, 0.1)' : 'transparent',
                                border: 'none',
                                borderLeft: isActive ? '4px solid #D4A76A' : '4px solid transparent',
                                color: isActive ? '#D4A76A' : '#aaa',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div
                style={{
                    padding: '20px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
            >
                {!collapsed && (
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'transparent',
                            border: '1px solid #333',
                            color: '#fff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Volver al Sitio
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#D4A76A',
                        color: '#1a1a1a',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                    }}
                >
                    {collapsed ? '🚪' : 'Cerrar Sesión'}
                </button>
            </div>
        </div>
    );
};

export default React.memo(Sidebar);
