import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Heaven from '../assets/logo.png'
import '../styles/header.css'
import PlanSelectorModal from './payment/PlanSelectorModal'

function Header({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen, onOpenLogin, onOpenRegister, onOpenSearch, onLogout }) {
    const { user, logout, isAdmin, isPremium } = useAuth()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showPlanSelector, setShowPlanSelector] = useState(false)
    const profileMenuRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleProfileClick = () => {
        if (user) {
            setShowProfileMenu(!showProfileMenu)
        } else {
            onOpenLogin()
        }
    }

    const handleLogoutClick = async () => {
        if (onLogout) {
            await onLogout()
        } else {
            await logout()
            navigate('/')
        }
        setShowProfileMenu(false)
    }

    return (
        <>
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            {/* Línea decorativa animada inferior */}
            <div className="header__glow-line" />

            <div className="header__content">
                <div className="header__left">
                    <Link to="/" className="header__logo">
                        <div className="header__logo-ring" />
                        <img src={Heaven} alt="BookHeaven" className="header__logo-image" />
                    </Link>

                    <nav className="header__nav">
                        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink>
                        {isAdmin() && <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Panel Admin</NavLink>}
                        <NavLink to="/biblioteca" className={({ isActive }) => isActive ? 'active' : ''}>Biblioteca</NavLink>
                        <NavLink to="/audiolibros" className={({ isActive }) => isActive ? 'active' : ''}>Audiolibros</NavLink>
                        <NavLink to="/novedades" className={({ isActive }) => isActive ? 'active' : ''}>Novedades</NavLink>
                        {user && <NavLink to="/mi-lista" className={({ isActive }) => isActive ? 'active' : ''}>Mi lista</NavLink>}
                    </nav>
                </div>

                <div className="header__right">
                    <button
                        className="header__search"
                        onClick={() => onOpenSearch()}
                        title="Buscar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="header__search-label">Buscar</span>
                    </button>

                    {!user ? (
                        <div className="header__auth-buttons">
                            <button onClick={onOpenLogin} className="header__auth-btn header__auth-btn--login">Iniciar Sesión</button>
                            <button onClick={onOpenRegister} className="header__auth-btn header__auth-btn--register">
                                <span>Registrarse</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <>
                        {!isPremium() && !isAdmin() && (
                            <button
                                className="header__premium-btn"
                                onClick={() => setShowPlanSelector(true)}
                                title="Hazte Premium desde $9.99/mes"
                            >
                                <span className="header__premium-icon">✦</span>
                                <span>Premium</span>
                            </button>
                        )}
                        <div className="header__profile" ref={profileMenuRef}>
                            <button
                                className="header__profile-button"
                                onClick={handleProfileClick}
                            >
                                <div className="header__avatar-wrapper">
                                    <img src={user.profile_photo_url || "https://ui-avatars.com/api/?name=" + user.name} alt="Perfil" />
                                    {isPremium() && <span className="header__avatar-badge">✦</span>}
                                </div>
                                <span className="header__username">{user.name.split(' ')[0]}</span>
                                <svg className={`header__chevron ${showProfileMenu ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>

                            {showProfileMenu && (
                                <div className="header__profile-menu">
                                    <div className="profile-menu__header">
                                        <div className="profile-menu__avatar">
                                            <img src={user.profile_photo_url || "https://ui-avatars.com/api/?name=" + user.name} alt="Perfil" />
                                        </div>
                                        <div>
                                            <p className="profile-menu__name">{user.name}</p>
                                            <p className="profile-menu__email">{user.email}</p>
                                            <div className="profile-menu__badges">
                                                {isAdmin() && <span className="badge badge-admin">Admin</span>}
                                                {isPremium() && <span className="badge badge-premium">✦ Premium</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="profile-menu__divider"></div>

                                    {isAdmin() && (
                                        <Link to="/dashboard" className="profile-menu__item">
                                            <span className="icon">📊</span> Dashboard
                                        </Link>
                                    )}

                                    <Link to="/biblioteca" className="profile-menu__item">
                                        <span className="icon">📚</span> Mi biblioteca
                                    </Link>
                                    <Link to="/perfil" className="profile-menu__item">
                                        <span className="icon">👤</span> Perfil
                                    </Link>
                                    <Link to="/configuracion" className="profile-menu__item">
                                        <span className="icon">⚙️</span> Configuración
                                    </Link>

                                    {!isPremium() && !isAdmin() && (
                                        <>
                                        <div className="profile-menu__divider"></div>
                                        <button
                                            className="profile-menu__item profile-menu__item--premium"
                                            onClick={() => { setShowProfileMenu(false); setShowPlanSelector(true); }}
                                        >
                                            <span className="icon">✦</span> Ver planes Premium
                                        </button>
                                        </>
                                    )}

                                    <div className="profile-menu__divider"></div>
                                    <button
                                        className="profile-menu__logout"
                                        onClick={handleLogoutClick}
                                    >
                                        <span className="icon">🚪</span> Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                        </>
                    )}

                    <button
                        className={`header__mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menú"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`header__mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                <NavLink to="/" end onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink>
                {isAdmin() && <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>}
                <NavLink to="/biblioteca" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Biblioteca</NavLink>
                <NavLink to="/audiolibros" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Audiolibros</NavLink>
                <NavLink to="/novedades" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Novedades</NavLink>
                {user && <NavLink to="/mi-lista" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>Mi lista</NavLink>}
                {user && !isPremium() && !isAdmin() && (
                    <button
                        className="mobile-premium-btn"
                        onClick={() => { setIsMobileMenuOpen(false); setShowPlanSelector(true); }}
                    >
                        ✦ Ver planes Premium
                    </button>
                )}

                {!user && (
                    <>
                        <div className="mobile-nav-divider"></div>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); onOpenLogin() }}
                            className="mobile-auth-btn"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); onOpenRegister() }}
                            className="mobile-auth-btn highlight"
                        >
                            Crear cuenta
                        </button>
                    </>
                )}
            </div>
        </header>
            <PlanSelectorModal
                isOpen={showPlanSelector}
                onClose={() => setShowPlanSelector(false)}
            />
        </>
    )
}

export default Header