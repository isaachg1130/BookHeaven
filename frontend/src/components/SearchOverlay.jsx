import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUtils'
import { contentAPI } from '../api/content'
import '../styles/search-overlay.css'

function SearchOverlay({ isOpen, onClose }) {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [data, setData] = useState({ books: [], mangas: [], comics: [] })
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    // Cargar datos al abrir el overlay
    useEffect(() => {
        if (isOpen && !data.books.length && !data.mangas.length && !data.comics.length) {
            setLoading(true)
            const fetchAll = async () => {
                try {
                    const [b, m, c] = await Promise.all([
                        contentAPI.getLibros({ per_page: 12 }),
                        contentAPI.getMangas({ per_page: 12 }),
                        contentAPI.getComics({ per_page: 12 })
                    ])
                    setData({
                        books: b.data.data || [],
                        mangas: m.data.data || [],
                        comics: c.data.data || []
                    })
                } catch (err) {
                    console.error('Error loading search data:', err)
                } finally {
                    setLoading(false)
                }
            }
            fetchAll()
        }
    }, [isOpen, data.books.length, data.mangas.length, data.comics.length])

    // Focus al input cuando se abre
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    // Cerrar con ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

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

    const handleItemClick = (item) => {
        navigate(item._type === 'Libro' ? '/biblioteca' : '/novedades')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={`search-overlay ${isOpen ? 'open' : ''}`}>
            {/* Backdrop */}
            <div className="search-overlay__backdrop" onClick={onClose}></div>

            {/* Contenedor del modal */}
            <div className="search-overlay__container">
                {/* Barra de búsqueda */}
                <div className="search-overlay__header">
                    <div className="search-overlay__input-wrapper">
                        <svg className="search-overlay__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#D4A76A" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="search"
                            placeholder="Buscar libros, cómics, mangas por título o autor..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="search-overlay__input"
                        />
                        <button
                            className="search-overlay__close"
                            onClick={onClose}
                            title="Cerrar búsqueda"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    {results.length > 0 && (
                        <p className="search-overlay__count">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
                    )}
                </div>

                {/* Resultados */}
                <div className="search-overlay__results">
                    {loading ? (
                        <div className="search-overlay__loading">
                            <div className="spinner"></div>
                            <p>Preparando estanterías...</p>
                        </div>
                    ) : results.length === 0 && query.trim() ? (
                        <div className="search-overlay__empty">
                            <p>No se encontraron resultados para "{query}"</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="search-overlay__empty">
                            <p>Comienza a escribir para buscar...</p>
                        </div>
                    ) : (
                        <div className="search-overlay__grid">
                            {results.map(item => (
                                <div
                                    key={`${item._type}-${item.id || (item.titulo || item.nombre)}`}
                                    className="search-overlay__card"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="search-overlay__card-image">
                                        <img src={getImageUrl(item.imagen)} alt={item.titulo || item.nombre} />
                                        <span className="search-overlay__card-type">{item._type}</span>
                                    </div>
                                    <div className="search-overlay__card-body">
                                        <h3>{item.titulo || item.nombre}</h3>
                                        {item.autor && <p className="search-overlay__author">{item.autor}</p>}
                                        <p className="search-overlay__desc">{item.description || item.sinopsis || 'Sin descripción disponible.'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchOverlay
