import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import '../styles/auth-modal.css' // Reutilizamos estilos de auth

function ResetPasswordPage({ addToast }) {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [confirmError, setConfirmError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    useEffect(() => {
        if (!token || !email) {
            setError('Enlace inválido. Por favor, solicita una nueva recuperación de contraseña.')
        }
    }, [token, email])

    const validatePassword = (pwd) => {
        if (!pwd) return 'La contraseña es requerida'
        if (pwd.length < 8) return 'Mínimo 8 caracteres'
        if (!/[A-Z]/.test(pwd)) return 'Debe contener mayúsculas'
        if (!/[a-z]/.test(pwd)) return 'Debe contener minúsculas'
        if (!/[0-9]/.test(pwd)) return 'Debe contener números'
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Se recomienda un carácter especial'
        return ''
    }

    const handlePasswordChange = (e) => {
        const pwd = e.target.value
        setPassword(pwd)
        setPasswordError(validatePassword(pwd))
        if (passwordConfirmation && pwd !== passwordConfirmation) {
            setConfirmError('Las contraseñas no coinciden')
        } else if (passwordConfirmation && pwd === passwordConfirmation) {
            setConfirmError('')
        }
    }

    const handleConfirmChange = (e) => {
        const confirm = e.target.value
        setPasswordConfirmation(confirm)
        if (confirm && password && confirm !== password) {
            setConfirmError('Las contraseñas no coinciden')
        } else {
            setConfirmError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const pwdError = validatePassword(password)
        if (pwdError) {
            setPasswordError(pwdError)
            return
        }

        if (!passwordConfirmation) {
            setConfirmError('Confirma tu contraseña')
            return
        }

        if (password !== passwordConfirmation) {
            setConfirmError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        try {
            const response = await apiClient.post('/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            })

            setSuccess(true)
            if (addToast) addToast(response.data.message, 'success')

            // Redirigir al inicio después de 3 segundos
            setTimeout(() => {
                navigate('/', { state: { openLogin: true } })
            }, 3000)

        } catch (err) {
            const message = err.response?.data?.message || 'Error al restablecer la contraseña'
            setError(message)
            if (addToast) addToast(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="reset-password-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-gradient)',
            padding: '20px'
        }}>
            <div className="auth-modal" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <div className="auth-modal-header">
                    <h2>Nueva Contraseña</h2>
                    <p>Establece tu nueva contraseña de acceso</p>
                </div>

                {error && <div className="auth-error" style={{ marginBottom: '15px' }}>{error}</div>}

                {success ? (
                    <div className="auth-success-message">
                        <div className="success-icon">✅</div>
                        <p>¡Tu contraseña ha sido restablecida con éxito!</p>
                        <p>Redirigiéndote al inicio de sesión...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Nueva Contraseña</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        border: `2px solid ${passwordError && password ? '#ff4444' : password ? '#44cc44' : '#ddd'}`,
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                {password && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            padding: '0 8px'
                                        }}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                )}
                            </div>
                            {passwordError && password ? (
                                <small style={{ color: '#ff4444', marginTop: '4px', display: 'block' }}>✗ {passwordError}</small>
                            ) : password ? (
                                <small style={{ color: '#44cc44', marginTop: '4px', display: 'block' }}>✓ Contraseña válida</small>
                            ) : null}
                        </div>

                        <div className="form-group">
                            <label>Confirmar Contraseña</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repite tu contraseña"
                                    value={passwordConfirmation}
                                    onChange={handleConfirmChange}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        border: `2px solid ${confirmError && passwordConfirmation ? '#ff4444' : passwordConfirmation && !confirmError ? '#44cc44' : '#ddd'}`,
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                />
                                {passwordConfirmation && (
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            padding: '0 8px'
                                        }}
                                    >
                                        {showConfirm ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                )}
                            </div>
                            {confirmError && passwordConfirmation ? (
                                <small style={{ color: '#ff4444', marginTop: '4px', display: 'block' }}>✗ {confirmError}</small>
                            ) : passwordConfirmation && !confirmError ? (
                                <small style={{ color: '#44cc44', marginTop: '4px', display: 'block' }}>✓ Las contraseñas coinciden</small>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            className="auth-button-submit"
                            disabled={loading || !!passwordError || !!confirmError || !password || !passwordConfirmation}
                        >
                            {loading ? 'Restableciendo...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ResetPasswordPage
