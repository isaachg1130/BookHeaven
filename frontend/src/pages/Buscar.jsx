import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUtils'
import { contentAPI } from '../api/content'
import '../styles/buscar.css'

function Buscar() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [data, setData] = useState({ books: [], mangas: [], comics: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [b, m, c] = await Promise.all([
                    contentAPI.getLibros({ per_page: 15 }),
                    contentAPI.getMangas({ per_page: 15 }),
                    contentAPI.getComics({ per_page: 15 })
                ])
                setData({
                    books: b.data.data || [],
                    mangas: m.data.data || [],
                    comics: c.data.data || []
                })
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const combined = useMemo(() => {
        const adapt = (item, type) => ({ ...item, _type: type })
        return [
            ...data.books.map(b => adapt(b, 'Libro')),
            ...data.mangas.map(m => adapt(m, 'Manga')),
            ...data.comics.map(c => adapt(c, 'Cómic'))
        ]
    }, [data])

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return combined
        return combined.filter(item => (
            (item.titulo || item.nombre || '').toLowerCase().includes(q) ||
            (item.autor || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q)
        ))
    }, [query, combined])

    if (loading) {
        return (
            <div className="buscar-wrapper">
                <div className="buscar-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="spinner" style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>⏳</div>
                    <p style={{ marginTop: '20px', color: '#D4A76A' }}>Preparando estanterías...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="buscar-wrapper">
            <div className="buscar-container">
                <h2>Buscar</h2>
                <div className="buscar-input">
                    <svg className="buscar-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#D4A76A" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Buscar libros, cómics, mangas por título o autor..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="buscar-results">
                    {results.length === 0 ? (
                        <p className="buscar-empty">No se encontraron resultados.</p>
                    ) : (
                        results.map(item => (
                            <div key={`${item._type}-${item.id || (item.titulo || item.nombre)}`} className="buscar-card">
                                <img src={getImageUrl(item.imagen)} alt={item.titulo || item.nombre} />
                                <div className="buscar-card__body">
                                    <h3>{item.titulo || item.nombre}</h3>
                                    <p className="buscar-type">{item._type}</p>
                                    <p className="buscar-desc">{item.description || item.sinopsis || 'Sin descripción disponible.'}</p>
                                </div>
                                <div className="buscar-actions">
                                    <button className="buscar-btn" onClick={() => navigate(item._type === 'Libro' ? '/biblioteca' : '/novedades')}>Ver</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Buscar
