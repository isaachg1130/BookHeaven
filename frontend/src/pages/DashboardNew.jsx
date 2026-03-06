
import React, { useMemo, useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../components/dashboard/MainLayout'
import useDashboardData from '../hooks/useDashboardData'
import { contentAPI } from '../api/content'
import StatCard from '../components/dashboard/StatCard'
import AdminChart from '../components/dashboard/AdminChart'
import { UserTable, ContentTable } from '../components/dashboard/Tables'
import { DashboardSkeleton } from '../components/dashboard/SkeletonLoaders'

/**
 * DashboardNew - Panel de administración refactorizado
 * 
 * MEJORAS REALIZADAS:
 * 1. Backend-driven: Consume GET /api/admin/dashboard (endpoint optimizado)
 * 2. Single endpoint: No más N+1 queries, todo en una sola petición
 * 3. Proper Layout: Usa MainLayout con Sidebar memoizado
 * 4. Performance: React.memo en componentes, useMemo para cálculos
 * 5. Loading states: Skeleton loaders mientras carga
 * 6. Error handling: Mensajes claros y retry button
 * 
 * Estructura:
 * ├─ MainLayout (Header + Sidebar + MainContent)
 * │  ├─ Header (Título + Usuario)
 * │  ├─ Stats Grid (4 cards)
 * │  ├─ Charts Section (Growth + Distribution)
 * │  └─ Tables Section (Recent Users + Recent Content)
 */
const DashboardNew = () => {
    const { user, loading: authLoading, isAdmin } = useAuth()
    
    // Consume el nuevo endpoint backend optimizado
    const { data: dashboardData, loading, error, retry, isAutoRefreshing } = useDashboardData()

    /**
     * Datos memoizados para evitar recálculos
     * Solo se recalculan si dashboardData cambio
     */
    const stats = useMemo(() => dashboardData?.summary || null, [dashboardData])
    const growthData = useMemo(() => dashboardData?.growth_data || [], [dashboardData])
    const contentDistribution = useMemo(() => dashboardData?.content_distribution || {}, [dashboardData])
    const recentUsers = useMemo(() => dashboardData?.recent_users || [], [dashboardData])
    const recentContent = useMemo(() => dashboardData?.recent_content || [], [dashboardData])
    const premiumStats = useMemo(() => dashboardData?.premium_stats || {}, [dashboardData])

    /**
     * Datos para gráficas - se pasan los objetos completos con month_es y count
     * El componente AdminChart consume directamente el array de growth_data
     */
    const chartData = useMemo(() => {
        if (!growthData.length) return []
        // El backend ya devuelve el array ordenado cronológicamente
        return growthData
    }, [growthData])

    /**
     * Datos para distribución de contenido - convierte objeto a array
     * para que sea compatible con el código existente
     */
    const distributionPie = useMemo(() => {
        if (!contentDistribution || !Object.keys(contentDistribution).length) return {}
        return contentDistribution
    }, [contentDistribution])

    /**
     * Handler para agregar nuevo contenido -placeholder por ahora
     */
    const handleNewContent = useCallback(() => {
        // TODO: Esto se integraría con un modal o navegación
        alert('Modal para agregar nuevo contenido (implementación futuro)')
    }, [])

    /**
     * Handler para eliminar contenido — llama la API y refresca el dashboard
     */
    const [deletingId, setDeletingId] = useState(null)

    const handleDeleteContent = useCallback(async (item) => {
        if (!window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) return
        setDeletingId(`${item.content_type}-${item.id}`)
        try {
            const type = item.content_type
            if (type === 'libro') await contentAPI.deleteLibro(item.id)
            else if (type === 'manga') await contentAPI.deleteManga(item.id)
            else if (type === 'comic') await contentAPI.deleteComic(item.id)
            else if (type === 'audiobook') await contentAPI.deleteAudiobook(item.id)
            retry()
        } catch (err) {
            console.error('Error al eliminar contenido:', err)
            alert('Error al eliminar el contenido. Inténtalo de nuevo.')
        } finally {
            setDeletingId(null)
        }
    }, [retry])

    // ===== LOADING STATE =====
    if (authLoading) {
        return (
            <MainLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                    <div style={{
                        textAlign: 'center',
                        color: '#E8DCC8'
                    }}>
                        <div className="spinner" style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid rgba(212, 167, 106, 0.3)',
                            borderTop: '4px solid #D4A76A',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }}></div>
                        <p>Verificando sesión...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                </div>
            </MainLayout>
        )
    }

    // ===== ACCESS DENIED =====
    if (!isAdmin()) {
        return (
            <MainLayout>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#E8DCC8',
                    fontSize: '1.2rem'
                }}>
                    ❌ Acceso Denegado - Se requieren permisos de administrador
                </div>
            </MainLayout>
        )
    }

    // ===== MAIN CONTENT =====
    return (
        <MainLayout>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
                {/* PAGE HEADER */}
                <DashboardHeader user={user} onNewContent={handleNewContent} isAutoRefreshing={isAutoRefreshing} />

                {/* ERROR STATE */}
                {error && (
                    <ErrorAlert message={error} onRetry={retry} />
                )}

                {/* LOADING STATE - Skeleton Loaders */}
                {loading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* STATS GRID */}
                        <StatsGrid stats={stats} premiumStats={premiumStats} />

                        {/* CHARTS SECTION */}
                        <ChartsSection
                            chartData={chartData}
                            distributionData={distributionPie}
                            growthData={growthData}
                        />

                        {/* PREMIUM ANALYTICS SECTION */}
                        <PremiumAnalyticsSection premiumStats={premiumStats} />

                        {/* TABLES SECTION */}
                        <TablesSection
                            recentUsers={recentUsers}
                            recentContent={recentContent}
                            onDeleteContent={handleDeleteContent}
                        />
                    </>
                )}
            </div>
        </MainLayout>
    )
}

