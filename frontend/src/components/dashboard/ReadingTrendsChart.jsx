import React from 'react'
import {
    ComposedChart, Area, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts'
import useReadingAnalytics from '../../hooks/useReadingAnalytics'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#2a2a2a',
            border: '1px solid #3a3530',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
            <p style={{ color: '#D4A76A', fontWeight: 'bold', margin: '0 0 8px 0' }}>{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color, margin: '3px 0', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <span>{entry.name}</span>
                    <strong>{entry.value}</strong>
                </p>
            ))}
        </div>
    )
}

const ReadingTrendsChart = () => {
    const { data, loading, error } = useReadingAnalytics('/api/admin/reading-analytics/monthly-trends')

    if (loading) {
        return (
            <div style={{ background: '#1f1f1f', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#999' }}>
                Cargando tendencias...
            </div>
        )
    }

    if (error || !data?.trends?.length) return null

    const trends = data.trends.map(t => ({
        ...t,
        mes: (() => {
            try { return new Date(t.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }) }
            catch { return t.month }
        })()
    }))

    const totalLecturas = trends.reduce((s, t) => s + t.total_lecturas, 0)
    const totalCompletadas = trends.reduce((s, t) => s + (t.completadas || 0), 0)
    const totalAbandonadas = trends.reduce((s, t) => s + (t.abandonadas || 0), 0)
    const avgProgreso = trends.length
        ? (trends.reduce((s, t) => s + (t.promedio_progreso || 0), 0) / trends.length).toFixed(1)
        : 0

    return (
        <div style={{
            background: '#1f1f1f',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid rgba(212,167,106,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 6px 0', color: '#FFFBF5' }}>
                        📈 Tendencias Mensuales de Lectura
                    </h3>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.85rem' }}>Evolución de lecturas, completadas y abandonadas</p>
                </div>
                <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.78rem', color: '#4caf50',
                    background: 'rgba(76,175,80,0.1)', padding: '4px 10px',
                    borderRadius: '20px', border: '1px solid rgba(76,175,80,0.3)'
                }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4caf50', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    En tiempo real
                </span>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A76A" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#D4A76A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCompletadas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4BC0C0" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#4BC0C0" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '15px', fontSize: '0.82rem' }}
                        formatter={(value) => <span style={{ color: '#ccc' }}>{value}</span>}
                    />
                    <Area
                        type="monotone"
                        dataKey="total_lecturas"
                        name="Total lecturas"
                        stroke="#D4A76A"
                        strokeWidth={2.5}
                        fill="url(#gradTotal)"
                        dot={{ fill: '#D4A76A', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="completadas"
                        name="Completadas"
                        stroke="#4BC0C0"
                        strokeWidth={2}
                        fill="url(#gradCompletadas)"
                        dot={{ fill: '#4BC0C0', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="abandonadas"
                        name="Abandonadas"
                        stroke="#FF6384"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                        dot={{ fill: '#FF6384', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Stats footer */}
            <div style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingTop: '20px'
            }}>
                {[
                    { label: 'Total Lecturas', value: totalLecturas, color: '#D4A76A' },
                    { label: 'Completadas', value: totalCompletadas, color: '#4BC0C0' },
                    { label: 'Abandonadas', value: totalAbandonadas, color: '#FF6384' },
                    { label: 'Progreso Prom.', value: `${avgProgreso}%`, color: '#9966FF' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        padding: '12px 15px',
                        background: `rgba(${color === '#D4A76A' ? '212,167,106' : color === '#4BC0C0' ? '75,192,192' : color === '#FF6384' ? '255,99,132' : '153,102,255'},0.08)`,
                        borderRadius: '8px',
                        borderLeft: `3px solid ${color}`
                    }}>
                        <p style={{ color: '#888', margin: '0 0 6px 0', fontSize: '0.8rem' }}>{label}</p>
                        <p style={{ color, margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ReadingTrendsChart
