import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentAPI } from '../api/content'
import { useAuth } from '../context/AuthContext'
import ContentDetailsModal from '../components/ContentDetailsModal'
import CreateAudiobookModal from '../components/CreateAudiobookModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import AudioPlayer from '../components/AudioPlayer'
import { adaptContentList, adaptContent } from '../utils/contentAdapter'
import { getImageUrl } from '../utils/imageUtils'
import { observeIntersection, measurePerformance } from '../utils/performanceUtils'
import '../styles/audiobooks-new.css'

function Audiobooks({ addToast }) {
    const { user, canAccessPremium, isAdmin, isInLibrary, updateLibraryItem } = useAuth()
    const navigate = useNavigate()

    const [audiobooks, setAudiobooks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedContent, setSelectedContent] = useState(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [sortBy, setSortBy] = useState('recientes')
    const [filterPremium, setFilterPremium] = useState('todos')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingAudiobook, setEditingAudiobook] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [playingAudio, setPlayingAudio] = useState(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    
    // Ref para observador de imágenes lazy-loaded
    const imageObserverRef = useRef(null)

    /**
     * Cargar audiolibros optimizado
     */
    const fetchAudiobooks = useCallback(async () => {
        try {
            setIsLoading(true)
            const res = await measurePerformance('Audiobooks: Fetch', () =>
                contentAPI.getAudiobooks({ per_page: 50 })
            )
            setAudiobooks(adaptContentList(res.data.data, 'audiobook'))
            setError(null)
        } catch (err) {
            console.error('Error al cargar audiolibros:', err)
            setError('No se pudo cargar los audiolibros')
            if (addToast) addToast('Error al cargar audiolibros', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        let mounted = true
        const init = async () => {
            if (mounted) await fetchAudiobooks()
        }
        init()
        
        return () => {
            mounted = false
            if (imageObserverRef.current) {
                imageObserverRef.current.disconnect()
            }
        }
    }, [])

    // Cleanup
    useEffect(() => {
        return () => {
            if (imageObserverRef.current) {
                imageObserverRef.current.disconnect()
            }
        }
    }, [])

    // Filtrar y ordenar audiolibros
    const getFilteredAndSortedAudiobooks = () => {
        let filtered = audiobooks

        // Aplicar filtro premium
        if (filterPremium === 'premium') {
            filtered = filtered.filter(item => item.isPremium)
        } else if (filterPremium === 'gratis') {
            filtered = filtered.filter(item => !item.isPremium)
        }

        // Aplicar ordenamiento
        const sorted = [...filtered]
        switch (sortBy) {
            case 'titulo':
                sorted.sort((a, b) => (a.title || a.titulo).localeCompare(b.title || b.titulo))
                break
            case 'autor':
                sorted.sort((a, b) => (a.author || a.autor || '').localeCompare(b.author || b.autor || ''))
                break
            case 'duration':
                sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0))
                break
            case 'recientes':
            default:
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                break
        }

        return sorted
    }

    const handleContentClick = (item) => {
        setSelectedContent(item)
        setIsDetailsOpen(true)
    }

    const handlePlayAudio = async (item) => {
        if (item.isPremium && !canAccessPremium()) {
            navigate('/payment/checkout?plan=premium_1month', { state: { planId: 'premium_1month' } })
            if (addToast) addToast('Suscríbete a Premium para reproducir este audiolibro', 'info')
            return
        }

        // Usar el endpoint seguro del backend para evitar CORS
        const audioUrl = `/api/content/serve-audio/${item.id}`
        
        setPlayingAudio({
            url: audioUrl,
            title: item.title || item.titulo
        })
    }

    const handleEditAudiobook = (item) => {
        console.log('✏️ Editando audiobook:', item.id, item.titulo)
        setEditingAudiobook(item)
        setIsCreateModalOpen(true)
    }

    const handleDeleteAudiobook = (item) => {
        console.log('🗑️ Abriendo modal de eliminación para:', item.id)
        setItemToDelete(item)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return

        try {
            setIsDeleting(true)
            console.log('🗑️ Eliminando audiobook:', itemToDelete.id)
            await contentAPI.deleteAudiobook(itemToDelete.id)
            
            // Remover de la lista
            setAudiobooks(prev => prev.filter(a => a.id !== itemToDelete.id))
            
            // Remover de favoritos si estaba allí
            if (isInLibrary(itemToDelete.id, 'audiobook')) {
                console.log('📚 Removiendo de biblioteca:', itemToDelete.id)
                // Nota: removeFromLibrary se maneja en el contexto
            }
            
            console.log('✅ Audiobook eliminado exitosamente')
            if (addToast) addToast(`"${itemToDelete.title || itemToDelete.titulo}" eliminado`, 'success')
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error al eliminar el audiolibro'
            console.error('❌ Error al eliminar:', err)
            if (addToast) addToast(errorMsg, 'error')
        } finally {
            setIsDeleting(false)
            setDeleteConfirmOpen(false)
            setItemToDelete(null)
        }
    }

    const handleAudiobookSuccess = (responseData) => {
        console.log('🎧 handleAudiobookSuccess - Respuesta:', responseData)
        console.log('🎧 responseData.audiobook:', responseData?.audiobook)
        console.log('🎧 responseData.data:', responseData?.data)
        
        // El backend devuelve el audiobook en la propiedad 'audiobook' o 'data'
        const newAudiobook = responseData.audiobook || responseData.data || responseData
        console.log('🎧 newAudiobook (antes de adapt):', newAudiobook)
        console.log('🎧 newAudiobook.titulo:', newAudiobook?.titulo)
        
        // Adaptar el audiobook para que tenga los campos correctos
        const adaptedAudiobook = adaptContent(newAudiobook, 'audiobook')
        
        console.log('📝 Audiobook adaptado:', adaptedAudiobook)
        console.log('📝 Audiobook adaptado.titulo:', adaptedAudiobook?.titulo)
        
        if (editingAudiobook) {
            console.log('✏️ MODO EDICIÓN - Actualizando ID:', editingAudiobook.id)
            console.log('   Título anterior:', editingAudiobook.titulo)
            console.log('   Título nuevo:', adaptedAudiobook.titulo)
            
            // Actualizar en la lista - IMPORTANTE: forzar actualización de estado
            setAudiobooks(prev => {
                const updated = prev.map(a => {
                    if (a.id === editingAudiobook.id) {
                        console.log('   ✅ Item actualizado en array')
                        return adaptedAudiobook
                    }
                    return a
                })
                console.log('   Total items en array:', updated.length)
                return updated
            })
            
            // Si está en favoritos, actualizar también en la biblioteca
            if (isInLibrary(editingAudiobook.id, 'audiobook')) {
                console.log('📚 Actualizando en biblioteca...')
                updateLibraryItem(editingAudiobook.id, 'audiobook', {
                    titulo: adaptedAudiobook.title || adaptedAudiobook.titulo,
                    autor: adaptedAudiobook.author || adaptedAudiobook.autor,
                    imagen: adaptedAudiobook.image_url || adaptedAudiobook.imagen,
                })
            }
            
            setEditingAudiobook(null)
        } else {
            console.log('➕ MODO CREACIÓN - Agregando nuevo audiobook')
            // Agregar a la lista
            setAudiobooks(prev => {
                const updated = [adaptedAudiobook, ...prev]
                console.log('   Total items después de agregar:', updated.length)
                return updated
            })
        }
        setIsCreateModalOpen(false)
    }

    const content = getFilteredAndSortedAudiobooks()

    if (!user) return null;

    return (
        <div className="audiobooks-container">
            {/* Hero Section */}
            <div className="audiobooks-hero">
                <div className="audiobooks-hero-content">
                    <div className="audiobooks-hero-icon">🎧</div>
                    <h1>Audiolibros</h1>
                    <p>Escucha tus historias favoritas en cualquier momento y lugar</p>
                </div>
            </div>

            <div className="audiobooks-wrapper">

                {/* Controls */}
                <div className="audiobooks-controls">
                    <div className="control-group">
                        <label htmlFor="sort-select">Ordenar por:</label>
                        <select 
                            id="sort-select"
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="select-control"
                        >
                            <option value="recientes">Más Recientes</option>
                            <option value="titulo">Título (A-Z)</option>
                            <option value="autor">Autor</option>
                            <option value="duration">Duración</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label htmlFor="filter-select">Filtrar:</label>
                        <select 
                            id="filter-select"
                            value={filterPremium} 
                            onChange={(e) => setFilterPremium(e.target.value)}
                            className="select-control"
                        >
                            <option value="todos">Todos</option>
                            <option value="gratis">Gratis</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>

                    <div className="control-info">
                        Mostrando <strong>{content.length}</strong> audiolibro{content.length !== 1 ? 's' : ''}
                    </div>

                    {isAdmin() && (
                        <div className="control-group--admin">
                            <button 
                                className="btn-control-create"
                                onClick={() => {
                                    setEditingAudiobook(null)
                                    setIsCreateModalOpen(true)
                                }}
                                title="Crear nuevo audiolibro"
                            >
                                ✨ Crear Audiolibro
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="audiobooks-empty">
                        <div className="audiobooks-empty-icon">⏳</div>
                        <p>Cargando audiolibros...</p>
                    </div>
                ) : error ? (
                    <div className="audiobooks-empty">
                        <div className="audiobooks-empty-icon">⚠️</div>
                        <p>{error}</p>
                        <button className="btn-retry" onClick={fetchAudiobooks}>Reintentar</button>
                    </div>
                ) : content.length > 0 ? (
                    <div className="audiobooks-content">
                        {content.map(item => (
                            <div
                                key={item.id || Math.random()}
                                className={`audiobook-card ${item.isPremium && !canAccessPremium() ? 'locked' : ''}`}
                            >
                                <div
                                    className="audiobook-card-image"
                                    style={{
                                        backgroundImage: `url(${getImageUrl(item.poster)})`,
                                        backgroundColor: '#333333',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {item.isPremium && !canAccessPremium() ? (
                                        <div className="lock-overlay">
                                            <span>🔒 Premium</span>
                                        </div>
                                    ) : (
                                        <div className="audiobook-card-overlay">
                                            <button 
                                                className="btn-play"
                                                onClick={() => handlePlayAudio(item)}
                                                title="Reproducir"
                                            >
                                                ▶
                                            </button>
                                            <button 
                                                className="btn-details"
                                                onClick={() => handleContentClick(item)}
                                                title="Ver Detalles"
                                            >
                                                ⓘ
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="audiobook-card-info">
                                    <h3>{item.title}</h3>
                                    <p className="audiobook-card-author">{item.author}</p>
                                    <div className="audiobook-card-meta">
                                        {item.duration && (
                                            <span className="audiobook-duration">
                                                ⏱ {Math.floor(item.duration / 3600)}h {Math.floor((item.duration % 3600) / 60)}m
                                            </span>
                                        )}
                                        {item.isPremium && <span className="badge-premium-card">✦ Premium</span>}
                                    </div>
                                    <p className="audiobook-card-narrator">
                                        {item.narrator && `Narrado por: ${item.narrator}`}
                                    </p>
                                    {isAdmin() && (
                                        <div className="audiobook-card-admin-buttons">
                                            <button 
                                                className="btn-edit-small"
                                                onClick={() => handleEditAudiobook(item)}
                                                title="Editar"
                                                disabled={isDeleting}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button 
                                                className="btn-delete-small"
                                                onClick={() => handleDeleteAudiobook(item)}
                                                title="Eliminar"
                                                disabled={isDeleting}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="audiobooks-empty">
                        <div className="audiobooks-empty-icon">🎧</div>
                        <p>No hay audiolibros disponibles con los filtros seleccionados</p>
                    </div>
                )}
            </div>

            {/* Content Details Modal */}
            <ContentDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                content={selectedContent}
                onRead={handlePlayAudio}
                user={user}
            />

            {/* Create/Edit Audiobook Modal */}
            {isAdmin() && (
                <CreateAudiobookModal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false)
                        setEditingAudiobook(null)
                    }}
                    onSuccess={handleAudiobookSuccess}
                    addToast={addToast}
                    editingAudiobook={editingAudiobook}
                />
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteConfirmOpen}
                title="Eliminar Audiolibro"
                message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.title || itemToDelete?.titulo}"? Esta acción no se puede deshacer.`}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteConfirmOpen(false)
                    setItemToDelete(null)
                }}
                loading={isDeleting}
            />

            {/* Audio Player Modal */}
            {playingAudio && (
                <AudioPlayer
                    audioSrc={playingAudio.url}
                    title={playingAudio.title}
                    onClose={() => setPlayingAudio(null)}
                />
            )}
        </div>
    )
}

export default Audiobooks
