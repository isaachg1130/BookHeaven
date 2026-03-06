import React from 'react'
import useReadingAnalytics from '../../hooks/useReadingAnalytics'

/**
 * PopularContentChart - Componente para mostrar contenido más popular
 */
const PopularContentChart = () => {
    const { data, loading, error } = useReadingAnalytics('/api/admin/reading-analytics/popular-content')

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando contenido popular...</p>
            </div>
        )
    }

    if (error || !data?.content) {
        return null
    }

    const content = data.content || []

    const getContentTypeLabel = (type) => {
        switch(type) {
            case 'libro': return '📕 Libro'
            case 'manga': return '📗 Manga'
            case 'comic': return '📙 Cómic'
            case 'audiobook': return '🎧 Audiobook'
            default: return type
        }
    }

    return (
        <div style={{
            background: '#1f1f1f',
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
                ⭐ Top Contenido Más Popular
            </h3>

            <div style={{
                overflowX: 'auto'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #D4A76A' }}>
                            <th style={{ padding: '10px', textAlign: 'left', color: '#D4A76A' }}>Posición</th>
                            <th style={{ padding: '10px', textAlign: 'left', color: '#D4A76A' }}>Título</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Lectores Únicos</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Total Lecturas</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Completadas</th>
                            <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Calificación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content.map((item, idx) => {
                            const completionRate = item.lecturas_total > 0
                                ? ((item.lecturas_completadas / item.lecturas_total) * 100).toFixed(1)
                                : 0
                            
                            return (
                                <tr key={idx} style={{
                                    borderBottom: '1px solid #444',
                                    background: idx % 2 === 0 ? 'rgba(212, 167, 106, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ padding: '10px', color: '#FFFBF5', fontWeight: 'bold' }}>
                                        #{idx + 1} {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                                    </td>
                                    <td style={{ padding: '10px', color: '#D4A76A' }}>
                                        {item.title} <span style={{ fontSize: '0.9em', color: '#999' }}>({getContentTypeLabel(item.content_type)})</span>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>
                                        {item.usuarios_unicos}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>
                                        {item.lecturas_total}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>
                                        {completionRate}%
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <span style={{
                                            color: '#FFD700',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem'
                                        }}>
                                            {(parseFloat(item.calificacion_promedio) || 0).toFixed(2)}/5
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {content.length === 0 && (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                    No hay datos de contenido popular disponibles
                </p>
            )}
        </div>
    )
}

export default PopularContentChart
