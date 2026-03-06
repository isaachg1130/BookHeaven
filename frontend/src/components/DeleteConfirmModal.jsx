import React from 'react'
import '../styles/delete-confirm-modal.css'

function DeleteConfirmModal({ 
    isOpen, 
    title = 'Confirmar eliminación', 
    message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
    onConfirm, 
    onCancel,
    loading = false
}) {
    if (!isOpen) return null

    return (
        <div className="delete-modal-overlay" onClick={onCancel}>
            <div className="delete-modal" onClick={e => e.stopPropagation()}>
                <div className="delete-modal__header">
                    <div className="delete-modal__icon">⚠️</div>
                    <h2 className="delete-modal__title">{title}</h2>
                </div>

                <div className="delete-modal__body">
                    <p>{message}</p>
                </div>

                <div className="delete-modal__footer">
                    <button 
                        className="delete-modal__btn delete-modal__btn--cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="delete-modal__btn delete-modal__btn--delete"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmModal
