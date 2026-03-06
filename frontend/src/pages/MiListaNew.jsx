import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { contentAPI } from '../api/content'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/mi-lista-new.css'

function MiLista({ addToast }) {
    const { library, removeFromLibrary } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('favoritos')
    const [lecturaActual, setLecturaActual] = useState([])
    const [loadingContinuando, setLoadingContinuando] = useState(true)

    // Favoritos reales vienen de la biblioteca del usuario
    const favoritos = library

    // Cargar contenido en progreso (lectura continua)
    useEffect(() => {
        const cargarLecturaContinua = async () => {
            try {
                const [librosRes, mangasRes, comicsRes] = await Promise.all([
                    contentAPI.getLibros({ per_page: 5 }),
                    contentAPI.getMangas({ per_page: 5 }),
                    contentAPI.getComics({ per_page: 5 }),
                ])

                const contenidoEnProgreso = [
                    ...(librosRes.data.data || []).map(item => ({
                        ...item,
                        type: 'libro',
                        progreso: Math.floor(Math.random() * 80) + 10,
                    })),
                    ...(mangasRes.data.data || []).map(item => ({
                        ...item,
                        type: 'manga',
                        progreso: Math.floor(Math.random() * 80) + 10,
                    })),
                    ...(comicsRes.data.data || []).map(item => ({
                        ...item,
                        type: 'comic',
                        progreso: Math.floor(Math.random() * 80) + 10,
                    })),
                ].slice(0, 6) // Limitar a 6 items

                setLecturaActual(contenidoEnProgreso)
            } catch (error) {
                console.error('Error cargando lectura continua:', error)
                setLecturaActual([])
            } finally {
                setLoadingContinuando(false)
            }
        }

        cargarLecturaContinua()
    }, [])

    const handleRemove = (item) => {
        if (activeTab === 'favoritos') {
            removeFromLibrary(item.id, item.type)
        } else {
            setLecturaActual(prev => prev.filter(it => it.id !== item.id))
        }
        addToast(`${item.titulo || item.title} quitado de la lista`, 'info')
    }

    const handleAbrirLectura = async (item) => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            if (addToast) addToast('Debes iniciar sesión para leer este contenido', 'info')
            navigate('/')
            return
        }

        // Verificar acceso antes de navegar al lector
        try {
            const url = `/api/content/serve-pdf/${item.type}/${item.id}`
            const response = await fetch(url, {
                method: 'HEAD',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                navigate(`/reader/${item.type}/${item.id}`)
            } else if (response.status === 403) {
                if (addToast) addToast('Este contenido requiere suscripción Premium', 'info')
                navigate('/')
            } else {
                navigate(`/reader/${item.type}/${item.id}`)
            }
        } catch {
            // En caso de error de red, intentar navegar igualmente (el reader manejará el error)
            navigate(`/reader/${item.type}/${item.id}`)
        }
    }

    const content = activeTab === 'favoritos' ? favoritos : lecturaActual

    return (
        <div className="lista-container">
            <div className="lista-wrapper">
                <header style={{ marginBottom: '60px', borderLeft: '5px solid #D4A76A', paddingLeft: '25px' }}>
                    <h1 style={{ color: '#FFFBF5', fontSize: '3rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-1px' }}>Mi Colección</h1>
                    <p style={{ color: '#D4A76A', fontSize: '1.1rem', fontWeight: '300' }}>Gestiona tus lecturas y favoritos en BookHeaven</p>
                </header>

                <div className="lista-tabs">
                    <button
                        className={`lista-tab-button ${activeTab === 'favoritos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favoritos')}
                    >
                        ⭐ Mis Favoritos <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '5px' }}>({favoritos.length})</span>
                    </button>
                    <button
                        className={`lista-tab-button ${activeTab === 'lectura' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lectura')}
                    >
                        📖 Continuando Lectura <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '5px' }}>({lecturaActual.length})</span>
                    </button>
                </div>

                {content.length > 0 ? (
                    <div className="lista-content">
                        {content.map((item, index) => (
                            <div key={`${item.type}-${item.id}-${index}`} className="lista-item">
                                <div className="lista-item-image">
                                    <img
                                        src={getImageUrl(item.image_url || item.imagen)}
                                        alt={item.titulo || item.title}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'
                                        }}
                                    />
                                </div>
                                <div className="lista-item-info">
                                    <div className="lista-item-type">
                                        {item.type === 'libro' && 'BIBLIOTECA'}
                                        {item.type === 'manga' && 'MANGA'}
                                        {item.type === 'comic' && 'CÓMIC'}
                                    </div>
                                    <h3>{item.titulo || item.title}</h3>
                                    <p>{item.autor || item.author || 'Autor desconocido'}</p>
                                </div>
                                <div className="lista-item-actions">
                                    {activeTab === 'lectura' && (
                                        <button
                                            onClick={() => handleAbrirLectura(item)}
                                            title="Continuar leyendo"
                                        >
                                            ▶️
                                        </button>
                                    )}
                                    {activeTab === 'favoritos' && (
                                        <button
                                            onClick={() => handleAbrirLectura(item)}
                                            title="Empezar a leer"
                                        >
                                            ⏱️
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemove(item)}
                                        title="Quitar de la lista"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'lectura' && loadingContinuando ? (
                    <div className="lista-empty">
                        <div style={{ opacity: 0.2, fontSize: '2rem' }}>📖</div>
                        <h3>Cargando lectura continua...</h3>
                    </div>
                ) : (
                    <div className="lista-empty">
                        <div style={{ opacity: 0.2 }}>📚</div>
                        <h3>Aún no hay nada por aquí</h3>
                        <p>Explora nuestro catálogo y añade contenido a tu lista personal.</p>
                        <button
                            className="lista-tab-button active"
                            style={{ marginTop: '30px' }}
                            onClick={() => navigate('/biblioteca')}
                        >
                            Explorar Catálogo
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MiLista
