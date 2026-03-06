import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import BookRow from '../components/BookRow'
import SkeletonBookRow from '../components/SkeletonBookRow'
import EditContentModal from '../components/EditContentModal'
import ConfirmModal from '../components/ConfirmModal'
import PremiumGateModal from '../components/PremiumGateModal'
import { contentAPI } from '../api/content'
import { useAuth } from '../context/AuthContext'
import { adaptContentList } from '../utils/contentAdapter'
import { usePDFAccess } from '../hooks/usePDFAccess'
import { measurePerformance } from '../utils/performanceUtils'
import '../styles/home-new.css'

function Home({ onOpenLogin, addToast }) {
    const { user, isAdmin, addToLibrary, isInLibrary } = useAuth()
    const navigate = useNavigate()
    const { isPremiumGateOpen, premiumGateData, handleOpenPDF: handleOpenPDFWithGate, closePremiumGate } = usePDFAccess()
    const [books, setBooks] = useState({ popular: [] })
    const [mangas, setMangas] = useState([])
    const [comics, setComics] = useState([])
    const [booksLoading, setBooksLoading] = useState(true)
    const [mangasLoading, setMangasLoading] = useState(false)
    const [comicsLoading, setComicsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedForEdit, setSelectedForEdit] = useState(null)
    const [editContentType, setEditContentType] = useState('libro')
    const [activeCategory, setActiveCategory] = useState('todos')
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: null,
        type: null
    })

    const handleAddToList = (item) => {
        const success = addToLibrary(item)
        if (success) {
            const title = item.title || item.titulo || 'Elemento'
            if (addToast) addToast(`${title} añadido a tu lista`, 'success')
        } else {
            onOpenLogin()
        }
    }

    /**
     * Cargar contenido de forma optimizada:
     * 1. Cargar libros primero (el más importante) con menos items
     * 2. Luego cargar mangas y comics en background
     */
    const fetchContent = async () => {
        try {
            // PASO 1: Cargar libros rápidamente con menos items para mejorar rendimiento
            const librosRes = await measurePerformance('HomeNew: Libros', () =>
                contentAPI.getLibros({ per_page: 12 })
            )
            setBooks({ popular: adaptContentList(librosRes.data.data, 'libro') })
            setBooksLoading(false)

            // PASO 2: Cargar mangas en background (no bloquea)
            setMangasLoading(true)
            contentAPI.getMangas({ per_page: 12 })
                .then(mangasRes => {
                    setMangas(adaptContentList(mangasRes.data.data, 'manga'))
                    setMangasLoading(false)
                })
                .catch(err => console.error('Error al cargar mangas:', err))

            // PASO 3: Cargar comics en background (no bloquea)
            setComicsLoading(true)
            contentAPI.getComics({ per_page: 12 })
                .then(comicsRes => {
                    setComics(adaptContentList(comicsRes.data.data, 'comic'))
                    setComicsLoading(false)
                })
                .catch(err => console.error('Error al cargar comics:', err))
        } catch (err) {
            console.error('Error al consumir la API:', err)
            setError(err.message)
            setBooksLoading(false)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await fetchContent()
        }
        loadData()
    }, [])

    const handleContentCreated = () => {
        fetchContent()
        setEditModalOpen(false)
        setSelectedForEdit(null)
    }

    const handleEdit = (item) => {
        if (!isAdmin()) return;
        console.log("Abriendo modal para editar:", item)
        setSelectedForEdit(item)
        setEditContentType(item.type || item.contentType || 'libro')
        setEditModalOpen(true)
    }

    const handleDelete = async (item) => {
        if (!isAdmin()) return;
        const displayType = item.type || item.contentType || 'contenido'
        
        setConfirmModal({
            isOpen: true,
            id: item.id,
            type: displayType,
            item: item
        })
    }

    const confirmDelete = async () => {
        const { id, type, item } = confirmModal
        const displayTitle = item?.title || item?.titulo || 'Elemento'
        
        try {
            if (type === 'libro') await contentAPI.deleteLibro(id)
            else if (type === 'manga') await contentAPI.deleteManga(id)
            else if (type === 'comic') await contentAPI.deleteComic(id)

            if (addToast) addToast(`${displayTitle} eliminado`, 'success')
            setConfirmModal({ isOpen: false, id: null, type: null, item: null })
            fetchContent()
        } catch (err) {
            console.error(err)
            if (addToast) addToast('Error al eliminar', 'error')
            setConfirmModal({ isOpen: false, id: null, type: null, item: null })
        }
    }

    const cancelDelete = () => {
        setConfirmModal({ isOpen: false, id: null, type: null, item: null })
    }

    const handleOpenPDF = async (item) => {
        const displayType = item.type || item.contentType || 'content'
        const displayTitle = item.title || item.titulo || 'Documento'
        const result = await handleOpenPDFWithGate({
            type: displayType,
            id: item.id,
            title: displayTitle,
        })

        if (result?.success) {
            if (addToast) addToast(`Abriendo ${displayTitle}...`, 'success')
        } else if (result?.code === 'NOT_AUTHENTICATED' || result?.code === 'REQUIRES_PREMIUM') {
            // El modal premium se mostrará automáticamente
        } else {
            if (addToast) addToast('Error: No se pudo abrir el archivo PDF', 'error')
        }
    }

    if (error && booksLoading) {
        return (
            <div className="home-error">
                <div className="error-icon">⚠️</div>
                <p>Error: {error}</p>
                <button onClick={fetchContent} className="retry-btn">Reintentar</button>
            </div>
        )
    }

    return (
        <div className="home-container">
            <Hero onOpenLogin={onOpenLogin} addToast={addToast} />

            <div className="home-content">
                {/* Categorías / Filtros */}
                <div className="home-category-tabs">
                    <button
                        className={`category-tab ${activeCategory === 'todos' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('todos')}
                    >
                        🏠 Todo
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'libros' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('libros')}
                    >
                        📖 Libros
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'mangas' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('mangas')}
                    >
                        🎨 Mangas
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'comics' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('comics')}
                    >
                        💫 Cómics
                    </button>
                </div>

                {/* Libros Section */}
                {(activeCategory === 'todos' || activeCategory === 'libros') && (
                    <div className="book-row-section">
                        <h2 className="book-row-title">📚 Libros Populares</h2>
                        {booksLoading ? (
                            <SkeletonBookRow count={5} />
                        ) : (
                            <BookRow
                                Books={books.popular}
                                autoPlay={activeCategory === 'todos'}
                                autoPlayInterval={5000}
                                infiniteScroll
                                contentType="libro"
                                onEditBook={isAdmin() ? handleEdit : null}
                                onDeleteBook={isAdmin() ? handleDelete : null}
                                onOpenBook={handleOpenPDF}
                                onAddToList={handleAddToList}
                                isInLibrary={isInLibrary}
                                isAdmin={isAdmin()}
                                addToast={addToast}
                                onContentCreated={handleContentCreated}
                            />
                        )}
                    </div>
                )}

                {/* Mangas Section */}
                {(activeCategory === 'todos' || activeCategory === 'mangas') && (
                    <div className="book-row-section">
                        <h2 className="book-row-title">🎨 Mangas Destacados</h2>
                        {mangasLoading ? (
                            <SkeletonBookRow count={5} />
                        ) : (
                            <BookRow
                                Books={mangas}
                                autoPlay={false}
                                infiniteScroll
                                contentType="manga"
                                onEditBook={isAdmin() ? handleEdit : null}
                                onDeleteBook={isAdmin() ? handleDelete : null}
                                onOpenBook={handleOpenPDF}
                                onAddToList={handleAddToList}
                                isInLibrary={isInLibrary}
                                isAdmin={isAdmin()}
                                addToast={addToast}
                                onContentCreated={handleContentCreated}
                            />
                        )}
                    </div>
                )}

                {/* Comics Section */}
                {(activeCategory === 'todos' || activeCategory === 'comics') && (
                    <div className="book-row-section">
                        <h2 className="book-row-title">💫 Cómics Populares</h2>
                        {comicsLoading ? (
                            <SkeletonBookRow count={5} />
                        ) : (
                            <BookRow
                                Books={comics}
                                autoPlay={false}
                                infiniteScroll
                                contentType="comic"
                                onEditBook={isAdmin() ? handleEdit : null}
                                onDeleteBook={isAdmin() ? handleDelete : null}
                                onOpenBook={handleOpenPDF}
                                onAddToList={handleAddToList}
                                isInLibrary={isInLibrary}
                                isAdmin={isAdmin()}
                                addToast={addToast}
                                onContentCreated={handleContentCreated}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <EditContentModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false)
                    setSelectedForEdit(null)
                }}
                onUpdate={() => {
                    if (addToast) {
                        addToast('Contenido actualizado exitosamente', 'success')
                    }
                    fetchContent()
                    setEditModalOpen(false)
                    setSelectedForEdit(null)
                }}
                content={selectedForEdit}
                contentType={editContentType}
                addToast={addToast}
            />

            {/* Premium Gate Modal */}
            <PremiumGateModal
                isOpen={isPremiumGateOpen}
                onClose={closePremiumGate}
                onLoginClick={onOpenLogin}
                onPremiumClick={() => {
                    closePremiumGate()
                    navigate('/payment/checkout?plan=premium_1month', { state: { planId: 'premium_1month' } })
                }}
                userRole={user?.role?.name}
                isUserAuthenticated={!!user}
                contentTitle={premiumGateData.contentTitle}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Eliminar contenido"
                message={`¿Estás seguro que deseas eliminar este ${confirmModal.type}? Esta acción no se puede deshacer.`}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />
        </div>
    )
}

export default Home
