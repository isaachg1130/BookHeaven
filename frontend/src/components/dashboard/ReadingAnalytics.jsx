import React, { useMemo } from 'react'
import useReadingAnalytics from '../../hooks/useReadingAnalytics'

/**
 * ReadingAnalytics - Componente para mostrar análisis de lectura
 * Muestra:
 * - Estadísticas por género
 * - Estadísticas por edad
 * - Estadísticas por país
 * - Estadísticas por tipo de usuario
 */
const ReadingAnalytics = () => {
    const { data, loading, error, retry } = useReadingAnalytics()

    const analyticsData = useMemo(() => ({
        byGender: data?.comparativas?.por_genero || {},
        byAge: data?.comparativas?.por_edad || {},
        byCountry: data?.comparativas?.por_pais || [],
        byUserType: data?.comparativas?.por_tipo_usuario || {},
    }), [data])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner"></div>
                <p>Cargando análisis de lectura...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                padding: '20px',
                background: 'rgba(255, 67, 54, 0.1)',
                border: '1px solid #ff4336',
                borderRadius: '8px',
                color: '#ff9800',
                marginBottom: '20px'
            }}>
                <p>{error}</p>
                <button onClick={retry} style={{
                    padding: '8px 16px',
                    background: '#ff9800',
                    color: '#1f1f1f',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* POR GÉNERO */}
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
                    📊 Análisis de Lectura por Género
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {Object.entries(analyticsData.byGender).map(([gender, stats]) => (
                        <div key={gender} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid rgba(212, 167, 106, 0.3)'
                        }}>
                            <h4 style={{ color: '#D4A76A', marginTop: 0 }}>
                                {gender === 'masculino' ? '👨' : gender === 'femenino' ? '👩' : '👥'} {' '}
                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </h4>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                👤 Usuarios: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.usuarios}</span>
                            </p>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                📚 Lecturas: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.total_lecturas}</span>
                            </p>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                📈 Progreso: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.promedio_progreso}%</span>
                            </p>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                ⭐ Calificación: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.calificacion_promedio}/5</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* POR EDAD */}
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
                    🎂 Análisis de Lectura por Edad
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {Object.entries(analyticsData.byAge).map(([ageRange, stats]) => (
                        <div key={ageRange} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid rgba(212, 167, 106, 0.3)'
                        }}>
                            <h4 style={{ color: '#D4A76A', marginTop: 0 }}>
                                {ageRange} años
                            </h4>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                👥 Usuarios: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.usuarios}</span>
                            </p>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                📚 Lecturas: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.total_lecturas}</span>
                            </p>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                ✅ Completadas: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.tasa_completación}%</span>
                            </p>
                            <p style={{ color: '#999', margin: '5px 0' }}>
                                📈 Progreso: <span style={{ color: '#D4A76A', fontWeight: 'bold' }}>{stats.promedio_progreso}%</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* POR PAÍS */}
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
                    🌍 Top Países - Análisis de Lectura
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
                                <th style={{ padding: '10px', textAlign: 'left', color: '#D4A76A' }}>País</th>
                                <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Usuarios</th>
                                <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Lecturas</th>
                                <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Progreso</th>
                                <th style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>Calificación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.byCountry.map((country, idx) => (
                                <tr key={idx} style={{
                                    borderBottom: '1px solid #444',
                                    background: idx % 2 === 0 ? 'rgba(212, 167, 106, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ padding: '10px', color: '#FFFBF5' }}>{country.country}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>{country.usuarios}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>{country.total_lecturas}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>
                                        {(parseFloat(country.promedio_progreso) || 0).toFixed(1)}%
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: '#D4A76A' }}>
                                        {(parseFloat(country.calificacion_promedio) || 0).toFixed(2)}/5
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POR TIPO DE USUARIO */}
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
                    💎 Lectura: Premium vs Standard
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {Object.entries(analyticsData.byUserType).map(([userType, stats]) => (
                        <div key={userType} style={{
                            background: userType === 'premium' 
                                ? 'rgba(212, 167, 106, 0.1)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            padding: '20px',
                            borderRadius: '8px',
                            border: userType === 'premium' 
                                ? '2px solid #D4A76A' 
                                : '1px solid rgba(212, 167, 106, 0.3)'
                        }}>
                            <h4 style={{ 
                                color: userType === 'premium' ? '#D4A76A' : '#999', 
                                marginTop: 0,
                                fontSize: '1.1rem'
                            }}>
                                {userType === 'premium' ? '💎 Premium' : '👤 Standard'}
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px'
                            }}>
                                <div>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>Usuarios</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {stats.usuarios}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>Lecturas</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {stats.total_lecturas}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>Completadas</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {stats.lecturas_completadas}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>% Completación</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {stats.tasa_completación}%
                                    </p>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>Progreso Promedio</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        {stats.promedio_progreso}%
                                    </p>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>Calificación Promedio</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        {stats.calificacion_promedio}/5 ⭐
                                    </p>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <p style={{ color: '#999', margin: '5px 0', fontSize: '0.9rem' }}>Tiempo Promedio</p>
                                    <p style={{ color: '#D4A76A', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        {Math.floor(stats.promedio_tiempo_minutos / 60)}h {Math.floor(stats.promedio_tiempo_minutos % 60)}m
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ReadingAnalytics
