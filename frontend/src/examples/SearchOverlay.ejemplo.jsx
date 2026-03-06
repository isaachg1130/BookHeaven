// Ejemplo de implementación de optimizaciones en SearchOverlay.jsx
import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebouncedSearch } from '../hooks/useDebouncedSearch'
import { useContentCache } from '../hooks/useContentCache'
import { contentAPI } from '../api/content'

/**
 * Ejemplo optimizado de SearchOverlay
 * Implementa debounce y caché para búsquedas eficientes
 */
function SearchOverlayOptimized({ isOpen, onClose }) {
    const navigate = useNavigate()
    const inputRef = useRef(null)
    
    // Hooks de optimización
    const { getCached, setCached } = useContentCache(10 * 60 * 1000) // 10 minutos
    const { query, results, isSearching, searchError, handleInputChange, clearSearch } = useDebouncedSearch(
        async (searchQuery) => {
            // Nivel 1: Buscar en caché
            const cacheKey = `search_all_${searchQuery}`
            const cached = getCached(cacheKey)
            if (cached) {
                console.log('📦 Usando caché para búsqueda:', searchQuery)
                return cached
            }

            // Nivel 2: Hacer requests paralelos optimizados
            try {
                const [librosRes, mangasRes, comicsRes] = await Promise.all([
                    contentAPI.getLibros({ 
                        search: searchQuery, 
                        per_page: 12 // Redujo de 50
                    }),
                    contentAPI.getMangas({ 
                        search: searchQuery, 
                        per_page: 12 
                    }),
                    contentAPI.getComics({ 
                        search: searchQuery, 
                        per_page: 12 
                    })
                ])

                const results = {
                    books: librosRes.data.data || [],
                    mangas: mangasRes.data.data || [],
                    comics: comicsRes.data.data || []
                }

                // Guardar en caché
                setCached(cacheKey, results)
                console.log('💾 Resultados cacheados:', searchQuery)

                return results
            } catch (err) {
                console.error('Search error:', err)
                throw err
            }
        },
        300 // Debounce de 300ms
    )

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        } else {
            clearSearch()
        }
    }, [isOpen, clearSearch])

    const handleItemClick = (item, type) => {
        navigate(`/reader/${type}/${item.id}`)
        onClose()
    }

    const combined = [
        ...((results.books || []).map(b => ({ ...b, type: 'libro' }))),
        ...((results.mangas || []).map(m => ({ ...m, type: 'manga' }))),
        ...((results.comics || []).map(c => ({ ...c, type: 'comic' })))
    ]

    return (
        <div className={`search-overlay ${isOpen ? 'open' : ''}`}>
            <div className="search-overlay__backdrop" onClick={onClose} />
            
            <div className="search-overlay__container">
                <div className="search-overlay__header">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar libros, mangas, cómics..."
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="search-overlay__input"
                    />
                    {query && (
                        <button 
                            className="search-overlay__clear"
                            onClick={clearSearch}
                            aria-label="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="search-overlay__results">
                    {searchError && (
                        <div className="search-overlay__error">
                            Error: {searchError}
                        </div>
                    )}

                    {isSearching && (
                        <div className="search-overlay__loading">
                            <span className="spinner">⏳</span> Buscando...
                        </div>
                    )}

                    {!searchError && !isSearching && query.length > 0 && (
                        <>
                            {combined.length > 0 ? (
                                <div className="search-overlay__items">
                                    {combined.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="search-overlay__item"
                                            onClick={() => handleItemClick(item, item.type)}
                                        >
                                            <img 
                                                src={item.imagen} 
                                                alt={item.titulo}
                                                className="search-overlay__item-image"
                                                loading="lazy"
                                            />
                                            <div className="search-overlay__item-info">
                                                <h3>{item.titulo}</h3>
                                                <p>{item.autor}</p>
                                                <span className="search-overlay__item-type">
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="search-overlay__empty">
                                    No se encontraron resultados para "{query}"
                                </div>
                            )}
                        </>
                    )}

                    {!query && (
                        <div className="search-overlay__hint">
                            Escribe para buscar contenido...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchOverlayOptimized

/**
 * MEJORAS IMPLEMENTADAS:
 * 
 * 1. ✅ Debounce: Solo busca después de 300ms sin escribir
 *    - Antes: 3 requests en cada keystroke
 *    - Después: 1 request cada 300ms máximo
 * 
 * 2. ✅ Caché: Memoriza búsquedas recientes por 10 minutos
 *    - Antes: Cada búsqueda = nueva petición al servidor
 *    - Después: Las búsquedas repetidas son instantáneas
 * 
 * 3. ✅ Per_page reducido: De 50 a 12 por tipo
 *    - Menos datos transferidos
 *    - Carga más rápida
 *    - Usuarios ven resultados relevantes en top 12
 * 
 * 4. ✅ Requests paralelos: Los 3 tipos se cargan simultáneamente
 * 
 * 5. ✅ Mejor UX: Indicadores de loading y error
 * 
 * RESULTADOS ESPERADOS:
 * - Reducción de 80-90% en requests de búsqueda
 * - Búsquedas 3-5x más rápidas
 * - Mejor rendimiento del servidor
 * - Menos uso de ancho de banda
 */
