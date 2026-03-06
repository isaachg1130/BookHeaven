import React from 'react'
import ReactDOM from 'react-dom'
import '../styles/ConfirmModal.css'

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isDangerous = false }) {
    if (!isOpen) return null

    return ReactDOM.createPortal(
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-modal__header">
                    <h2>{title}</h2>
                </div>

                <div className="confirm-modal__body">
                    <p>{message}</p>
                </div>

                <div className="confirm-modal__actions">
                    <button
                        className="confirm-modal__btn confirm-modal__btn--cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-modal__btn ${isDangerous ? 'confirm-modal__btn--dangerous' : 'confirm-modal__btn--confirm'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default ConfirmModal
