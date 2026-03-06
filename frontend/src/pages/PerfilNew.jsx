import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/auth'
import PlanSelectorModal from '../components/payment/PlanSelectorModal'
import { useNavigate } from 'react-router-dom'
import '../styles/perfil-new.css'
import '../styles/auth-modal.css'

function Perfil({ addToast }) {
    const { user, isPremium, isAdmin, refreshUser, logout } = useAuth()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [showPlanSelector, setShowPlanSelector] = useState(false)
    const [userStats, setUserStats] = useState({
        libros: 0,
        mangas: 0,
        comics: 0,
        audiobooks: 0,
        horasLectura: 0
    })
    const [statsLoading, setStatsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        genero: 'Fantasía',
        idioma: 'Español'
    })
    const [loading, setLoading] = useState(false)

    // Modal cambio de contraseña
    const [showPwModal, setShowPwModal] = useState(false)
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
    const [pwLoading, setPwLoading] = useState(false)
    const [pwErrors, setPwErrors] = useState({})
    const [showPwCurrent, setShowPwCurrent] = useState(false)
    const [showPwNew, setShowPwNew] = useState(false)
    const [showPwConfirm, setShowPwConfirm] = useState(false)

    const calcPasswordStrength = (password) => {
        if (!password) return { score: 0, feedback: [] }
        const feedback = []
        let score = 0
        if (password.length >= 8) { score += 20 } else { feedback.push('Mínimo 8 caracteres') }
        if (password.length >= 12) { score += 10 }
        if (/[A-Z]/.test(password)) { score += 20 } else { feedback.push('Mayúsculas (A-Z)') }
        if (/[a-z]/.test(password)) { score += 20 } else { feedback.push('Minúsculas (a-z)') }
        if (/\d/.test(password)) { score += 15 } else { feedback.push('Números (0-9)') }
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) { score += 15 } else { feedback.push('Caracteres especiales (!@#$%)') }
        return { score: Math.min(score, 100), feedback }
    }
    const getPwStrengthLevel = (score) => {
        if (score === 0) return { color: 'rgba(255,255,255,0.1)', text: '', textColor: '' }
        if (score < 30) return { color: '#ff4444', text: 'Muy débil', textColor: '#ff4444' }
        if (score < 50) return { color: '#ff8c00', text: 'Débil', textColor: '#ff8c00' }
        if (score < 70) return { color: '#ffd700', text: 'Media', textColor: '#ffd700' }
        if (score < 85) return { color: '#90ee90', text: 'Fuerte', textColor: '#90ee90' }
        return { color: '#00cc44', text: 'Muy fuerte', textColor: '#00cc44' }
    }
    const pwStrength = calcPasswordStrength(pwForm.new_password)
    const pwLevel = getPwStrengthLevel(pwStrength.score)

    // --- Suscripción ---
    const premiumExpiresAt = user?.premium_expires_at ? new Date(user.premium_expires_at) : null
    const now = new Date()
    const isCurrentlyPremium = isPremium() && (!premiumExpiresAt || premiumExpiresAt > now)
    const isPremiumExpired = !isCurrentlyPremium && user?.role?.name === 'premium'
    const daysRemaining = isCurrentlyPremium && premiumExpiresAt
        ? Math.ceil((premiumExpiresAt - now) / (1000 * 60 * 60 * 24))
        : 0

    const estimateTotalDays = () => {
        if (!isCurrentlyPremium) return 30
        if (daysRemaining <= 30) return 30
        if (daysRemaining <= 90) return 90
        if (daysRemaining <= 180) return 180
        return 365
    }
    const totalDays = estimateTotalDays()
    const progressPercent = isCurrentlyPremium
        ? Math.min(100, Math.round((daysRemaining / totalDays) * 100))
        : 0

    const formatDate = (date) => {
        if (!date) return ''
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    // ------------------

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || 'Amante de las buenas historias.',
                genero: user.genero || 'Fantasía',
                idioma: user.idioma || 'Español'
            })
        }
    }, [user])

    // Cargar estadísticas de usuario
    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user) return
            
            try {
                setStatsLoading(true)
                const response = await authAPI.getUserStats()
                setUserStats(response.data)
            } catch (error) {
                console.error('Error al obtener estadísticas:', error)
                // Mantener valores en 0 si hay error
            } finally {
                setStatsLoading(false)
            }
        }

        fetchUserStats()
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSaveProfile = async () => {
        setLoading(true)
        try {
            const res = await authAPI.updateProfile({
                name: formData.name,
                bio: formData.bio,
                email: formData.email,
            })
            await refreshUser()
            addToast('Perfil actualizado correctamente', 'success')
            setIsEditing(false)
        } catch (err) {
            const msg = err?.response?.data?.message
                || Object.values(err?.response?.data?.errors || {})[0]?.[0]
                || 'Error al actualizar perfil'
            addToast(msg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPwErrors({})
        const errs = {}
        if (!pwForm.current_password) errs.current_password = 'Ingresa tu contraseña actual'
        if (/\s/.test(pwForm.new_password)) errs.new_password = 'La contraseña no puede contener espacios'
        else if (pwForm.new_password.length < 8) errs.new_password = 'Mínimo 8 caracteres'
        else if (!/[A-Z]/.test(pwForm.new_password)) errs.new_password = 'Debe incluir al menos una mayúscula'
        else if (!/[a-z]/.test(pwForm.new_password)) errs.new_password = 'Debe incluir al menos una minúscula'
        else if (!/\d/.test(pwForm.new_password)) errs.new_password = 'Debe incluir al menos un número'
        else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwForm.new_password)) errs.new_password = 'Debe incluir al menos un carácter especial'
        if (pwForm.new_password !== pwForm.new_password_confirmation) errs.new_password_confirmation = 'Las contraseñas no coinciden'
        if (Object.keys(errs).length) { setPwErrors(errs); return }

        setPwLoading(true)
        try {
            await authAPI.changePassword({
                current_password: pwForm.current_password,
                new_password: pwForm.new_password,
                new_password_confirmation: pwForm.new_password_confirmation,
            })
            addToast('Contraseña actualizada correctamente', 'success')
            setShowPwModal(false)
            setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' })
        } catch (err) {
            const msg = err?.response?.data?.message || 'Error al cambiar la contraseña'
            setPwErrors({ general: msg })
        } finally {
            setPwLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            addToast('Sesión cerrada correctamente', 'success')
            navigate('/', { replace: true, state: {} })
        } catch (err) {
            console.error('Error al cerrar sesión:', err)
            addToast('Error al cerrar sesión', 'error')
        }
    }

    return (
        <>
        <div className="perfil-container">
            <div className="perfil-wrapper">

                {/* ── Header Section ── */}
                <div className={`perfil-header${isCurrentlyPremium && !isAdmin() ? ' is-premium' : ''}`}>
                    <div className="perfil-avatar-container">
                        <div className="perfil-avatar-glow"></div>
                        <div className="perfil-avatar-image">
                            {user.profile_photo_url ? (
                                <img src={user.profile_photo_url} alt={user.name} />
                            ) : (
                                <span>{user.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        {isCurrentlyPremium && !isAdmin() && <div className="perfil-badge">PREMIUM</div>}
                    </div>

                    <div className="perfil-title-area">
                        <h1>{user.name}</h1>
                        {isAdmin() ? (
                            <p className="perfil-subtitle" style={{ color: '#D4A76A' }}>
                                🛡️ Administrador · Acceso total a BookHeaven
                            </p>
                        ) : isCurrentlyPremium ? (
                            <p className="perfil-subtitle" style={{ color: '#D4A76A' }}>
                                ⭐ Miembro Premium · Acceso ilimitado a BookHeaven
                            </p>
                        ) : (
                            <p className="perfil-subtitle">Lectura Estelar · Miembro desde 2026</p>
                        )}
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="perfil-stats-grid">
                    <div className="stat-card">
                        <span className="stat-card-icon">📚</span>
                        <span className="stat-card-value">
                            {statsLoading ? '---' : userStats.libros}
                        </span>
                        <span className="stat-card-label">Libros</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-card-icon">🎨</span>
                        <span className="stat-card-value">
                            {statsLoading ? '---' : userStats.mangas}
                        </span>
                        <span className="stat-card-label">Mangas</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-card-icon">💫</span>
                        <span className="stat-card-value">
                            {statsLoading ? '---' : userStats.comics}
                        </span>
                        <span className="stat-card-label">Cómics</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-card-icon">⏱️</span>
                        <span className="stat-card-value">
                            {statsLoading ? '---' : `${userStats.horasLectura}h`}
                        </span>
                        <span className="stat-card-label">Lectura</span>
                    </div>
                </div>

                {/* ── Membership Banner (full-width) ── */}
                {!isAdmin() && (isCurrentlyPremium ? (
                    <div className="premium-membership-banner">
                        <div className="pmb-inner">
                            <div className="pmb-left">
                                {/* Título */}
                                <div className="pmb-title-row">
                                    <span className="pmb-crown">👑</span>
                                    <span className="pmb-title">Membresía Premium</span>
                                    <span className="pmb-badge">ACTIVA</span>
                                </div>

                                {/* Fecha y estado */}
                                <div className="pmb-expiry-row">
                                    <div>
                                        <div className="pmb-expiry-label">
                                            {premiumExpiresAt ? 'Tu plan vence el' : 'Tipo de acceso'}
                                        </div>
                                        <div className="pmb-expiry-date">
                                            {premiumExpiresAt ? formatDate(premiumExpiresAt) : '♾️ Acceso ilimitado'}
                                        </div>
                                    </div>
                                    {premiumExpiresAt && (
                                        <span className={`pmb-days-chip${daysRemaining <= 10 ? ' urgent' : ''}`}>
                                            {daysRemaining <= 10 ? `⚠️ ${daysRemaining} días restantes` : `${daysRemaining} días activos`}
                                        </span>
                                    )}
                                </div>

                                {/* Barra de progreso */}
                                {premiumExpiresAt && (
                                    <div className="pmb-progress-wrap">
                                        <div className="pmb-progress-bar-bg">
                                            <div
                                                className="pmb-progress-bar-fill"
                                                style={{
                                                    width: `${progressPercent}%`,
                                                    background: daysRemaining <= 10
                                                        ? 'linear-gradient(90deg, #ff6b35, #ff4444)'
                                                        : 'linear-gradient(90deg, #D4A76A, #F0C882)',
                                                }}
                                            />
                                        </div>
                                        <div className="pmb-progress-labels">
                                            <span>Inicio del plan</span>
                                            <span>{progressPercent}% transcurrido</span>
                                        </div>
                                    </div>
                                )}

                                {/* Botón renovar */}
                                <button className="pmb-renew-btn" onClick={() => setShowPlanSelector(true)}>
                                    🔄 Renovar suscripción
                                </button>
                            </div>

                            {/* Días restantes — número grande */}
                            {premiumExpiresAt && (
                                <div className="pmb-right">
                                    <div className={`pmb-days-number${daysRemaining <= 10 ? ' urgent' : ''}`}>
                                        {daysRemaining}
                                    </div>
                                    <div className="pmb-days-label">días restantes</div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : isPremiumExpired ? (
                    <div className="upgrade-banner" style={{ borderColor: 'rgba(255,107,53,0.3)', background: 'linear-gradient(135deg,rgba(60,20,10,0.7),rgba(40,25,10,0.5))' }}>
                        <div className="upgrade-banner-text">
                            <h3 style={{ color: '#ff6b35' }}>⏰ Tu suscripción Premium ha vencido</h3>
                            <p>Venció el <strong style={{ color: '#E8DCC8' }}>{formatDate(premiumExpiresAt)}</strong>. Renueva para recuperar acceso ilimitado al catálogo.</p>
                        </div>
                        <button className="upgrade-banner-btn" onClick={() => setShowPlanSelector(true)}>
                            ✨ Renovar ahora
                        </button>
                    </div>
                ) : (
                    <div className="upgrade-banner">
                        <div className="upgrade-banner-text">
                            <h3>⭐ Mejora tu experiencia con Premium</h3>
                            <p>Accede a todo el catálogo, audiolibros exclusivos, descargas offline y mucho más.</p>
                        </div>
                        <button className="upgrade-banner-btn" onClick={() => setShowPlanSelector(true)}>
                            ⭐ Ver planes Premium
                        </button>
                    </div>
                ))}

                {/* ── Main Grid ── */}
                <div className="perfil-main-grid">
                    {/* Columna izquierda - Datos */}
                    <div className="perfil-left">
                        <div className="perfil-card">
                            <h2>👤 Datos de Usuario</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input type="text" name="name" className="form-input"
                                        value={formData.name} onChange={handleInputChange}
                                        disabled={!isEditing} placeholder="Tu nombre" />
                                </div>
                                <div className="form-group">
                                    <label>Correo Electrónico</label>
                                    <input type="email" name="email" className="form-input"
                                        value={formData.email} onChange={handleInputChange}
                                        disabled={!isEditing} placeholder="tu@correo.com" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '10px' }}>
                                <label>Biografía Personal</label>
                                <textarea name="bio" className="form-input"
                                    style={{ minHeight: '80px', resize: 'none' }}
                                    value={formData.bio} onChange={handleInputChange}
                                    disabled={!isEditing} placeholder="Cuéntanos un poco sobre ti..." />
                            </div>
                        </div>

                        <div className="perfil-card">
                            <h2>❤️ Preferencias de Lectura</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Género Favorito</label>
                                    <select name="genero" className="form-input"
                                        value={formData.genero} onChange={handleInputChange} disabled={!isEditing}>
                                        <option>Fantasía</option>
                                        <option>Ciencia Ficción</option>
                                        <option>Misterio</option>
                                        <option>Romance</option>
                                        <option>Aventura</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Idioma Preferido</label>
                                    <select name="idioma" className="form-input"
                                        value={formData.idioma} onChange={handleInputChange} disabled={!isEditing}>
                                        <option>Español</option>
                                        <option>English</option>
                                        <option>Francés</option>
                                        <option>Japonés</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Gestión */}
                    <div className="perfil-right">
                        <div className="perfil-card" style={{ height: 'fit-content' }}>
                            <h2>⚙️ Gestión de Cuenta</h2>
                            <div className="perfil-actions" style={{ flexDirection: 'column', gap: '15px' }}>
                                {isEditing ? (
                                    <>
                                        <button className="btn-premium btn-gold" onClick={handleSaveProfile}
                                            disabled={loading} style={{ width: '100%' }}>
                                            {loading ? 'Guardando...' : 'Confirmar Cambios'}
                                        </button>
                                        <button className="btn-premium btn-outline" onClick={() => setIsEditing(false)}
                                            style={{ width: '100%' }}>
                                            Cancelar Edición
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn-premium btn-gold" onClick={() => setIsEditing(true)}
                                        style={{ width: '100%' }}>
                                        ✏️ Editar Perfil
                                    </button>
                                )}
                                <div style={{ height: '1px', background: 'rgba(212,167,106,0.1)', margin: '4px 0' }} />
                                <button className="btn-premium btn-outline" style={{ width: '100%' }}
                                    onClick={() => setShowPwModal(true)}>
                                    🔒 Cambiar Contraseña
                                </button>
                                <button className="btn-premium btn-outline"
                                    onClick={handleLogout}
                                    style={{ width: '100%', color: '#ff4444', borderColor: 'rgba(255,68,68,0.2)' }}>
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        </div>

                        {/* Beneficios premium (solo usuario premium, no admin) */}
                        {isCurrentlyPremium && !isAdmin() && (
                            <div className="perfil-card" style={{
                                background: 'linear-gradient(135deg,rgba(212,167,106,0.08),rgba(30,25,20,0.6))',
                                border: '1px solid rgba(212,167,106,0.2)',
                            }}>
                                <h2 style={{ fontSize: '1rem' }}>✨ Tus beneficios</h2>
                                {[
                                    ['📚', 'Catálogo completo sin límites'],
                                    ['🎧', 'Audiolibros premium exclusivos'],
                                    ['📥', 'Descargas para leer offline'],
                                    ['🔄', 'Sincronización de progreso'],
                                    ['🚫', 'Sin publicidad'],
                                ].map(([icon, text]) => (
                                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(212,167,106,0.07)', fontSize: '0.85rem', color: '#E8DCC8' }}>
                                        <span>{icon}</span>
                                        <span>{text}</span>
                                        <span style={{ marginLeft: 'auto', color: '#D4A76A', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
        <PlanSelectorModal
            isOpen={showPlanSelector}
            onClose={() => { setShowPlanSelector(false); refreshUser(); }}
        />

        {/* ── Modal Cambiar Contraseña ── */}
        {showPwModal && (
            <div
                onClick={e => { if (e.target === e.currentTarget) { setShowPwModal(false); setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' }); setPwErrors({}); setShowPwCurrent(false); setShowPwNew(false); setShowPwConfirm(false) } }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, rgba(40,28,15,0.98), rgba(30,22,10,0.98))',
                    border: '1px solid rgba(212,167,106,0.3)',
                    borderRadius: '20px',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '440px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                }}>
                    {/* Cabecera */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <div>
                            <h2 style={{ color: '#E8DCC8', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>🔒 Cambiar Contraseña</h2>
                            <p style={{ color: '#A67C52', fontSize: '0.82rem', margin: '4px 0 0' }}>Ingresa tu contraseña actual y la nueva</p>
                        </div>
                        <button onClick={() => { setShowPwModal(false); setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' }); setPwErrors({}); setShowPwCurrent(false); setShowPwNew(false); setShowPwConfirm(false) }} style={{ background: 'none', border: 'none', color: '#A67C52', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>

                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Contraseña actual */}
                        <div className="form-group">
                            <label>Contraseña actual</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwCurrent ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={pwForm.current_password}
                                    onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                                    autoComplete="current-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" onClick={() => setShowPwCurrent(v => !v)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A67C52', fontSize: '1.1rem', lineHeight: 1 }}>
                                    {showPwCurrent ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {pwErrors.current_password && (
                                <span style={{ color: '#ff6b35', fontSize: '0.75rem' }}>{pwErrors.current_password}</span>
                            )}
                        </div>

                        {/* Nueva contraseña */}
                        <div className="form-group">
                            <label>Nueva contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwNew ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Mínimo 8 caracteres"
                                    value={pwForm.new_password}
                                    onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                                    autoComplete="new-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" onClick={() => setShowPwNew(v => !v)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A67C52', fontSize: '1.1rem', lineHeight: 1 }}>
                                    {showPwNew ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Barra de fortaleza */}
                            {pwForm.new_password && (
                                <div className="password-strength-container">
                                    <div className="password-strength-bar">
                                        <div
                                            className="password-strength-fill"
                                            style={{
                                                width: `${pwStrength.score}%`,
                                                backgroundColor: pwLevel.color,
                                                transition: 'all 0.3s ease'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="password-strength-info">
                                        <span className="strength-level" style={{ color: pwLevel.color }}>
                                            {pwLevel.text}
                                        </span>
                                        <span className="strength-score">{pwStrength.score}%</span>
                                    </div>
                                    {pwStrength.feedback.length > 0 && (
                                        <div className="password-requirements">
                                            <p className="requirements-title">Falta agregar:</p>
                                            <ul>
                                                {pwStrength.feedback.map((item, index) => (
                                                    <li key={index}>
                                                        <span className="requirement-icon">✗</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {pwErrors.new_password && (
                                <span style={{ color: '#ff6b35', fontSize: '0.75rem' }}>{pwErrors.new_password}</span>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="form-group">
                            <label>Confirmar nueva contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwConfirm ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Repite la nueva contraseña"
                                    value={pwForm.new_password_confirmation}
                                    onChange={e => setPwForm(p => ({ ...p, new_password_confirmation: e.target.value }))}
                                    autoComplete="new-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button type="button" onClick={() => setShowPwConfirm(v => !v)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A67C52', fontSize: '1.1rem', lineHeight: 1 }}>
                                    {showPwConfirm ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {/* Coincidencia en tiempo real */}
                            {pwForm.new_password_confirmation.length > 0 && (
                                <span style={{ fontSize: '0.72rem', color: pwForm.new_password === pwForm.new_password_confirmation ? '#00cc44' : '#ff6b35' }}>
                                    {pwForm.new_password === pwForm.new_password_confirmation ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                                </span>
                            )}
                            {pwErrors.new_password_confirmation && (
                                <span style={{ color: '#ff6b35', fontSize: '0.75rem' }}>{pwErrors.new_password_confirmation}</span>
                            )}
                        </div>

                        {pwErrors.general && (
                            <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#ff6b35', fontSize: '0.82rem' }}>
                                {pwErrors.general}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                            <button type="button"
                                onClick={() => { setShowPwModal(false); setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' }); setPwErrors({}); setShowPwCurrent(false); setShowPwNew(false); setShowPwConfirm(false) }}
                                className="btn-premium btn-outline" style={{ flex: 1 }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={pwLoading}
                                className="btn-premium btn-gold" style={{ flex: 1 }}>
                                {pwLoading ? 'Guardando...' : 'Actualizar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    )
}

export default Perfil

