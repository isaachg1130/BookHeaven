import React, { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import MainLayout from '../../components/dashboard/MainLayout'
import useDashboardData from '../../hooks/useDashboardData'
import StatCard from '../../components/dashboard/StatCard'
import AdminChart from '../../components/dashboard/AdminChart'
import ReadingAnalytics from '../../components/dashboard/ReadingAnalytics'
import ReadingStatsCards from '../../components/dashboard/ReadingStatsCards'
import ReadingTrendsChart from '../../components/dashboard/ReadingTrendsChart'
import PopularContentChart from '../../components/dashboard/PopularContentChart'
import '../../styles/admin-pages.css'

/**
 * AnalyticsPage - Vista detallada de analytics y estadísticas
 * 
 * Features:
 * - Gráficas de crecimiento por periodo
 * - Distribución de contenido
 * - Estadísticas de usuarios
 * - Estadísticas premium
 * - Comparativa mes a mes
 */
const AnalyticsPage = () => {
    const { isAdmin } = useAuth()
    const { data: dashboardData, loading, error, retry } = useDashboardData()
    const [lastUpdated, setLastUpdated] = useState(null)

    useEffect(() => {
        if (dashboardData) setLastUpdated(new Date())
    }, [dashboardData])

    // Memoizar datos de análisis
    const analyticsData = useMemo(() => ({
        growth: dashboardData?.growth_data || [],
        distribution: dashboardData?.content_distribution || {},
        premium: dashboardData?.premium_stats || {},
        summary: dashboardData?.summary || {},
    }), [dashboardData])

    // Calcular datos adicionales
    const calculatedStats = useMemo(() => {
        const growth = analyticsData.growth || []
        if (growth.length === 0) return {}

        const total = growth.reduce((sum, item) => sum + item.count, 0)
        const avg = Math.round(total / growth.length)
        const max = Math.max(...growth.map(item => item.count))
        const min = Math.min(...growth.map(item => item.count))

        return { total, avg, max, min }
    }, [analyticsData.growth])

    if (loading) {
        return (
            <MainLayout>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="spinner"></div>
                    <p>Cargando analytics...</p>
                </div>
            </MainLayout>
        )
    }

    if (!isAdmin()) {
        return (
            <MainLayout>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ff9800' }}>
                    ❌ Acceso denegado
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
                {/* PAGE HEADER */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #3a3530'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: '0 0 10px 0',
                            color: '#FFFBF5'
                        }}>
                            📊 Analytics y Estadísticas
                        </h2>
                        <p style={{ color: '#D4A76A', margin: 0 }}>
                            Análisis detallado del rendimiento de la plataforma
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {lastUpdated && (
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '0.8rem', color: '#4caf50'
                            }}>
                                <span style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: '#4caf50',
                                    display: 'inline-block',
                                    boxShadow: '0 0 6px #4caf50',
                                    animation: 'pulse 2s infinite'
                                }} />
                                En tiempo real · {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        )}
                        <button
                            onClick={retry}
                            style={{
                                padding: '8px 14px', background: 'rgba(212,167,106,0.15)',
                                border: '1px solid rgba(212,167,106,0.4)', borderRadius: '6px',
                                color: '#D4A76A', cursor: 'pointer', fontSize: '0.85rem',
                                fontWeight: 'bold', transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(212,167,106,0.3)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(212,167,106,0.15)'}
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>

                {/* ERROR ALERT */}
                {error && (
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
                        <div>⚠️ {error}</div>
                        <button
                            onClick={retry}
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
                )}

                {/* KEY METRICS */}
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: '#FFFBF5'
                    }}>
                        📈 Métricas Clave de Crecimiento
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <StatCard
                            title="Registros Totales"
                            value={calculatedStats.total || 0}
                            icon="📊"
                            color="#D4A76A"
                        />
                        <StatCard
                            title="Promedio Mensual"
                            value={calculatedStats.avg || 0}
                            icon="📉"
                            color="#A67C52"
                        />
                        <StatCard
                            title="Pico Máximo"
                            value={calculatedStats.max || 0}
                            icon="⬆️"
                            color="#D4A76A"
                        />
                        <StatCard
                            title="Mínimo Registrado"
                            value={calculatedStats.min || 0}
                            icon="⬇️"
                            color="#A67C52"
                        />
                    </div>
                </div>

                {/* USERS ANALYTICS */}
                <div style={{
                    background: '#1f1f1f',
                    padding: '25px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#FFFBF5'
                    }}>
                        👥 Estadísticas de Usuarios
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(212, 167, 106, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #D4A76A'
                        }}>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Total Usuarios</p>
                            <p style={{ color: '#D4A76A', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                                {analyticsData.summary?.total_users || 0}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(166, 124, 82, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #A67C52'
                        }}>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Usuarios Activos</p>
                            <p style={{ color: '#A67C52', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                                {analyticsData.summary?.active_users || 0}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(196, 180, 159, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #C4B49F'
                        }}>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Nuevos Usuarios</p>
                            <p style={{ color: '#C4B49F', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                                {analyticsData.summary?.new_users || 0}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(166, 124, 82, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #A67C52'
                        }}>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Usuarios Premium</p>
                            <p style={{ color: '#A67C52', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                                {analyticsData.premium?.premium_users || 0}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(196, 180, 159, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #C4B49F'
                        }}>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Tasa Conversión</p>
                            <p style={{ color: '#C4B49F', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                                {analyticsData.premium?.conversion_rate || '0'}%
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(212, 167, 106, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '4px solid #D4A76A'
                        }}>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Ingresos Premium</p>
                            <p style={{ color: '#D4A76A', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                                ${analyticsData.premium?.premium_revenue || '0'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* GROWTH CHART */}
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: '#FFFBF5'
                    }}>
                        📊 Crecimiento de Usuarios (Últimos 12 Meses)
                    </h3>
                    <AdminChart
                        title=""
                        data={analyticsData.growth}
                    />
                </div>

                {/* CONTENT DISTRIBUTION */}
                <div style={{
                    background: '#1f1f1f',
                    padding: '25px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#FFFBF5'
                    }}>
                        📚 Distribución de Contenido
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '30px',
                        alignItems: 'center'
                    }}>
                        {/* Pie Chart Styles */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '280px',
                                height: '280px',
                                borderRadius: '50%',
                                background: (() => {
                                    const l = analyticsData.distribution?.libros_percent || 0
                                    const m = analyticsData.distribution?.mangas_percent || 0
                                    const c = analyticsData.distribution?.comics_percent || 0
                                    const a = analyticsData.distribution?.audiobooks_percent || 0
                                    const hasData = l + m + c + a > 0
                                    if (!hasData) return `conic-gradient(#D4A76A 0% 30%, #A67C52 30% 65%, #C4B49F 65% 85%, #8B5A8E 85% 100%)`
                                    return `conic-gradient(#D4A76A 0% ${l}%, #A67C52 ${l}% ${l+m}%, #C4B49F ${l+m}% ${l+m+c}%, #8B5A8E ${l+m+c}% 100%)`
                                })(),
                                boxShadow: '0 0 30px rgba(0,0,0,0.3)',
                            }}></div>
                            {/* Leyenda */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                                {[
                                    { color: '#D4A76A', label: 'Libros' },
                                    { color: '#A67C52', label: 'Mangas' },
                                    { color: '#C4B49F', label: 'Cómics' },
                                    { color: '#8B5A8E', label: 'Audiolibros' },
                                ].map(({ color, label }) => (
                                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc' }}>
                                        <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, display: 'inline-block' }} />
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <div style={{
                                padding: '15px',
                                background: 'rgba(212, 167, 106, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #D4A76A'
                            }}>
                                <p style={{ color: '#999', margin: '0 0 5px 0', fontSize: '0.9rem' }}>📖 Libros</p>
                                <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {analyticsData.distribution?.libros_count || 0}
                                </p>
                                <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.8rem' }}>
                                    {analyticsData.distribution?.libros_percent || 0}%
                                </p>
                            </div>

                            <div style={{
                                padding: '15px',
                                background: 'rgba(166, 124, 82, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #A67C52'
                            }}>
                                <p style={{ color: '#999', margin: '0 0 5px 0', fontSize: '0.9rem' }}>🗯️ Mangas</p>
                                <p style={{ color: '#A67C52', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {analyticsData.distribution?.mangas_count || 0}
                                </p>
                                <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.8rem' }}>
                                    {analyticsData.distribution?.mangas_percent || 0}%
                                </p>
                            </div>

                            <div style={{
                                padding: '15px',
                                background: 'rgba(196, 180, 159, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #C4B49F'
                            }}>
                                <p style={{ color: '#999', margin: '0 0 5px 0', fontSize: '0.9rem' }}>🦸 Cómics</p>
                                <p style={{ color: '#C4B49F', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {analyticsData.distribution?.comics_count || 0}
                                </p>
                                <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.8rem' }}>
                                    {analyticsData.distribution?.comics_percent || 0}%
                                </p>
                            </div>

                            <div style={{
                                padding: '15px',
                                background: 'rgba(139, 90, 142, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #8B5A8E'
                            }}>
                                <p style={{ color: '#999', margin: '0 0 5px 0', fontSize: '0.9rem' }}>🎧 Audiolibros</p>
                                <p style={{ color: '#c084cc', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {analyticsData.distribution?.audiobooks_count || 0}
                                </p>
                                <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.8rem' }}>
                                    {analyticsData.distribution?.audiobooks_percent || 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PREMIUM SECTION */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(212, 167, 106, 0.1) 0%, rgba(166, 124, 82, 0.1) 100%)',
                    padding: '25px',
                    borderRadius: '8px',
                    border: '1px solid #D4A76A',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#D4A76A'
                    }}>
                        💎 Análisis Premium
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Usuarios Premium</p>
                            <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {analyticsData.premium?.premium_users || 0}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Ingresos Mensuales</p>
                            <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                                ${analyticsData.premium?.monthly_revenue || '0'}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Total Ingresos</p>
                            <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                                ${analyticsData.premium?.premium_revenue || '0'}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Tasa Conversión</p>
                            <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {analyticsData.premium?.conversion_rate || '0'}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* LECTURA STATS - NEW */}
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: '#FFFBF5'
                    }}>
                        📚 Estadísticas de Lectura
                    </h3>
                    <ReadingStatsCards />
                </div>

                {/* TENDENCIAS DE LECTURA - NEW */}
                <ReadingTrendsChart />

                {/* CONTENIDO POPULAR - NEW */}
                <PopularContentChart />

                {/* ANÁLISIS DETALLADO DE LECTURA - NEW */}
                <div>
                    <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        marginBottom: '15px',
                        color: '#FFFBF5'
                    }}>
                        📊 Análisis Demográfico de Lectura
                    </h3>
                    <ReadingAnalytics />
                </div>
            </div>
        </MainLayout>
    )
}

export default AnalyticsPage
