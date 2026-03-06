import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentAPI } from '../api/content'
import { useAuth } from '../context/AuthContext'
import PremiumGateModal from '../components/PremiumGateModal'
import ContentDetailsModal from '../components/ContentDetailsModal'
import { adaptContentList } from '../utils/contentAdapter'
import { getImageUrl } from '../utils/imageUtils'
import { usePDFAccess } from '../hooks/usePDFAccess'
import { measurePerformance } from '../utils/performanceUtils'
import '../styles/biblioteca-new.css'

function Biblioteca({ addToast, onOpenLogin }) {
    const { user, canAccessPremium, isAdmin } = useAuth()
    const navigate = useNavigate()
    const {
        isPremiumGateOpen,
        premiumGateData,
        handleOpenPDF,
        closePremiumGate,
    } = usePDFAccess()

    const [activeTab, setActiveTab] = useState('libros')
    const [libros, setLibros] = useState([])
    const [mangas, setMangas] = useState([])
    const [comics, setComics] = useState([])
    const [librosLoading, setLibrosLoading] = useState(true)
    const [mangasLoading, setMangasLoading] = useState(false)
    const [comicsLoading, setComicsLoading] = useState(false)
    const [error, setError] = useState(null)

    const [selectedContent, setSelectedContent] = useState(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    /**
     * Cargar contenido optimizado:
     * 1. Cargar libros rápidamente
     * 2. Cargar mangas en background
     * 3. Cargar comics en background
     */
    const fetchContent = useCallback(async () => {
        try {
            // PASO 1: Cargar libros rápidamente
            const librosRes = await measurePerformance('Biblioteca: Libros', () =>
                contentAPI.getLibros({ per_page: 20 })
            )
            setLibros(adaptContentList(librosRes.data.data, 'libro'))
            setLibrosLoading(false)

            // PASO 2: Cargar mangas en background
            setMangasLoading(true)
            contentAPI.getMangas({ per_page: 50 })
                .then(mangasRes => {
                    setMangas(adaptContentList(mangasRes.data.data, 'manga'))
                    setMangasLoading(false)
                })
                .catch(err => {
                    console.error('Error al cargar mangas:', err)
                    setMangasLoading(false)
                })

            // PASO 3: Cargar comics en background
            setComicsLoading(true)
            contentAPI.getComics({ per_page: 50 })
                .then(comicsRes => {
                    setComics(adaptContentList(comicsRes.data.data, 'comic'))
                    setComicsLoading(false)
                })
                .catch(err => {
                    console.error('Error al cargar comics:', err)
                    setComicsLoading(false)
                })
        } catch (err) {
            console.error('Error al cargar contenido:', err)
            setError('No se pudo cargar el contenido')
            if (addToast) addToast('Error al cargar contenido', 'error')
            setLibrosLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        let mounted = true
        const init = async () => {
            if (mounted) await fetchContent()
        }
        init()

        return () => {
            mounted = false
        }
    }, [fetchContent])

    // Simplified fetching logic - handled in fetchContent useCallback

    const getContentByTab = () => {
        switch (activeTab) {
            case 'libros': return libros
            case 'mangas': return mangas
            case 'comics': return comics
            default: return []
        }
    }

    const handleContentClick = (item) => {
        setSelectedContent(item)
        setIsDetailsOpen(true)
    }

    const handleReadContent = async (item) => {
        const result = await handleOpenPDF({
            type: item.type,
            id: item.id,
            title: item.title || item.titulo,
            navigateOnly: true
        })

        if (result.success) {
            navigate(`/reader/${item.type}/${item.id}`)
            if (addToast) addToast(`Abriendo: ${item.title || item.titulo}`, 'success')
        }
    }

    const content = getContentByTab()
    const isLoading = activeTab === 'libros' ? librosLoading : activeTab === 'mangas' ? mangasLoading : comicsLoading

    if (!user) return null;

    return (
        <div className="biblioteca-container">
            <div className="biblioteca-wrapper">
                <div className="biblioteca-header-section">
                    <h1>📚 Mi Biblioteca</h1>
                    <p>Explora y gestiona tu colección personal</p>
                </div>

                {/* Tabs */}
                <div className="biblioteca-tabs">
                    <button
                        className={`tab-button ${activeTab === 'libros' ? 'active' : ''}`}
                        onClick={() => setActiveTab('libros')}
                    >
                        📖 Libros ({libros.length})
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'mangas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mangas')}
                    >
                        🎨 Mangas ({mangas.length})
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'comics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comics')}
                    >
                        💫 Cómics ({comics.length})
                    </button>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="biblioteca-content">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="book-card skeleton">
                                <div className="book-card-image skeleton-pulse" />
                                <div className="book-card-info">
                                    <div className="skeleton-line" style={{ width: '80%' }} />
                                    <div className="skeleton-line" style={{ width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="biblioteca-empty">
                        <div className="biblioteca-empty-icon">⚠️</div>
                        <p>{error}</p>
                        <button className="btn-retry" onClick={fetchContent}>Reintentar</button>
                    </div>
                ) : content.length > 0 ? (
                    <div className="biblioteca-content">
                        {content.map(item => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`book-card ${item.isPremium && !canAccessPremium() && !isAdmin() ? 'locked' : ''}`}
                                onClick={() => handleContentClick(item)}
                            >
                                <div className="book-card-image">
                                    <img
                                        src={getImageUrl(item.poster)}
                                        alt={item.title}
                                        loading="lazy"
                                        onLoad={(e) => e.target.classList.add('loaded')}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'
                                            e.target.classList.add('loaded')
                                        }}
                                    />
                                    {item.isPremium && !canAccessPremium() && !isAdmin() ? (
                                        <div className="lock-overlay">
                                            <span>🔒 Premium</span>
                                        </div>
                                    ) : (
                                        <div className="book-card-overlay">
                                            <button className="btn-details">Ver Detalles</button>
                                        </div>
                                    )}
                                </div>

                                <div className="book-card-info">
                                    <h3>{item.title}</h3>
                                    <p className="book-card-author">{item.author}</p>
                                    {item.isPremium && <span className="badge-premium-card">✦ Premium</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="biblioteca-empty">
                        <div className="biblioteca-empty-icon">📚</div>
                        <p>No hay {activeTab} disponibles</p>
                    </div>
                )}
            </div>

            {/* Content Details Modal */}
            <ContentDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                content={selectedContent}
                onRead={handleReadContent}
                user={user}
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
        </div>
    )
}

export default Biblioteca
