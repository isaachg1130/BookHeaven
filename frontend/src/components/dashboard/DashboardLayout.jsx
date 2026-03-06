import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * DashboardLayout - Componente contenedor para el layout admin
 * 
 * Responsabilidades:
 * - Mantener estado global de navegación (sidebar, activeTab)
 * - Renderizar Sidebar y MainContent
 * - Detectar ruta activa sin re-renders innecesarios
 * - Manejar responsive design
 * 
 * Beneficios:
 * - Separación clara entre Layout e Contenido
 * - El Sidebar NO se re-renderiza con cambios de contenido
 * - Code splitting por rutas es posible
 */
const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div
            style={{
                display: 'flex',
                background: 'linear-gradient(135deg, #141414 0%, #1e1914 100%)',
                minHeight: '100vh',
                color: '#E8DCC8',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* Sidebar - NO se re-renderiza excepto cuando collapse cambia */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                currentPath={location.pathname}
            />

            {/* Main Content Area */}
            <main
                style={{
                    marginLeft: sidebarCollapsed ? '80px' : '250px',
                    padding: '40px',
                    width: `calc(100% - ${sidebarCollapsed ? '80px' : '250px'})`,
                    overflowY: 'auto',
                    transition: 'all 0.3s ease',
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
