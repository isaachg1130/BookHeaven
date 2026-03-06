import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import '../styles/BookRow.css'
import EditContentModal from './EditContentModal'
import CreateContentModal from './CreateContentModal'

function BookRow({
    title,
    Books = [],
    infiniteScroll = false,
    autoPlay = false,
    autoPlayInterval = 5000,
    onCreateBook,
    onEditBook,
    onDeleteBook,
    onOpenBook,
    onAddToList,
    isInLibrary = () => false,
    contentType = 'libro',
    isAdmin = false,
    addToast = null,
    onContentCreated = null
}) {
    const [scrollX, setScrollX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [scrollLeft, setScrollLeft] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedContent, setSelectedContent] = useState(null)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [visibleItems, setVisibleItems] = useState(6)
    const [itemWidth, setItemWidth] = useState(200)
    const [hoveredItem, setHoveredItem] = useState(null)
    const [loadedImages, setLoadedImages] = useState(new Set())
    const [visibleImageIndices, setVisibleImageIndices] = useState(new Set())

    // Ensure Books is always an array
    const booksList = Array.isArray(Books) ? Books : []
    const listRef = useRef(null)
    const containerRef = useRef(null)
    const autoPlayRef = useRef(null)
    const dragStartX = useRef(0)
    const dragStartTime = useRef(0)
    const imageObserverRef = useRef(null)

    // Intersection Observer para lazy loading optimizado
    useEffect(() => {
        // Crear observer para detectar imágenes visibles
        imageObserverRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.dataset.index, 10)
                        setVisibleImageIndices(prev => new Set(prev).add(index))
                    }
                })
            },
            {
                root: null,
                rootMargin: '50px', // Precargar 50px antes de ser visible
                threshold: 0.01
            }
        )

        return () => {
            if (imageObserverRef.current) {
                imageObserverRef.current.disconnect()
            }
        }
    }, [])

    // Calculate visible items and width based on viewport
    useEffect(() => {
        const calculateDimensions = () => {
            if (!containerRef.current) return

            const containerWidth = containerRef.current.offsetWidth
            // Ensure minimum itemWidth
            const newItemWidth = Math.max(
                containerWidth < 480 ? 120 : containerWidth < 768 ? 150 : 200,
                100
            )
            const newVisibleItems = Math.floor(containerWidth / (newItemWidth + 14))

            setItemWidth(newItemWidth)
            setVisibleItems(Math.max(newVisibleItems, 1)) // At least 1 visible item
        }

        // Initial calculation
        calculateDimensions()

        const debouncedResize = debounce(calculateDimensions, 250)
        window.addEventListener('resize', debouncedResize)
        return () => window.removeEventListener('resize', debouncedResize)
    }, [])

    // Optimized scroll handlers
    const handleLeftArrow = useCallback(() => {
        if (!listRef.current || booksList.length === 0) return

        const itemWidthWithGap = itemWidth + 14 // 14px gap between items
        const maxScroll = 0
        let newScrollX = scrollX + (visibleItems * itemWidthWithGap)

        if (infiniteScroll && newScrollX > 0) {
            // Loop to end
            const totalWidth = (booksList.length + 1) * itemWidthWithGap // +1 for create button
            newScrollX = -(totalWidth - window.innerWidth + 100)
        } else {
            newScrollX = Math.min(newScrollX, maxScroll)
        }

        setScrollX(newScrollX)
        listRef.current.style.transform = `translateX(${newScrollX}px)`
    }, [scrollX, visibleItems, itemWidth, booksList.length, infiniteScroll])

    const handleRightArrow = useCallback(() => {
        if (!listRef.current || booksList.length === 0) return

        const itemWidthWithGap = itemWidth + 14 // 14px gap between items
        const totalItems = booksList.length + 1 // +1 for create button
        const totalWidth = totalItems * itemWidthWithGap
        const maxScroll = -(totalWidth - window.innerWidth + 100)

        let newScrollX = scrollX - (visibleItems * itemWidthWithGap)

        if (infiniteScroll && newScrollX < maxScroll) {
            // Loop to beginning
            newScrollX = 0
        } else {
            newScrollX = Math.max(newScrollX, maxScroll)
        }

        setScrollX(newScrollX)
        listRef.current.style.transform = `translateX(${newScrollX}px)`
    }, [scrollX, visibleItems, itemWidth, booksList.length, infiniteScroll])

    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlaying && !isDragging) {
            autoPlayRef.current = setInterval(() => {
                handleRightArrow()
            }, autoPlayInterval)
        } else {
            clearInterval(autoPlayRef.current)
        }
        return () => clearInterval(autoPlayRef.current)
    }, [isAutoPlaying, isDragging, autoPlayInterval, handleRightArrow])

    // Touch/Mouse drag functionality
    const handleMouseDown = (e) => {
        setIsDragging(true)
        dragStartX.current = e.pageX - (listRef.current?.offsetLeft || 0)
        dragStartTime.current = Date.now()
        setScrollLeft(scrollX)
        // Pause autoplay during drag
        if (isAutoPlaying) {
            setIsAutoPlaying(false)
        }
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()

        const x = e.pageX - listRef.current.offsetLeft
        const walk = (x - dragStartX.current) * 1.5
        const newScrollX = scrollLeft + walk

        setScrollX(newScrollX)
        listRef.current.style.transform = `translateX(${newScrollX}px)`
    }

    const handleMouseUp = () => {
        if (!isDragging) return

        setIsDragging(false)
        setIsAutoPlaying(autoPlay) // Resume autoplay if it was enabled

        // Snap to nearest item
        const itemWidthWithGap = itemWidth + 14 // 14px gap (matches CSS)
        const remainder = Math.abs(scrollX) % itemWidthWithGap
        const snapToNext = remainder > itemWidthWithGap / 2
        const direction = scrollX < scrollLeft ? -1 : 1

        let newScrollX = scrollX
        if (snapToNext) {
            newScrollX = scrollX + (itemWidthWithGap * direction)
        } else {
            newScrollX = scrollX - (remainder * direction)
        }

        // Apply boundaries
        const totalItems = booksList.length + 1 // +1 for create button
        const totalWidth = totalItems * itemWidthWithGap
        const maxScroll = -(totalWidth - window.innerWidth + 100)
        newScrollX = Math.max(maxScroll, Math.min(0, newScrollX))

        setScrollX(newScrollX)
        if (listRef.current) {
            listRef.current.style.transform = `translateX(${newScrollX}px)`
        }
    }

    // Touch events for mobile
    const handleTouchStart = (e) => {
        const touch = e.touches[0]
        handleMouseDown({ pageX: touch.pageX })
    }

    const handleTouchMove = (e) => {
        const touch = e.touches[0]
        handleMouseMove({ pageX: touch.pageX, preventDefault: () => e.preventDefault() })
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                handleLeftArrow()
                setIsAutoPlaying(false)
            } else if (e.key === 'ArrowRight') {
                handleRightArrow()
                setIsAutoPlaying(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleLeftArrow, handleRightArrow])

    // Lazy loading for images
    const handleImageLoad = useCallback((index) => {
        setLoadedImages(prev => new Set(prev).add(index))
    }, [])

    // Calculate scroll progress
    const scrollProgress = useMemo(() => {
        if (booksList.length === 0) return 0
        const itemWidthWithGap = itemWidth + 14
        const totalItems = booksList.length + 1
        const totalWidth = totalItems * itemWidthWithGap
        const maxScroll = Math.abs(-(totalWidth - window.innerWidth + 100))
        return Math.abs(scrollX) / maxScroll * 100
    }, [scrollX, booksList.length, itemWidth])

    // Check if arrows should be visible
    const showLeftArrow = booksList.length > 0 && (infiniteScroll || scrollX < 0)
    const showRightArrow = booksList.length > 0 && (infiniteScroll || Math.abs(scrollX) < ((booksList.length + 1) * (itemWidth + 14) - window.innerWidth - 100))

    return (
        <div className="bookRow" ref={containerRef}>
            <div className="bookRow__header">
                <h2 className="bookRow__title">{title}</h2>
                <div className="bookRow__controls">
                    {isAdmin && (
                        <button
                            className="bookRow__admin-add-btn"
                            onClick={() => setCreateModalOpen(true)}
                            title={`Agregar ${contentType}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>Agregar {contentType === 'libro' ? 'Libro' : contentType === 'manga' ? 'Manga' : 'Cómic'}</span>
                        </button>
                    )}
                    <button
                        className={`bookRow__control-btn ${isAutoPlaying ? 'active' : ''}`}
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        title="Autoplay"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                        </svg>
                    </button>
                    <div className="bookRow__progress">
                        <div
                            className="bookRow__progress-bar"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="bookRow__listarea">
                {showLeftArrow && (
                    <button
                        className="bookRow__nav bookRow__nav--left"
                        onClick={handleLeftArrow}
                        aria-label="Previous"
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}

                {showRightArrow && (
                    <button
                        className="bookRow__nav bookRow__nav--right"
                        onClick={handleRightArrow}
                        aria-label="Next"
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}

                <div
                    className={`bookRow__list ${isDragging ? 'dragging' : ''}`}
                    ref={listRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                    style={{
                        transform: `translateX(${scrollX}px)`,
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                >
                    {/* Create Books Button */}
                    {onCreateBook && (
                        <div
                            className="bookRow__item bookRow__item--create"
                            style={{ width: `${itemWidth}px` }}
                            onClick={onCreateBook}
                        >
                            <div className="bookRow__create-content">
                                <div className="bookRow__create-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span className="bookRow__create-text">Crear Nueva</span>
                            </div>
                        </div>
                    )}

                    {/* Books Items */}
                    {booksList.map((book, key) => (
                        <div
                            key={book.id || key}
                            className="bookRow__item"
                            style={{ width: `${itemWidth}px` }}
                            onMouseEnter={() => setHoveredItem(key)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => onOpenBook && onOpenBook(book)}
                        >
                            <div className="bookRow__item-container">
                                {!loadedImages.has(key) && (
                                    <div className="bookRow__skeleton">
                                        <div className="bookRow__skeleton-logo">📚</div>
                                        <div className="bookRow__skeleton-shimmer" />
                                    </div>
                                )}
                                <img
                                    ref={(el) => {
                                        if (el && imageObserverRef.current) {
                                            el.dataset.index = key
                                            imageObserverRef.current.observe(el)
                                        }
                                    }}
                                    src={visibleImageIndices.has(key) ? book.poster : undefined}
                                    alt={book.title}
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => handleImageLoad(key)}
                                    style={{ opacity: loadedImages.has(key) ? 1 : 0 }}
                                />

                                {/* Premium Indicator */}
                                {book.isPremium && (
                                    <div className="bookRow__premium-badge">
                                        <span>✦ Premium</span>
                                    </div>
                                )}

                                <div className={`bookRow__item-hover ${hoveredItem === key ? 'active' : ''}`}>
                                    <div className="bookRow__item-preview">
                                        <img 
                                            src={book.backdrop || book.poster} 
                                            alt={book.title}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="bookRow__item-preview-overlay" />
                                    </div>

                                    <div className="bookRow__item-content">
                                        {/* Admin Overlay Actions */}
                                        {(onEditBook || onDeleteBook) ? (
                                            <div className="bookRow__admin-actions">
                                                <div className="bookRow__admin-badge">🛠️ Admin Mode</div>
                                                <h3 className="bookRow__admin-title">{book.title}</h3>
                                                <div className="bookRow__admin-buttons">
                                                    {onEditBook && (
                                                        <button
                                                            className="bookRow__action-btn edit"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (book && book.id) {
                                                                    console.log('📝 Open EditModal:', { title: book?.title, contentType, bookId: book.id })
                                                                    setSelectedContent(book)
                                                                    setEditModalOpen(true)
                                                                } else {
                                                                    console.error('❌ Error: Libro no válido para editar', book)
                                                                    if (addToast) {
                                                                        addToast('Error: No se puede editar este contenido. Datos incompletos.', 'error')
                                                                    }
                                                                }
                                                            }}
                                                            title="Editar Contenido"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                    )}
                                                    <button
                                                        className="bookRow__action-btn pdf"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onOpenBook && onOpenBook(book)
                                                        }}
                                                        title="Ver Contenido"
                                                    >
                                                        📖 Abrir
                                                    </button>
                                                    {onDeleteBook && (
                                                        <button
                                                            className="bookRow__action-btn delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onDeleteBook(book)
                                                            }}
                                                            title="Eliminar Contenido"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    )}
                                                    <button
                                                        className={`bookRow__action-btn ${isInLibrary(book.id, book.type) ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onAddToList && onAddToList(book)
                                                        }}
                                                        title="Añadir a mi lista"
                                                        style={isInLibrary(book.id, book.type) ? { background: '#D4A76A', color: '#1a1a1a' } : {}}
                                                    >
                                                        {isInLibrary(book.id, book.type) ? '✅ En mi lista' : '⭐ Mi Lista'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Regular User Actions */
                                            <div className="bookRow__item-buttons">
                                                <button
                                                    className="bookRow__item-button bookRow__item-button--primary"
                                                    title="Leer ahora"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onOpenBook && onOpenBook(book)
                                                    }}
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M19 1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H5V3h14v14zm-7-2h6v-2h-6v2zm0-4h6V9h-6v2zm0-4h6V5h-6v2z" fill="currentColor" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className={`bookRow__item-button ${isInLibrary(book.id, book.type) ? 'active' : ''}`}
                                                    title={isInLibrary(book.id, book.type) ? "En tu lista" : "Añadir a mi lista"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddToList && onAddToList(book);
                                                    }}
                                                    style={isInLibrary(book.id, book.type) ? { background: '#D4A76A', borderColor: '#D4A76A', color: '#1a1a1a' } : {}}
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        {isInLibrary(book.id, book.type) ? (
                                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                        ) : (
                                                            <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        )}
                                                    </svg>
                                                </button>
                                                <button className="bookRow__item-button" title="Me gusta">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M7 22V4H3V22H7Z" fill="currentColor" />
                                                        <path d="M21 22V4H17V22H21Z" fill="currentColor" />
                                                        <path d="M14 22V4H10V22H14Z" fill="currentColor" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {!(onEditBook || onDeleteBook) && (
                                            <>
                                                <div className="bookRow__item-info">
                                                    <h3 className="bookRow__item-title">{book.title}</h3>
                                                    <div className="bookRow__item-meta">
                                                        <span className="bookRow__item-match">{book.match}% Coincidencia</span>
                                                        <span className="bookRow__item-age">{book.age}</span>
                                                        <span className="bookRow__item-duration">{book.duration}</span>
                                                        <span className="bookRow__item-quality">HD</span>
                                                    </div>
                                                </div>

                                                <div className="bookRow__item-genres">
                                                    {book.genres?.map((genre, index) => (
                                                        <span key={index}>• {genre}</span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <EditContentModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false)
                    setSelectedContent(null)
                }}
                onUpdate={(updatedContent) => {
                    if (onEditBook) {
                        onEditBook(updatedContent)
                    }
                }}
                content={selectedContent}
                contentType={contentType}
                addToast={addToast}
            />

            <CreateContentModal
                isOpen={createModalOpen}
                contentType={contentType}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={(newContent) => {
                    if (onContentCreated) {
                        onContentCreated(newContent)
                    }
                }}
                addToast={addToast}
            />
        </div>
    )
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

export default BookRow