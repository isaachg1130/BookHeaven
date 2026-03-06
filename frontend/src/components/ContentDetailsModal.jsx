import React from 'react'
import ReviewsSection from './reviews/ReviewsSection'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/reviews.css'

const ContentDetailsModal = ({ isOpen, onClose, content, onRead }) => {
    if (!isOpen || !content) return null

    // Determine content type string for backend (e.g. 'Libro' -> 'libro')
    const getContentType = () => {
        if (content.type) return content.type.toLowerCase()
        // Fallback if type is not explicit
        if (content.pdf) return 'libro'
        return 'libro'
    }

    const contentType = getContentType()

    return (
        <div className="details-modal-overlay" onClick={onClose}>
            <div className="details-modal-content" onClick={e => e.stopPropagation()}>
                <button className="details-modal-close" onClick={onClose}>&times;</button>

                <div className="details-hero">
                    <img
                        src={getImageUrl(content.poster || content.imagen)}
                        alt={content.title || content.titulo}
                        className="details-cover"
                    />

                    <div className="details-info">
                        <h2>{content.title || content.titulo}</h2>
                        <span className="details-author">por {content.author || content.autor}</span>

                        <div className="details-meta">
                            <span className="meta-item">
                                📅 {new Date(content.created_at || new Date().getTime()).getFullYear()}
                            </span>
                            <span className="meta-item">
                                📂 {content.genre || content.genero || 'General'}
                            </span>
                            {content.isPremium && (
                                <span className="meta-item badge-premium">✦ Premium</span>
                            )}
                        </div>

                        <p className="details-description">
                            {content.description || content.descripcion || 'Sin descripción disponible.'}
                        </p>

                        <div className="details-actions">
                            <button
                                className="btn-read-primary"
                                onClick={() => onRead(content)}
                            >
                                📖 Leer Ahora
                            </button>
                        </div>
                    </div>
                </div>

                <div className="details-content-body" style={{ padding: '0 3rem 3rem' }}>
                    <ReviewsSection
                        contentType={contentType}
                        contentId={content.id}
                    />
                </div>
            </div>
        </div>
    )
}

export default ContentDetailsModal
