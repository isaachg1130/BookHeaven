import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import MainLayout from '../../components/dashboard/MainLayout'
import ConfirmModal from '../../components/ConfirmModal'
import EditContentModal from '../../components/EditContentModal'
import { contentAPI } from '../../api/content'
import { getImageUrl } from '../../utils/imageUtils'
import StatCard from '../../components/dashboard/StatCard'
import '../../styles/admin-pages.css'

/**
 * ContenidoPage - Vista para gestionar todo el contenido (libros, mangas, cómics)
 * 
 * Features:
 * - Vista unificada de todos los tipos de contenido
 * - Filtrado por tipo de contenido
 * - Búsqueda rápida
 * - Acciones: editar, eliminar, desactivar
 * - Estadísticas de contenido
 */
const ContenidoPage = () => {
    const { isAdmin } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [libros, setLibros] = useState([])
    const [mangas, setMangas] = useState([])
    const [comics, setComics] = useState([])
    const [audiobooks, setAudiobooks] = useState([])
    const [activeTab, setActiveTab] = useState('todos')
    const [searchTerm, setSearchTerm] = useState('')
    const [lastUpdated, setLastUpdated] = useState(null)
    const intervalRef = useRef(null)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: null,
        type: null
    })
    const [editModal, setEditModal] = useState({
        isOpen: false,
        content: null,
        contentType: null
    })

    useEffect(() => {
        if (!isAdmin()) return
        fetchAllContent()
        // Auto-refresh cada 30 segundos
        intervalRef.current = setInterval(() => {
            fetchAllContent(true)
        }, 30000)
        return () => clearInterval(intervalRef.current)
    }, [isAdmin])

    const fetchAllContent = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            setError(null)

            const [librosRes, mangasRes, comicsRes, audiobooksRes] = await Promise.all([
                contentAPI.getLibros({ per_page: 50 }),
                contentAPI.getMangas({ per_page: 50 }),
                contentAPI.getComics({ per_page: 50 }),
                contentAPI.getAudiobooks({ per_page: 50 }),
            ])

            setLibros(librosRes.data.data || [])
            setMangas(mangasRes.data.data || [])
            setComics(comicsRes.data.data || [])
            setAudiobooks(audiobooksRes.data.data || [])
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Error fetching content:', err)
            setError('Error al cargar el contenido')
        } finally {
            if (!silent) setLoading(false)
        }
    }

    /**
     * Obtener contenido filtrado según el tab activo
     */
    const filteredContent = useMemo(() => {
        let content = []

        if (activeTab === 'todos') {
            content = [
                ...libros.map(item => ({ ...item, type: 'libro' })),
                ...mangas.map(item => ({ ...item, type: 'manga' })),
                ...comics.map(item => ({ ...item, type: 'comic' })),
                ...audiobooks.map(item => ({ ...item, type: 'audiobook' })),
            ]
        } else if (activeTab === 'libros') {
            content = libros.map(item => ({ ...item, type: 'libro' }))
        } else if (activeTab === 'mangas') {
            content = mangas.map(item => ({ ...item, type: 'manga' }))
        } else if (activeTab === 'comics') {
            content = comics.map(item => ({ ...item, type: 'comic' }))
        } else if (activeTab === 'audiobooks') {
            content = audiobooks.map(item => ({ ...item, type: 'audiobook' }))
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            content = content.filter(item =>
                item.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.narrador?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Ordenar por fecha de creación (más recientes primero)
        return content.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }, [libros, mangas, comics, audiobooks, activeTab, searchTerm])

    const handleDeleteContent = async (id, type) => {
        setConfirmModal({
            isOpen: true,
            id,
            type
        })
    }

    const confirmDeleteContent = async () => {
        const { id, type } = confirmModal
        
        try {
            if (type === 'libro') await contentAPI.deleteLibro(id)
            else if (type === 'manga') await contentAPI.deleteManga(id)
            else if (type === 'comic') await contentAPI.deleteComic(id)
            else if (type === 'audiobook') await contentAPI.deleteAudiobook(id)

            setConfirmModal({ isOpen: false, id: null, type: null })
            fetchAllContent(true)
        } catch (err) {
            console.error('Error deleting content:', err)
            setError(`Error al eliminar el ${type}`)
            setConfirmModal({ isOpen: false, id: null, type: null })
        }
    }

    const cancelDeleteContent = () => {
        setConfirmModal({ isOpen: false, id: null, type: null })
    }

    const handleEditContent = (content, type) => {
        setEditModal({
            isOpen: true,
            content,
            contentType: type
        })
    }

    const handleEditClose = () => {
        setEditModal({
            isOpen: false,
            content: null,
            contentType: null
        })
    }

    const handleEditUpdate = () => {
        // Actualizar contenido en lista y cerrar modal
        fetchAllContent(true)
        handleEditClose()
    }

    if (loading) {
        return (
            <MainLayout>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="spinner"></div>
                    <p>Cargando contenido...</p>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
                {/* PAGE HEADER */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #3a3530'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: '0 0 10px 0',
                            color: '#FFFBF5'
                        }}>
                            📚 Gestión de Contenido
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <p style={{ color: '#D4A76A', margin: 0 }}>Total: {filteredContent.length} items</p>
                            <span style={{ color: '#4ade80', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 5px #4ade8088' }} />
                                En tiempo real
                                {lastUpdated && (
                                    <span style={{ color: '#555', marginLeft: '4px' }}>
                                        · {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                )}
                            </span>
                            <button
                                onClick={() => fetchAllContent(true)}
                                style={{ padding: '3px 10px', background: '#2a2a2a', border: '1px solid #3a3530', borderRadius: '4px', color: '#D4A76A', cursor: 'pointer', fontSize: '0.8rem' }}
                                title="Actualizar ahora"
                            >
                                🔄 Actualizar
                            </button>
                        </div>
                    </div>
                </div>

                {/* ERROR ALERT */}
                {error && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(255, 67, 54, 0.1)',
                        border: '1px solid #ff4336',
                        borderRadius: '8px',
                        color: '#ff9800'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* STATS CARDS */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px'
                }}>
                    <StatCard title="Total Libros" value={libros.length} icon="📖" color="#D4A76A" />
                    <StatCard title="Total Mangas" value={mangas.length} icon="🗯️" color="#A67C52" />
                    <StatCard title="Total Cómics" value={comics.length} icon="🦸" color="#C4B49F" />
                    <StatCard title="Audiolibros" value={audiobooks.length} icon="🎧" color="#8B5A8E" />
                    <StatCard title="Contenido Total" value={libros.length + mangas.length + comics.length + audiobooks.length} icon="📚" color="#D4A76A" />
                </div>

                {/* SEARCH AND FILTER */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    padding: '20px',
                    background: '#1f1f1f',
                    borderRadius: '8px'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por título, autor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '200px',
                            padding: '10px 15px',
                            background: '#2a2a2a',
                            border: '1px solid #3a3530',
                            borderRadius: '4px',
                            color: '#E8DCC8',
                            fontSize: '0.95rem'
                        }}
                    />
                    <button
                        onClick={() => setSearchTerm('')}
                        style={{
                            padding: '10px 15px',
                            background: '#3a3530',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#E8DCC8',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#4a4540'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#3a3530'}
                    >
                        Limpiar
                    </button>
                </div>

                {/* TABS */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    borderBottom: '1px solid #3a3530',
                    paddingBottom: '10px'
                }}>
                    {[
                        { id: 'todos', label: 'Todos', icon: '📚' },
                        { id: 'libros', label: 'Libros', icon: '📖' },
                        { id: 'mangas', label: 'Mangas', icon: '🗯️' },
                        { id: 'comics', label: 'Cómics', icon: '🦸' },
                        { id: 'audiobooks', label: 'Audiolibros', icon: '🎧' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                background: activeTab === tab.id ? '#D4A76A' : 'transparent',
                                color: activeTab === tab.id ? '#1a1a1a' : '#E8DCC8',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.background = '#3a3530'
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.background = 'transparent'
                                }
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT TABLE */}
                <div style={{
                    background: '#1f1f1f',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {filteredContent.length === 0 ? (
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            <p style={{ fontSize: '1.1rem' }}>No hay contenido que mostrar</p>
                        </div>
                    ) : (
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{ background: '#2a2a2a', borderBottom: '1px solid #3a3530' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Título</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Autor</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Tipo</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold' }}>Creado</th>
                                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContent.map((item, idx) => (
                                    <tr
                                        key={`${item.type}-${item.id}`}
                                        style={{
                                            borderBottom: '1px solid #3a3530',
                                            background: idx % 2 === 0 ? 'transparent' : 'rgba(212, 167, 106, 0.05)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 167, 106, 0.15)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(212, 167, 106, 0.05)'}
                                    >
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {item.imagen ? (
                                                    <img
                                                        src={getImageUrl(item.imagen)}
                                                        alt={item.titulo}
                                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                                        style={{
                                                            width: '30px',
                                                            height: '40px',
                                                            objectFit: 'cover',
                                                            borderRadius: '2px',
                                                            border: '1px solid #3a3530'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '30px', height: '40px',
                                                        background: '#2a2a2a',
                                                        borderRadius: '2px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.9rem', flexShrink: 0,
                                                        border: '1px solid #3a3530'
                                                    }}>
                                                        {item.type === 'manga' ? '🗯️' : item.type === 'comic' ? '🦸' : item.type === 'audiobook' ? '🎧' : '📖'}
                                                    </div>
                                                )}
                                                <span>{item.titulo || item.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#999' }}>{item.autor || 'N/A'}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: item.type === 'libro' ? 'rgba(212,167,106,0.2)'
                                                    : item.type === 'manga' ? 'rgba(166,124,82,0.2)'
                                                    : item.type === 'audiobook' ? 'rgba(139,90,142,0.2)'
                                                    : 'rgba(196,180,159,0.2)',
                                                color: item.type === 'libro' ? '#D4A76A'
                                                    : item.type === 'manga' ? '#A67C52'
                                                    : item.type === 'audiobook' ? '#c084cc'
                                                    : '#C4B49F',
                                                border: `1px solid ${item.type === 'libro' ? 'rgba(212,167,106,0.35)' : item.type === 'manga' ? 'rgba(166,124,82,0.35)' : item.type === 'audiobook' ? 'rgba(139,90,142,0.4)' : 'rgba(196,180,159,0.35)'}`,
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-block'
                                            }}>
                                                {item.type === 'libro' ? '📖 Libro'
                                                    : item.type === 'manga' ? '🗯️ Manga'
                                                    : item.type === 'audiobook' ? '🎧 Audiolibro'
                                                    : '🦸 Cómic'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', color: '#999', fontSize: '0.8rem' }}>
                                            {new Date(item.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleEditContent(item, item.type)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#D4A76A',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: '#1a1a1a',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(item.id, item.type)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#ff5252',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Eliminar contenido"
                message={`¿Estás seguro que deseas eliminar este ${confirmModal.type}? Esta acción no se puede deshacer.`}
                onConfirm={confirmDeleteContent}
                onCancel={cancelDeleteContent}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDangerous={true}
            />

            <EditContentModal
                isOpen={editModal.isOpen}
                onClose={handleEditClose}
                onUpdate={handleEditUpdate}
                content={editModal.content}
                contentType={editModal.contentType}
            />
        </MainLayout>
    )
}

export default ContenidoPage