/**
 * DashboardHeader - Encabezado de la página
 * Memoizado para evitar re-renders
 */
const DashboardHeader = React.memo(({ user, onNewContent, isAutoRefreshing }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '20px',
        borderBottom: '2px solid #3a3530'
    }}>
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    margin: '0 0 10px 0',
                    color: '#FFFBF5'
                }}>
                    Panel General
                </h2>
                {isAutoRefreshing && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 12px',
                        background: 'rgba(212, 167, 106, 0.2)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: '#D4A76A'
                    }}>
                        <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            background: '#D4A76A',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                        }}></span>
                        Auto-actualizando
                    </div>
                )}
            </div>
            <p style={{ color: '#D4A76A', margin: 0, fontSize: '0.95rem' }}>
                Bienvenido de nuevo, {user?.name}
            </p>
        </div>
        <button
            onClick={onNewContent}
            style={{
                padding: '12px 24px',
                background: '#D4A76A',
                border: 'none',
                borderRadius: '4px',
                color: '#1a1a1a',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(212, 167, 106, 0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(212, 167, 106, 0.3)'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(212, 167, 106, 0.2)'
            }}
        >
            <span>+</span> Nuevo Contenido
        </button>
    </div>
))

DashboardHeader.displayName = 'DashboardHeader'

/**
 * ErrorAlert - Mensaje de error con retry button
 */
const ErrorAlert = React.memo(({ message, onRetry }) => (
    <div style={{
        padding: '16px',
        background: 'rgba(255, 67, 54, 0.1)',
        border: '1px solid #ff4336',
        borderRadius: '8px',
        color: '#ff9800',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <div>
            <strong>Error:</strong> {message}
        </div>
        <button
            onClick={onRetry}
            style={{
                padding: '8px 16px',
                background: '#ff4336',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
            }}
        >
            Reintentar
        </button>
    </div>
))

ErrorAlert.displayName = 'ErrorAlert'

/**
 * StatsGrid - Tarjetas de estadísticas mejoradas
 */
const StatsGrid = React.memo(({ stats, premiumStats }) => {
    if (!stats) return null

    const totalContent = (stats.total_books || 0) + (stats.total_mangas || 0) + (stats.total_comics || 0) + (stats.total_audiobooks || 0)
    const premiumCount = premiumStats?.premium_users || 0
    const conversionRate = premiumStats?.conversion_rate || 0

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
        }}>
            <StatCard
                title="Usuarios Totales"
                value={stats.total_users || 0}
                icon="👥"
                trend={12}
                color="#D4A76A"
            />
            <StatCard
                title="Usuarios Premium"
                value={premiumCount}
                icon="💎"
                trend={8}
                color="#FFD700"
            />
            <StatCard
                title="Tasa Conversión"
                value={`${conversionRate}%`}
                icon="📊"
                trend={5}
                color="#C4B49F"
            />
            <StatCard
                title="Contenido Total"
                value={totalContent}
                icon="📚"
                trend={15}
                color="#A67C52"
            />
            <StatCard
                title="Libros"
                value={stats.total_books || 0}
                icon="📖"
                trend={5}
                color="#D4A76A"
            />
            <StatCard
                title="Mangas"
                value={stats.total_mangas || 0}
                icon="🗯️"
                trend={8}
                color="#A67C52"
            />
            <StatCard
                title="Cómics"
                value={stats.total_comics || 0}
                icon="🦸"
                trend={3}
                color="#C4B49F"
            />
            <StatCard
                title="Audiolibros"
                value={stats.total_audiobooks || 0}
                icon="🎧"
                trend={6}
                color="#D4A76A"
            />
            <StatCard
                title="Ingresos Premium"
                value={`$${premiumStats?.premium_revenue || 0}`}
                icon="💰"
                trend={20}
                color="#FFD700"
            />
        </div>
    )
})

StatsGrid.displayName = 'StatsGrid'

