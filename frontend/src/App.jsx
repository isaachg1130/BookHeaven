import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import RegisterModal from './components/RegisterModal'
import Toast from './components/Toast'
import ForgotPasswordModal from './components/ForgotPasswordModal'
import ChatAgent from './components/ChatAgent'
import SearchOverlay from './components/SearchOverlay'

// Lazy load pages para optimizar el bundle inicial
const Home = lazy(() => import('./pages/HomeNew'))
const Dashboard = lazy(() => import('./pages/DashboardNew'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const ContenidoPage = lazy(() => import('./pages/Admin/ContenidoPage'))
const AnalyticsPage = lazy(() => import('./pages/Admin/AnalyticsPage'))
const Biblioteca = lazy(() => import('./pages/BibliotecaNew'))
const Audiobooks = lazy(() => import('./pages/AudiobooksNew'))
const Novedades = lazy(() => import('./pages/NovedadesNew'))
const MiLista = lazy(() => import('./pages/MiListaNew'))
const Perfil = lazy(() => import('./pages/PerfilNew'))
const Configuracion = lazy(() => import('./pages/ConfiguracionNew'))
const Premium = lazy(() => import('./pages/Premium'))
const PaymentCheckout = lazy(() => import('./pages/PaymentCheckout'))
const PaymentSuccess = lazy(() => import('./components/payment/PaymentSuccess'))
const Buscar = lazy(() => import('./pages/Buscar'))
const NuestraHistoria = lazy(() => import('./pages/NuestraHistoria'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ReaderPage = lazy(() => import('./pages/ReaderPage'))

// Fallback Loading Component optimizado
const PageLoader = () => (
    <div className="loading-screen" style={{ minHeight: '400px' }}>Cargando...</div>
)

function App() {
    const { loading, login, register, logout, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    // UI Local State
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [toasts, setToasts] = useState([])
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Determinar si es una página con layout standalone (sin el Header/Footer de la App principal)
    const isStandalonePage = location.pathname === '/nuestra-historia'
    const isAdminPage = ['/dashboard', '/usuarios', '/contenido', '/analytics'].some(p => location.pathname.startsWith(p))

    // Manejo de eventos de navegación para abrir login
    useEffect(() => {
        // No abrir el modal si acabamos de hacer logout
        if (location.state?.openLogin && !isLoggingOut) {
            const timer = setTimeout(() => {
                setShowLoginModal(true)
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [location, isLoggingOut])

    // Efecto Scroll header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Toast Management
    const toastIdRef = useRef(0)

    const addToast = (message, type = 'info') => {
        const id = ++toastIdRef.current
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => removeToast(id), 3000)
    }

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    // Auth Wrappers para conectar con el Modal y los Toasts
    const handleLogin = async (email, password) => {
        try {
            const response = await login(email, password)
            setShowLoginModal(false)
            const userName = response?.user?.name || 'Usuario'
            addToast(`¡Bienvenido ${userName}!`, 'success')
        } catch (error) {
            console.error(error)
            addToast(error.response?.data?.message || 'Error al iniciar sesión', 'error')
            throw error // Re-lanzar para que el modal maneje loading
        }
    }

    const handleRegister = async (data) => {
        try {
            const response = await register(data)
            setShowRegisterModal(false)
            const userName = response?.user?.name || 'Usuario'
            addToast(`¡Bienvenido ${userName}!`, 'success')
        } catch (error) {
            addToast(error.response?.data?.message || 'Error al registrarse', 'error')
            throw error
        }
    }

    const handleLogout = async () => {
        const userName = user?.name || 'Usuario'
        setIsLoggingOut(true)
        await logout()
        // Cerrar todos los modales
        setShowLoginModal(false)
        setShowRegisterModal(false)
        setShowForgotPasswordModal(false)
        // Redirigir a home sin abrir login
        navigate('/', { replace: true, state: {} })
        addToast(`${userName} ha cerrado sesión`, 'info')
        // Reset del flag después de un momento
        setTimeout(() => setIsLoggingOut(false), 500)
    }

    if (loading) {
        return <div className="loading-screen">Cargando BookHeaven...</div>
    }

    return (
        <div className="app">
            {!isStandalonePage && (
                <Header
                    isScrolled={isScrolled}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    onOpenLogin={() => setShowLoginModal(true)}
                    onOpenRegister={() => setShowRegisterModal(true)}
                    onOpenSearch={() => {
                        setIsSearchOpen(true)
                        setIsMobileMenuOpen(false)
                    }}
                    onLogout={handleLogout}
                />
            )}

            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/" element={<Home onOpenLogin={() => setShowLoginModal(true)} addToast={addToast} />} />
                    <Route path="/premium" element={<Premium addToast={addToast} />} />
                    <Route path="/payment/checkout" element={<PaymentCheckout addToast={addToast} />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/novedades" element={<Novedades addToast={addToast} />} />
                    <Route path="/buscar" element={<Buscar />} />
                    <Route path="/nuestra-historia" element={<NuestraHistoria />} />
                    <Route path="/reset-password" element={<ResetPasswordPage addToast={addToast} />} />
                    <Route path="/reader/:type/:id" element={<ReaderPage />} />

                    {/* Rutas Protegidas - Usuario Autenticado */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/biblioteca" element={<Biblioteca addToast={addToast} />} />
                        <Route path="/audiolibros" element={<Audiobooks addToast={addToast} />} />
                        <Route path="/mi-lista" element={<MiLista addToast={addToast} />} />
                        <Route path="/perfil" element={<Perfil addToast={addToast} />} />
                        <Route path="/configuracion" element={<Configuracion addToast={addToast} />} />
                    </Route>

                    {/* Rutas Protegidas - Solo Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/dashboard" element={<Dashboard addToast={addToast} />} />
                        <Route path="/usuarios" element={<UsersPage />} />
                        <Route path="/contenido" element={<ContenidoPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                    </Route>
                </Routes>
            </Suspense>

            {!isStandalonePage && !isAdminPage && <Footer />}

            {/* Modales */}
            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLogin}
                onError={(msg) => addToast(msg, 'error')}
                onOpenRegister={() => {
                    setShowLoginModal(false)
                    setShowRegisterModal(true)
                }}
                onOpenForgotPassword={() => {
                    setShowLoginModal(false)
                    setShowForgotPasswordModal(true)
                }}
                loginFunction={handleLogin}
            />

            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onRegisterSuccess={handleRegister}
                onError={(msg) => addToast(msg, 'error')}
                onOpenLogin={() => {
                    setShowRegisterModal(false)
                    setShowLoginModal(true)
                }}
                registerFunction={handleRegister}
            />

            <ForgotPasswordModal
                isOpen={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
                onOpenLogin={() => {
                    setShowForgotPasswordModal(false)
                    setShowLoginModal(true)
                }}
                addToast={addToast}
            />

            {/* Toasts */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {/* AI Assistant */}
            <ChatAgent />
        </div>
    )
}

export default App