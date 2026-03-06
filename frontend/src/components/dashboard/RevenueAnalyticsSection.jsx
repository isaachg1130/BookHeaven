import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

/**
 * RevenueCard - Card individual de ingresos
 * Declarado fuera para evitar recreación en cada render
 */
const RevenueCard = React.memo(({ title, value, color, icon, subtitle }) => (
    <div style={{
        background: `linear-gradient(135deg, rgba(212, 167, 106, 0.1) 0%, rgba(166, 124, 82, 0.05) 100%)`,
        borderRadius: '10px',
        padding: '20px',
        border: `1px solid ${color}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 167, 106, 0.2)'
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
        }}>
            <div>
                <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#999',
                    marginBottom: '4px'
                }}>
                    {title}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: color
                }}>
                    ${parseFloat(value).toFixed(2)}
                </p>
            </div>
            <span style={{
                fontSize: '2rem'
            }}>
                {icon}
            </span>
        </div>
        {subtitle && (
            <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#999'
            }}>
                {subtitle}
            </p>
        )}
    </div>
))

RevenueCard.displayName = 'RevenueCard'

/**
 * RevenueAnalyticsSection - Análisis de ingresos por período
 * 
 * Muestra:
 * - Ingresos de hoy, semana, mes y año
 * - Gráfico de ingresos diarios de los últimos 30 días
 */
const RevenueAnalyticsSection = React.memo(({ revenueData }) => {
    // Preparar datos para la gráfica - ANTES de cualquier condicional
    const maxRevenue = useMemo(() => {
        if (!revenueData?.daily_breakdown) return 1
        return Math.max(...(revenueData.daily_breakdown.map(d => d.amount) || [1]), 1)
    }, [revenueData])

    // Validar después del hook
    if (!revenueData) return null

    return (
        <div style={{
            background: 'transparent',
            marginBottom: '30px'
        }}>
            {/* Título */}
            <h2 style={{
                margin: '0 0 20px 0',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#D4A76A',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                Análisis de Ingresos por Suscripción
            </h2>

            {/* Cards de ingresos por período */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '25px'
            }}>
                <RevenueCard
                    title="Hoy"
                    value={revenueData.today}
                    icon="📅"
                    color="rgba(212, 167, 106, 0.8)"
                />
                <RevenueCard
                    title="Esta Semana"
                    value={revenueData.this_week}
                    icon="📊"
                    color="rgba(196, 180, 159, 0.8)"
                />
                <RevenueCard
                    title="Este Mes"
                    value={revenueData.this_month}
                    icon="📈"
                    color="rgba(166, 124, 82, 0.8)"
                />
                <RevenueCard
                    title="Este Año"
                    value={revenueData.this_year}
                    icon="🎯"
                    color="rgba(139, 90, 142, 0.8)"
                />
                <RevenueCard
                    title="Total"
                    value={revenueData.all_time}
                    icon="⭐"
                    color="rgba(255, 215, 0, 0.7)"
                    subtitle="Ingresos acumulados"
                />
            </div>

            {/* Gráfico de ingresos diarios */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(40, 40, 40, 0.8) 100%)',
                borderRadius: '10px',
                padding: '25px',
                border: '1px solid rgba(212, 167, 106, 0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                <h3 style={{
                    margin: '0 0 20px 0',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#D4A76A'
                }}>
                    📈 Ingresos Diarios (Últimos 30 días)
                </h3>

                {/* Gráfico de Área */}
                {revenueData.daily_breakdown && revenueData.daily_breakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                            data={revenueData.daily_breakdown}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4A76A" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#D4A76A" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="rgba(150, 150, 150, 0.1)"
                                vertical={false}
                            />
                            <XAxis 
                                dataKey="date" 
                                stroke="#999"
                                style={{ fontSize: '0.8rem' }}
                                tick={{ fill: '#999' }}
                            />
                            <YAxis 
                                stroke="#999"
                                style={{ fontSize: '0.8rem' }}
                                tick={{ fill: '#999' }}
                                label={{ value: 'Ingresos ($)', angle: -90, position: 'insideLeft', style: { fill: '#999' } }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                    border: '1px solid #D4A76A',
                                    borderRadius: '6px',
                                    color: '#D4A76A',
                                    padding: '10px'
                                }}
                                formatter={(value) => `$${value.toFixed(2)}`}
                                labelStyle={{ color: '#D4A76A' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#D4A76A" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)"
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        height: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                    }}>
                        Sin datos de ingresos
                    </div>
                )}

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginTop: '20px'
                }}>
                    <div style={{
                        background: 'rgba(212, 167, 106, 0.1)',
                        padding: '12px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #D4A76A'
                    }}>
                        <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.8rem',
                            color: '#999'
                        }}>
                            Promedio Diario
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#D4A76A'
                        }}>
                            ${revenueData.daily_breakdown && revenueData.daily_breakdown.length > 0
                                ? (revenueData.daily_breakdown.reduce((sum, d) => sum + d.amount, 0) / revenueData.daily_breakdown.length).toFixed(2)
                                : '0.00'
                            }
                        </p>
                    </div>
                    <div style={{
                        background: 'rgba(166, 124, 82, 0.1)',
                        padding: '12px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #A67C52'
                    }}>
                        <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.8rem',
                            color: '#999'
                        }}>
                            Máximo Diario
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#A67C52'
                        }}>
                            ${revenueData.daily_breakdown && revenueData.daily_breakdown.length > 0
                                ? Math.max(...revenueData.daily_breakdown.map(d => d.amount)).toFixed(2)
                                : '0.00'
                            }
                        </p>
                    </div>
                    <div style={{
                        background: 'rgba(196, 180, 159, 0.1)',
                        padding: '12px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #C4B49F'
                    }}>
                        <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.8rem',
                            color: '#999'
                        }}>
                            Días con Ventas
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: '#C4B49F'
                        }}>
                            {revenueData.daily_breakdown
                                ? revenueData.daily_breakdown.filter(d => d.amount > 0).length
                                : 0
                            } de {revenueData.daily_breakdown?.length || 30}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
})

RevenueAnalyticsSection.displayName = 'RevenueAnalyticsSection'

export default RevenueAnalyticsSection