/**
 * ChartsSection - Gráficas de crecimiento y distribución
 */
const ChartsSection = React.memo(({ chartData, distributionData }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
    }}>
        {/* Growth Chart */}
        <AdminChart
            title="Crecimiento de Usuarios (12 meses)"
            data={chartData}
        />

        {/* Distribution Pie */}
        <ContentDistributionChart distribution={distributionData} />
    </div>
))

ChartsSection.displayName = 'ChartsSection'

/**
 * ContentDistributionChart - Gráfica tipo pie de distribución de contenido
 */
const ContentDistributionChart = React.memo(({ distribution }) => {
    const colors = {
        'libros': '#D4A76A',
        'mangas': '#A67C52',
        'comics': '#C4B49F',
        'audiobooks': '#8B5A8E'
    }

    // Calcular porcentajes para todos los tipos de contenido
    const librosPercent = distribution.libros_percent || 0
    const mangasPercent = distribution.mangas_percent || 0
    const comicsPercent = distribution.comics_percent || 0
    const audiobooksPercent = 100 - librosPercent - mangasPercent - comicsPercent

    // Calcular posiciones acumulativas para el gradiente cónico
    const pos1 = librosPercent
    const pos2 = pos1 + mangasPercent
    const pos3 = pos2 + comicsPercent

    return (
        <div style={{
            background: '#1f1f1f',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{
                margin: '0 0 20px 0',
                color: '#eee',
                fontSize: '1.1rem'
            }}>
                Distribución de Contenido
            </h3>
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {/* CSS Pie Chart */}
                <div style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: `conic-gradient(
                        ${colors.libros} 0% ${pos1}%,
                        ${colors.mangas} ${pos1}% ${pos2}%,
                        ${colors.comics} ${pos2}% ${pos3}%,
                        ${colors.audiobooks} ${pos3}% 100%
                    )`,
                    boxShadow: '0 0 20px rgba(0,0,0,0.2)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                    background: '#1f1f1f',
                    borderRadius: '50%'
                }}></div>
            </div>
            {/* Legend */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                marginTop: '20px',
                fontSize: '0.75rem',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: colors.libros, fontSize: '1.2rem' }}>●</span>
                    <span>Libros {distribution.libros_count || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: colors.mangas, fontSize: '1.2rem' }}>●</span>
                    <span>Mangas {distribution.mangas_count || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: colors.comics, fontSize: '1.2rem' }}>●</span>
                    <span>Cómics {distribution.comics_count || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: colors.audiobooks, fontSize: '1.2rem' }}>●</span>
                    <span>Audio {distribution.audiobooks || 0}</span>
                </div>
            </div>
        </div>
    )
})

ContentDistributionChart.displayName = 'ContentDistributionChart'

/**
 * TablesSection - Tablas de usuarios y contenido recientes
 */
const TablesSection = React.memo(({ recentUsers, recentContent, onDeleteContent }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px'
    }}>
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px'
        }}>
            <UserTable users={recentUsers} />
            <ContentTable items={recentContent} onDelete={onDeleteContent} />
        </div>
    </div>
))

TablesSection.displayName = 'TablesSection'

/**
 * PremiumAnalyticsSection - Sección de análisis premium con métricas adicionales
 */
const PremiumAnalyticsSection = React.memo(({ premiumStats }) => {
    if (!premiumStats) return null

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(212, 167, 106, 0.1) 0%, rgba(166, 124, 82, 0.1) 100%)',
            borderRadius: '8px',
            padding: '25px',
            border: '2px solid #D4A76A',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        }}>
            <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: '#D4A76A',
                margin: '0 0 20px 0'
            }}>
                💎 Análisis Premium
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
            }}>
                <div style={{
                    background: 'rgba(212, 167, 106, 0.1)',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #D4A76A'
                }}>
                    <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                        👤 Usuarios Premium
                    </p>
                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {premiumStats.premium_users || 0}
                    </p>
                </div>
                <div style={{
                    background: 'rgba(166, 124, 82, 0.1)',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #A67C52'
                }}>
                    <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                        📈 Tasa Conversión
                    </p>
                    <p style={{ color: '#A67C52', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {premiumStats.conversion_rate || 0}%
                    </p>
                </div>
                <div style={{
                    background: 'rgba(196, 180, 159, 0.1)',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #C4B49F'
                }}>
                    <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                        💰 Ingresos Mensuales
                    </p>
                    <p style={{ color: '#C4B49F', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        ${premiumStats.monthly_revenue || 0}
                    </p>
                </div>
                <div style={{
                    background: 'rgba(212, 167, 106, 0.1)',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #D4A76A'
                }}>
                    <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                        💎 Ingresos Totales
                    </p>
                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        ${premiumStats.premium_revenue || 0}
                    </p>
                </div>
            </div>
        </div>
    )
})

PremiumAnalyticsSection.displayName = 'PremiumAnalyticsSection'

export default DashboardNew
