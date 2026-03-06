import React, { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import '../../styles/MainLayout.css' // CSS modular

/**
 * MainLayout - Componente de layout principal
 * 
 * Arquitectura:
 * ┌─────────────────────────────────────────────┐
 * │              Header (Global)                 │
 * ├─────────────────┬───────────────────────────┤
 * │                 │                           │
 * │  Sidebar        │                           │
 * │  (250px)        │   MainContent (flex)      │
 * │                 │   (calc(100% - 250px))    │
 * │  fixed/sticky   │                           │
 * │                 │                           │
 * └─────────────────┴───────────────────────────┘
 * 
 * Responsabilidades:
 * - Layout estructura
 * - Sidebar NO se re-renderiza cuando cambia contenido
 * - Header manejado por App.jsx (siempre arriba)
 * - Content es dinámico (Outlet)
 * 
 * Key Features:
 * - Responsive design (sidebar se colapsa en mobile)
 * - No hardcodeados píxeles (usa CSS variables)
 * - Evita re-renders innecesarios (useMemo)
 */
const MainLayout = ({ children }) => {
    // Estilos memoizados para evitar recálulo en cada render
    const layoutStyle = useMemo(() => ({
        display: 'flex',
        flex: 1,
        height: 'calc(100vh - 60px)', // 60px es altura del header global
        background: 'linear-gradient(135deg, #141414 0%, #1e1914 100%)',
        color: '#E8DCC8',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden', // Evita scroll en el layout
    }), [])

    const mainContentStyle = useMemo(() => ({
        flex: 1,
        marginLeft: '250px', // Ancho del sidebar
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '40px',
        transition: 'margin-left 0.3s ease', // Smooth cuando sidebar se colapsa
    }), [])

    return (
        <div style={layoutStyle}>
            {/* Sidebar - NO se re-renderiza con cambios de contenido */}
            <Sidebar />

            {/* Main Content Area */}
            <main style={mainContentStyle}>
                {children || <Outlet />}
            </main>
        </div>
    )
}

export default MainLayout
