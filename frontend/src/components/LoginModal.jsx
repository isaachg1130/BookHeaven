import React, { useState } from 'react'
import '../styles/auth-modal.css'

function LoginModal({ isOpen, onClose, onOpenRegister, onOpenForgotPassword, onError, loginFunction }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Validación de email
    const validateEmail = (emailValue) => {
        // Trimear el email para verificar
        const trimmedEmail = emailValue.trim()
        
        // Validar que no haya espacios en ninguna parte
        if (emailValue !== trimmedEmail) {
            return 'El correo no puede tener espacios al inicio o final'
        }
        if (/\s/.test(emailValue)) {
            return 'El correo no puede contener espacios'
        }
        
        // Validación del formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(emailValue)) {
            return 'Por favor ingresa un correo electrónico válido'
        }
        return ''
    }

    // Validación de contraseña
    const validatePassword = (passwordValue) => {
        // Validar que no haya espacios
        if (/\s/.test(passwordValue)) {
            return 'La contraseña no puede contener espacios'
        }
        if (passwordValue.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres'
        }
        return ''
    }

    const handleEmailChange = (e) => {
        const value = e.target.value
        setEmail(value)
        setError('') // Limpiar error de autenticación cuando el usuario edita

        // Validar email en tiempo real
        if (value) {
            setEmailError(validateEmail(value))
        } else {
            setEmailError('')
        }
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        setError('') // Limpiar error de autenticación cuando el usuario edita

        // Validar contraseña en tiempo real
        if (value) {
            setPasswordError(validatePassword(value))
        } else {
            setPasswordError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setEmailError('')
        setPasswordError('')

        // Validación final del email
        const finalEmailError = validateEmail(email)
        if (finalEmailError) {
            setEmailError(finalEmailError)
            setError(finalEmailError)
            if (onError) onError(finalEmailError)
            return
        }

        // Validación final de la contraseña
        const finalPasswordError = validatePassword(password)
        if (finalPasswordError) {
            setPasswordError(finalPasswordError)
            setError(finalPasswordError)
            if (onError) onError(finalPasswordError)
            return
        }

        setLoading(true)

        try {
            // Usar la función de login pasada por props (conectada a AuthContext)
            if (loginFunction) {
                await loginFunction(email, password)
            } else {
                throw new Error('Función de login no disponible')
            }
            // Si tiene éxito, el componente padre se encarga de cerrar y notificar
            setEmail('')
            setPassword('')
            setEmailError('')
            setPasswordError('')
        } catch (err) {
            // El error msg viene del throw en App.jsx -> AuthContext
            // IMPORTANTE: No limpiamos email ni password para que el usuario vea sus datos
            const errorMsg = err.response?.data?.message || err.message || 'Error al iniciar sesión'
            setError(errorMsg)
            if (onError) onError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>×</button>

                <div className="auth-modal-header">
                    <h2>Iniciar Sesión</h2>
                    <p>Bienvenido a BookHeaven</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {error && !emailError && !passwordError && (
                        <div className="auth-error-top" role="alert" aria-live="polite">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="text"
                            id="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    setEmailError(validateEmail(e.target.value))
                                }
                            }}
                            aria-required="true"
                            aria-invalid={!!emailError}
                            aria-describedby={emailError ? "email-error" : "email-hint"}
                            required
                            disabled={loading}
                            className={emailError ? 'input-error-border' : ''}
                        />
                        {emailError && (
                            <small id="email-error" className="error-text" role="alert">
                                ✗ {emailError}
                            </small>
                        )}
                        {!emailError && email && (
                            <small id="email-hint" className="success-text">✓ Correo válido</small>
                        )}
                        {!email && !emailError && (
                            <small id="email-hint" className="hint-text">Ingresa tu correo registrado</small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={(e) => {
                                    if (e.target.value) {
                                        setPasswordError(validatePassword(e.target.value))
                                    }
                                }}
                                aria-required="true"
                                aria-invalid={!!passwordError}
                                aria-describedby={passwordError ? "password-error" : "password-hint"}
                                minLength="6"
                                required
                                disabled={loading}
                                className={passwordError ? 'input-error-border' : ''}
                            />
                            {password && (
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    disabled={loading}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            )}
                        </div>
                        {passwordError && (
                            <small id="password-error" className="error-text" role="alert">
                                ✗ {passwordError}
                            </small>
                        )}
                        {!passwordError && password && (
                            <small id="password-hint" className="success-text">✓ Contraseña válida</small>
                        )}
                        {!password && !passwordError && (
                            <small id="password-hint" className="hint-text">Mínimo 6 caracteres</small>
                        )}
                    </div>

                    <div className="forgot-password-link">
                        <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                                onClose()
                                if (onOpenForgotPassword) onOpenForgotPassword()
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="auth-button-submit"
                        disabled={loading || !!emailError || !email || !!passwordError || !password}
                        aria-busy={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-divider">o</div>

                <div className="auth-footer">
                    <p>¿No tienes cuenta?</p>
                    <button
                        className="auth-button-secondary"
                        onClick={() => {
                            onClose()
                            onOpenRegister()
                        }}
                    >
                        Regístrate aquí
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LoginModal
