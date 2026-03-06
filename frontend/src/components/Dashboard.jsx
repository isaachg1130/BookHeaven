import React, { useEffect, useState } from 'react'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/dashboard.css'

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdate, setLastUpdate] = useState(new Date())

    // Función para obtener datos del dashboard
    const fetchDashboardData = async (showLoadingState = true) => {
        if (showLoadingState) setLoading(true)
        setIsRefreshing(true)
        
        try {
            const response = await fetch('http://localhost:8000/api/dashboard/stats')
            
            if (!response.ok) {
                throw new Error('No se pudo obtener los datos del dashboard')
            }

            const data = await response.json()
            setDashboardData(data)
            setLastUpdate(new Date())
        } catch (err) {
            console.error('Error al obtener datos del dashboard:', err)
            setLastUpdate(new Date())
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    // Carga inicial
    useEffect(() => {
        // Cargar datos inicialmente
        fetchDashboardData(true)
    }, [])

    // Polling automático para audiolibros (cada 30 segundos)
    // Los audiolibros se actualizan automáticamente sin afectar el resto del dashboard
    useEffect(() => {
        const pollingInterval = setInterval(() => {
            fetchDashboardData(false)
        }, 30000) // 30 segundos

        return () => clearInterval(pollingInterval)
    }, [])

    // Escuchar eventos de actualización desde localStorage
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'dashboardUpdate') {
                fetchDashboardData(false)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Cargando dashboard...</p>
            </div>
        )
    }

    if (!dashboardData) {
        return <div className="dashboard-error">No hay datos disponibles</div>
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible'
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    return (
        <div className="dashboard">
            <div className="dashboard__container">
                {/* Encabezado */}
                <div className="dashboard__header">
                    <div className="dashboard__header-top">
                        <h1 className="dashboard__title">Dashboard</h1>
                        <div className="dashboard__header-controls">
                            <p className="dashboard__last-update">
                                Actualizado: {lastUpdate.toLocaleTimeString('es-ES')}
                            </p>
                            <button 
                                className={`dashboard__refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                                onClick={() => fetchDashboardData(false)}
                                disabled={isRefreshing}
                                title="Actualizar datos"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Actualizar
                            </button>
                        </div>
                    </div>
                    <p className="dashboard__subtitle">Resumen de contenido y estadísticas</p>
                </div>

                {/* Tarjetas de estadísticas principales */}
                <div className="dashboard__stats">
                    <div className="stat-card stat-card--libros">
                        <div className="stat-card__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 17m0 0C6.933 17 7.357 16.917 7.75 16.763M20 8V7c0-1.1-.9-2-2-2h-2.75c-.413 0-.806.057-1.184.165M20 8H3.75m0 0V5.25C3.75 4.006 4.756 3 6 3h11.25c1.243 0 2.25 1.006 2.25 2.25V8M3.75 17c-.413 0-.806-.057-1.184-.165" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <p className="stat-card__label">Libros</p>
                            <h3 className="stat-card__value">{dashboardData.libros}</h3>
                        </div>
                    </div>

                    <div className="stat-card stat-card--comics">
                        <div className="stat-card__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M6 6H18M6 12H18M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <p className="stat-card__label">Cómics</p>
                            <h3 className="stat-card__value">{dashboardData.comics}</h3>
                        </div>
                    </div>

                    <div className="stat-card stat-card--mangas">
                        <div className="stat-card__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
                                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <p className="stat-card__label">Mangas</p>
                            <h3 className="stat-card__value">{dashboardData.mangas}</h3>
                        </div>
                    </div>

                    <div className="stat-card stat-card--audiobooks">
                        <div className="stat-card__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
                                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <p className="stat-card__label">Audiolibros</p>
                            <h3 className="stat-card__value">{dashboardData.audiobooks}</h3>
                        </div>
                    </div>

                    <div className="stat-card stat-card--usuarios">
                        <div className="stat-card__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <p className="stat-card__label">Usuarios</p>
                            <h3 className="stat-card__value">{dashboardData.usuarios}</h3>
                        </div>
                    </div>

                    <div className="stat-card stat-card--total">
                        <div className="stat-card__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="stat-card__content">
                            <p className="stat-card__label">Total Contenido</p>
                            <h3 className="stat-card__value">{dashboardData.total_contenido}</h3>
                        </div>
                    </div>
                </div>

                {/* Sección de distribución */}
                <div className="dashboard__section">
                    <h2 className="dashboard__section-title">Distribución de Contenido</h2>
                    <div className="distribution-chart">
                        <div className="chart-item">
                            <div className="chart-bar">
                                <div 
                                    className="chart-bar__fill chart-bar__fill--libros"
                                    style={{ height: `${(dashboardData.distribucion.libros / dashboardData.total_contenido) * 100}%` }}
                                ></div>
                            </div>
                            <p className="chart-label">Libros</p>
                            <p className="chart-value">{dashboardData.distribucion.libros}</p>
                        </div>
                        <div className="chart-item">
                            <div className="chart-bar">
                                <div 
                                    className="chart-bar__fill chart-bar__fill--comics"
                                    style={{ height: `${(dashboardData.distribucion.comics / dashboardData.total_contenido) * 100}%` }}
                                ></div>
                            </div>
                            <p className="chart-label">Cómics</p>
                            <p className="chart-value">{dashboardData.distribucion.comics}</p>
                        </div>
                        <div className="chart-item">
                            <div className="chart-bar">
                                <div 
                                    className="chart-bar__fill chart-bar__fill--mangas"
                                    style={{ height: `${(dashboardData.distribucion.mangas / dashboardData.total_contenido) * 100}%` }}
                                ></div>
                            </div>
                            <p className="chart-label">Mangas</p>
                            <p className="chart-value">{dashboardData.distribucion.mangas}</p>
                        </div>
                        <div className="chart-item">
                            <div className="chart-bar">
                                <div 
                                    className="chart-bar__fill chart-bar__fill--audiobooks"
                                    style={{ height: `${(dashboardData.distribucion.audiobooks / dashboardData.total_contenido) * 100}%` }}
                                ></div>
                            </div>
                            <p className="chart-label">Audiolibros</p>
                            <p className="chart-value">{dashboardData.distribucion.audiobooks}</p>
                        </div>
                    </div>
                </div>

                {/* Sección de últimos contenidos */}
                <div className="dashboard__section">
                    <h2 className="dashboard__section-title">Últimas Adiciones</h2>
                    
                    {/* Últimos Libros */}
                    {dashboardData.ultimos.libros.length > 0 && (
                        <div className="content-category">
                            <h3 className="content-category__title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 17m0 0C6.933 17 7.357 16.917 7.75 16.763M20 8V7c0-1.1-.9-2-2-2h-2.75c-.413 0-.806.057-1.184.165M20 8H3.75m0 0V5.25C3.75 4.006 4.756 3 6 3h11.25c1.243 0 2.25 1.006 2.25 2.25V8M3.75 17c-.413 0-.806-.057-1.184-.165" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Libros
                            </h3>
                            <div className="content-grid">
                                {dashboardData.ultimos.libros.map(libro => (
                                    <div key={libro.id} className="content-card">
                                        <div className="content-card__image">
                                            <img src={getImageUrl(libro.imagen)} alt={libro.nombre} />
                                            <div className="content-card__overlay">
                                                <button className="content-card__btn">Ver Detalles</button>
                                            </div>
                                        </div>
                                        <div className="content-card__info">
                                            <h4 className="content-card__title">{libro.nombre}</h4>
                                            <p className="content-card__author">{libro.autor}</p>
                                            <p className="content-card__date">{formatDate(libro.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Últimos Cómics */}
                    {dashboardData.ultimos.comics.length > 0 && (
                        <div className="content-category">
                            <h3 className="content-category__title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M6 6H18M6 12H18M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Cómics
                            </h3>
                            <div className="content-grid">
                                {dashboardData.ultimos.comics.map(comic => (
                                    <div key={comic.id} className="content-card">
                                        <div className="content-card__image">
                                            <img src={getImageUrl(comic.imagen)} alt={comic.nombre} />
                                            <div className="content-card__overlay">
                                                <button className="content-card__btn">Ver Detalles</button>
                                            </div>
                                        </div>
                                        <div className="content-card__info">
                                            <h4 className="content-card__title">{comic.nombre.trim()}</h4>
                                            <p className="content-card__author">{comic.autor}</p>
                                            <p className="content-card__date">{formatDate(comic.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Últimos Mangas */}
                    {dashboardData.ultimos.mangas.length > 0 && (
                        <div className="content-category">
                            <h3 className="content-category__title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
                                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                                </svg>
                                Mangas
                            </h3>
                            <div className="content-grid">
                                {dashboardData.ultimos.mangas.map(manga => (
                                    <div key={manga.id} className="content-card">
                                        <div className="content-card__image">
                                            <img src={getImageUrl(manga.imagen)} alt={manga.nombre} />
                                            <div className="content-card__overlay">
                                                <button className="content-card__btn">Ver Detalles</button>
                                            </div>
                                        </div>
                                        <div className="content-card__info">
                                            <h4 className="content-card__title">{manga.nombre}</h4>
                                            <p className="content-card__author">{manga.autor}</p>
                                            <p className="content-card__date">{formatDate(manga.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Últimos Audiolibros */}
                    {dashboardData.ultimos.audiobooks && dashboardData.ultimos.audiobooks.length > 0 && (
                        <div className="content-category">
                            <h3 className="content-category__title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
                                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                                    <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                Audiolibros
                            </h3>
                            <div className="content-grid">
                                {dashboardData.ultimos.audiobooks.map(audiobook => (
                                    <div key={audiobook.id} className="content-card">
                                        <div className="content-card__image">
                                            <img src={getImageUrl(audiobook.imagen)} alt={audiobook.titulo} />
                                            <div className="content-card__overlay">
                                                <button className="content-card__btn">Ver Detalles</button>
                                            </div>
                                        </div>
                                        <div className="content-card__info">
                                            <h4 className="content-card__title">{audiobook.titulo}</h4>
                                            <p className="content-card__author">{audiobook.autor}</p>
                                            {audiobook.narrador && <p className="content-card__author">Narrador: {audiobook.narrador}</p>}
                                            <p className="content-card__date">{formatDate(audiobook.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
