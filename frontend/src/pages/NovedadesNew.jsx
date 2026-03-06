import React, { useState, useEffect } from 'react'
import { contentAPI } from '../api/content'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/novedades-new.css'

function Novedades() {
    const [activeFilter, setActiveFilter] = useState('todos')
    const [allContent, setAllContent] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            const [librosRes, mangasRes, comicsRes] = await Promise.all([
                contentAPI.getLibros({ per_page: 12, sort: 'newest' }),
                contentAPI.getMangas({ per_page: 12, sort: 'newest' }),
                contentAPI.getComics({ per_page: 12, sort: 'newest' }),
            ])

            const libros = (librosRes.data.data || []).map(item => ({ ...item, type: 'libro' }))
            const mangas = (mangasRes.data.data || []).map(item => ({ ...item, type: 'manga' }))
            const comics = (comicsRes.data.data || []).map(item => ({ ...item, type: 'comic' }))

            const combined = [...libros, ...mangas, ...comics].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )

            setAllContent(combined)
        } catch (err) {
            console.error('Error al cargar novedades:', err)
            setError('No se pudieron cargar las novedades')
        } finally {
            setLoading(false)
        }
    }

    const getFilteredContent = () => {
        if (activeFilter === 'todos') return allContent
        return allContent.filter(item => item.type === activeFilter)
    }

    const filtered = getFilteredContent()

    return (
        <div className="novedades-container">
            <div className="novedades-wrapper">
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ color: '#E8DCC8', marginBottom: '10px' }}>⭐ Novedades Populares</h1>
                    <p style={{ color: '#D4A76A' }}>Descubre el contenido más reciente y popular</p>
                </div>

                {/* Filters */}
                <div className="novedades-filters">
                    <button
                        className={`filter-btn ${activeFilter === 'todos' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('todos')}
                    >
                        📚 Todos ({allContent.length})
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === 'libro' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('libro')}
                    >
                        📖 Libros
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === 'manga' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('manga')}
                    >
                        🎨 Mangas
                    </button>
                    <button
                        className={`filter-btn ${activeFilter === 'comic' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('comic')}
                    >
                        💫 Cómics
                    </button>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⭐</div>
                        <p style={{ color: '#D4A76A' }}>Cargando novedades...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
                        <p style={{ color: '#D4A76A' }}>{error}</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="novelty-grid">
                        {filtered.map(item => (
                            <div key={`${item.type}-${item.id}`} className="novelty-card">
                                <div className="novelty-card-image">
                                    <img
                                        src={getImageUrl(item.imagen)}
                                        alt={item.titulo || item.nombre}
                                    />
                                    <div className="novelty-badge">
                                        {item.type === 'libro' && '📖'}
                                        {item.type === 'manga' && '🎨'}
                                        {item.type === 'comic' && '💫'}
                                    </div>
                                </div>
                                <div className="novelty-content">
                                    <h3>{item.titulo || item.nombre}</h3>
                                    <p className="novelty-description">{item.descripcion?.substring(0, 100)}...</p>
                                    <div className="novelty-footer">
                                        <span className="novelty-author">{item.autor || 'Anónimo'}</span>
                                        <span className="novelty-rating">⭐ 4.8</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📚</div>
                        <p style={{ color: '#D4A76A' }}>No hay novedades en esta categoría</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Novedades
