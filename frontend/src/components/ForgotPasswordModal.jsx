import React, { useState } from 'react'
import apiClient from '../api/client'
import '../styles/auth-modal.css'

function ForgotPasswordModal({ isOpen, onClose, onOpenLogin, addToast }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await apiClient.post('/auth/forgot-password', { email })
            setEmailSent(true)
            if (addToast) addToast(response.data.message, 'success')
        } catch (error) {
            console.error(error)
            const message = error.response?.data?.message || 'Error al enviar el enlace de recuperación'
            if (addToast) addToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>×</button>

                <div className="auth-modal-header">
                    <h2>Recuperar Contraseña</h2>
                    <p>Ingresa tu correo para recibir un enlace de recuperación</p>
                </div>

                {!emailSent ? (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="reset-email">Correo electrónico</label>
                            <input
                                type="email"
                                id="reset-email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button-submit"
                            disabled={loading || !email}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                    </form>
                ) : (
                    <div className="auth-success-message">
                        <div className="success-icon">📧</div>
                        <p>Hemos enviado un correo a <strong>{email}</strong> con las instrucciones para restablecer tu contraseña.</p>
                        <button
                            className="auth-button-submit"
                            onClick={() => {
                                onClose()
                                onOpenLogin()
                            }}
                        >
                            Volver al Inicio de Sesión
                        </button>
                    </div>
                )}

                <div className="auth-footer" style={{ marginTop: '20px' }}>
                    <button
                        className="auth-button-secondary"
                        onClick={() => {
                            onClose()
                            onOpenLogin()
                        }}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordModal
