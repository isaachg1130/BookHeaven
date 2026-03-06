import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPdfServiceUrl } from '../utils/pdfUtils'
import '../styles/reader.css'

function ReaderPage() {
    const { type, id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [pdfUrl, setPdfUrl] = useState(null)
    const [accessError, setAccessError] = useState(null) // null | 'NOT_AUTHENTICATED' | 'REQUIRES_PREMIUM' | 'NOT_FOUND' | 'ERROR'
    const [_title, _setTitle] = useState('Cargando...')
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        const loadPdf = async () => {
            const token = localStorage.getItem('auth_token')

            // Verificar si el usuario está autenticado antes de intentar cargar
            if (!token) {
                setAccessError('NOT_AUTHENTICATED')
                setLoading(false)
                return
            }

            try {
                const url = getPdfServiceUrl(type, id)

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/pdf, application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    if (response.status === 403) {
                        // Parsear el JSON de error del backend
                        try {
                            const errorData = await response.json()
                            setAccessError(errorData.code || 'REQUIRES_PREMIUM')
                        } catch {
                            setAccessError('REQUIRES_PREMIUM')
                        }
                    } else if (response.status === 404) {
                        setAccessError('NOT_FOUND')
                    } else {
                        setAccessError('ERROR')
                    }
                    setLoading(false)
                    return
                }

                const blob = await response.blob()
                const blobUrl = URL.createObjectURL(blob)
                setPdfUrl(blobUrl)
                setLoading(false)
            } catch (error) {
                console.error('Error loading PDF:', error)
                setAccessError('ERROR')
                setLoading(false)
            }
        }

        loadPdf()

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    if (loading) {
        return (
            <div className="reader-loading">
                <div className="book-loader">
                    <div className="book-page"></div>
                    <div className="book-page"></div>
                    <div className="book-page"></div>
                </div>
                <h2>Preparando tu lectura...</h2>
                <p>BookHeaven está optimizando el documento para ti.</p>
            </div>
        )
    }

    // Estado de error de acceso
    if (accessError) {
        const isAuthError = accessError === 'NOT_AUTHENTICATED'
        const isPremiumError = accessError === 'REQUIRES_PREMIUM'
        return (
            <div className="reader-loading" style={{ gap: '16px' }}>
                <div style={{ fontSize: '52px', lineHeight: 1 }}>
                    {isAuthError ? (
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                            <rect x="8" y="24" width="36" height="24" rx="4" fill="rgba(212,167,106,0.15)" stroke="#D4A76A" strokeWidth="2"/>
                            <path d="M16 24V18a10 10 0 0 1 20 0v6" stroke="#D4A76A" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <circle cx="26" cy="36" r="3" fill="#D4A76A"/>
                        </svg>
                    ) : isPremiumError ? (
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                            <path d="M26 6l5 10 11 1.5-8 7.5 2.5 11L26 31l-10.5 5 2.5-11-8-7.5L21 16z" fill="rgba(212,167,106,0.2)" stroke="#D4A76A" strokeWidth="2" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                            <circle cx="26" cy="26" r="22" stroke="rgba(212,167,106,0.4)" strokeWidth="2"/>
                            <path d="M26 16v14" stroke="#D4A76A" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="26" cy="36" r="2.5" fill="#D4A76A"/>
                        </svg>
                    )}
                </div>
                <h2 style={{ color: '#FFFBF5', margin: 0 }}>
                    {isAuthError ? 'Inicia sesión para leer'
                        : isPremiumError ? 'Contenido exclusivo Premium'
                        : accessError === 'NOT_FOUND' ? 'Archivo no encontrado'
                        : 'No se pudo cargar el contenido'}
                </h2>
                <p style={{ color: 'rgba(232,220,200,0.5)', margin: 0, maxWidth: '340px', textAlign: 'center', fontSize: '14px' }}>
                    {isAuthError ? 'Necesitas una cuenta para acceder a este contenido.'
                        : isPremiumError ? 'Suscríbete a Premium para desbloquear este libro, manga o cómic.'
                        : accessError === 'NOT_FOUND' ? 'El archivo PDF de este contenido no está disponible.'
                        : 'Ocurrió un error al intentar cargar el PDF. Inténtalo de nuevo.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#D4A76A,#C49050)', border: 'none', borderRadius: '10px', color: '#1a0f04', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                    >
                        {isAuthError ? 'Ir al inicio' : isPremiumError ? 'Ver planes Premium' : 'Volver al inicio'}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ padding: '11px 22px', background: 'rgba(212,167,106,0.08)', border: '1px solid rgba(212,167,106,0.2)', borderRadius: '10px', color: 'rgba(212,167,106,0.8)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`reader-container ${isFullscreen ? 'is-fullscreen' : ''}`}>
            <header className="reader-header">
                <div className="reader-header-left">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <span className="icon">←</span>
                        <span className="text">Volver</span>
                    </button>
                    <div className="reader-title-group">
                        <span className="content-type-badge">{type}</span>
                        <h1>Lectura en curso</h1>
                    </div>
                </div>

                <div className="reader-controls">
                    <button
                        className="control-btn"
                        onClick={toggleFullscreen}
                        title="Pantalla completa"
                    >
                        {isFullscreen ? '📺' : '🖥️'}
                    </button>
                    <button className="btn-exit" onClick={() => navigate(-1)}>
                        Cerrar Sesión de Lectura
                    </button>
                </div>
            </header>

            <main className="reader-viewport">
                <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title="PDF Reader"
                    className="pdf-iframe"
                />
            </main>
        </div>
    )
}

export default ReaderPage
