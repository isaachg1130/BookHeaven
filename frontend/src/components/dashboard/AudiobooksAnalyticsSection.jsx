import React, { useMemo } from 'react'

/**
 * AudiobooksAnalyticsSection - Análisis dedicado a audiolibros
 * 
 * Muestra:
 * - Audiolibros más leídos
 * - Audiolibros menos leídos
 * - Estadísticas de visualizaciones
 */
const AudiobooksAnalyticsSection = React.memo(({ readingAnalytics }) => {
    // Filtrar solo audiolibros de los datos de lectura
    const audiobooks = useMemo(() => {
        if (!readingAnalytics) return { mostRead: [], leastRead: [] }
        
        const mostReadAudiobooks = (readingAnalytics.most_read || [])
            .filter(item => item.type === 'Audiolibro')
            .slice(0, 12)
        
        const leastReadAudiobooks = (readingAnalytics.least_read || [])
            .filter(item => item.type === 'Audiolibro')
            .slice(0, 12)
        
        return {
            mostRead: mostReadAudiobooks,
            leastRead: leastReadAudiobooks
        }
    }, [readingAnalytics])

    // Estadísticas agregadas de audiolibros
    const stats = useMemo(() => {
        const all = [...(audiobooks.mostRead || []), ...(audiobooks.leastRead || [])]
        const uniqueAudiobooks = new Set(all.map(a => a.id))
        
        const totalReadersCount = all.reduce((sum, item) => sum + (item.reader_count || 0), 0)
        const totalSessions = all.reduce((sum, item) => sum + (item.total_sessions || 0), 0)
        const avgRating = all.length > 0 
            ? (all.reduce((sum, item) => sum + (item.avg_rating || 0), 0) / all.length).toFixed(1)
            : 0

        return {
            totalUnique: uniqueAudiobooks.size,
            totalReaders: totalReadersCount,
            totalSessions: totalSessions,
            avgRating: avgRating
        }
    }, [audiobooks])

    if (!audiobooks.mostRead.length && !audiobooks.leastRead.length) {
        return null
    }

    const AudiobookCard = ({ item, rank, isMostRead }) => (
        <div style={{
            display: 'flex',
            gap: '12px',
            padding: '12px',
            background: 'rgba(139, 90, 142, 0.08)',
            borderRadius: '6px',
            borderLeft: `4px solid #8B5A8E`,
            transition: 'all 0.2s',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 90, 142, 0.15)'
            e.currentTarget.style.transform = 'translateX(4px)'
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(139, 90, 142, 0.08)'
            e.currentTarget.style.transform = 'translateX(0)'
        }}>
            {/* Rank Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isMostRead ? 'rgba(139, 90, 142, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                color: isMostRead ? '#8B5A8E' : '#999',
                flexShrink: 0
            }}>
                #{rank}
            </div>

            {/* Content Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#FFFBF5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {item.title}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#999'
                }}>
                    por {item.author || 'N/A'}
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px',
                minWidth: '70px'
            }}>
                <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#D4A76A'
                }}>
                    👥 {item.reader_count}
                </div>
                <div style={{
                    fontSize: '0.75rem',
                    color: '#FFB347'
                }}>
                    ⭐ {item.avg_rating || '-'}
                </div>
            </div>
        </div>
    )

    return (
        <div style={{
            background: 'transparent',
            marginBottom: '30px',
            padding: '0'
        }}>
            {/* Header with stats */}
            <div style={{
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '15px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: '#8B5A8E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '1.6rem' }}>🎧</span>
                        Análisis de Audiolibros
                    </h2>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        background: 'rgba(139, 90, 142, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(139, 90, 142, 0.3)',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999' }}>
                            Audiolibros
                        </p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#8B5A8E' }}>
                            {stats.totalUnique}
                        </p>
                    </div>
                    
                    <div style={{
                        background: 'rgba(139, 90, 142, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(139, 90, 142, 0.3)',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999' }}>
                            👥 Oyentes
                        </p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#8B5A8E' }}>
                            {stats.totalReaders}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(139, 90, 142, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(139, 90, 142, 0.3)',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999' }}>
                            Sesiones
                        </p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#8B5A8E' }}>
                            {stats.totalSessions}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(139, 90, 142, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: '1px solid rgba(139, 90, 142, 0.3)',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#999' }}>
                            ⭐ Promedio
                        </p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#8B5A8E' }}>
                            {stats.avgRating}
                        </p>
                    </div>
                </div>
            </div>

            {/* Two Column Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '20px'
            }}>
                {/* Más Escuchados */}
                {audiobooks.mostRead.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(40, 40, 40, 0.8) 100%)',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid rgba(139, 90, 142, 0.2)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            fontSize: '1.05rem',
                            fontWeight: 'bold',
                            color: '#8B5A8E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>🔥</span>
                            Más Escuchados
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {audiobooks.mostRead.map((item, idx) => (
                                <AudiobookCard
                                    key={`most-${item.id}`}
                                    item={item}
                                    rank={idx + 1}
                                    isMostRead={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Menos Escuchados */}
                {audiobooks.leastRead.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(40, 40, 40, 0.8) 100%)',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid rgba(139, 90, 142, 0.2)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            fontSize: '1.05rem',
                            fontWeight: 'bold',
                            color: '#A67C52',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>❄️</span>
                            Menos Escuchados
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {audiobooks.leastRead.map((item, idx) => (
                                <AudiobookCard
                                    key={`least-${item.id}`}
                                    item={item}
                                    rank={idx + 1}
                                    isMostRead={false}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})

AudiobooksAnalyticsSection.displayName = 'AudiobooksAnalyticsSection'

export default AudiobooksAnalyticsSection
