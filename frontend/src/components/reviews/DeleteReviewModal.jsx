import React from 'react'
import '../../styles/delete-review-modal.css'

const DeleteReviewModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    if (!isOpen) return null

    return (
        <div className="delete-review-modal-overlay">
            <div className="delete-review-modal-content">
                {/* Encabezado */}
                <div className="delete-review-modal__header">
                    <h2 className="delete-review-modal__title">⚠️ Eliminar Reseña</h2>
                    <button 
                        className="delete-review-modal__close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido */}
                <div className="delete-review-modal__body">
                    <p className="delete-review-modal__message">
                        ¿Estás seguro de que deseas eliminar tu reseña? 
                    </p>
                    <div className="delete-review-modal__warning">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
                        </svg>
                        <span>Esta acción no se puede deshacer.</span>
                    </div>
                </div>

                {/* Botones */}
                <div className="delete-review-modal__footer">
                    <button
                        className="delete-review-modal__btn delete-review-modal__btn--cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        className="delete-review-modal__btn delete-review-modal__btn--delete"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteReviewModal
