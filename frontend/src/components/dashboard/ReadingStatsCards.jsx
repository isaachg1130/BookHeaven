import React from 'react'
import useReadingAnalytics from '../../hooks/useReadingAnalytics'

/**
 * ReadingStatsCards - Componente para mostrar tarjetas de estadísticas de lectura
 * Muestra métricas rápidas de lectura
 */
const ReadingStatsCards = () => {
    const { data, loading, error } = useReadingAnalytics('/api/admin/reading-analytics/by-user-type')

    if (loading) {
        return null
    }

    if (error || !data?.standard) {
        return null
    }

    const stats = data
    const totalReadings = (stats.standard?.total_lecturas || 0) + (stats.premium?.total_lecturas || 0)
    const avgCompletion = stats.standard && stats.premium
        ? ((stats.standard.tasa_completación + stats.premium.tasa_completación) / 2).toFixed(1)
        : 0

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
        }}>
            <div style={{
                padding: '20px',
                background: 'rgba(75, 192, 192, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #4BC0C0'
            }}>
                <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Total Lecturas</p>
                <p style={{ color: '#4BC0C0', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {totalReadings}
                </p>
            </div>

            <div style={{
                padding: '20px',
                background: 'rgba(153, 102, 255, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #9966FF'
            }}>
                <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>% Completación Promedio</p>
                <p style={{ color: '#9966FF', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {avgCompletion}%
                </p>
            </div>

            <div style={{
                padding: '20px',
                background: 'rgba(255, 159, 64, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #FF9F40'
            }}>
                <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Usuarios Activos en Lectura</p>
                <p style={{ color: '#FF9F40', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {(stats.standard?.usuarios || 0) + (stats.premium?.usuarios || 0)}
                </p>
            </div>

            <div style={{
                padding: '20px',
                background: 'rgba(54, 162, 235, 0.1)',
                borderRadius: '8px',
                borderLeft: '4px solid #36A2EB'
            }}>
                <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Calificación Promedio</p>
                <p style={{ color: '#36A2EB', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {stats.standard && stats.premium
                        ? ((stats.standard.calificacion_promedio + stats.premium.calificacion_promedio) / 2).toFixed(2)
                        : '0'} ⭐
                </p>
            </div>
        </div>
    )
}

export default ReadingStatsCards
