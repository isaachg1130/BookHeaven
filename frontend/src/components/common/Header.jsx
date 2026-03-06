// src/components/common/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Header = ({ onOpenLogin, onOpenRegister }) => {
    const { user, logout, isAdmin, isPremium } = useAuth();
    const { isDark, setIsDark } = useTheme();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        if (onOpenLogin) {
            onOpenLogin();
        } else {
            navigate('/');
        }
    };

    const handleRegisterClick = (e) => {
        e.preventDefault();
        if (onOpenRegister) {
            onOpenRegister();
        } else {
            navigate('/');
        }
    };

    return (
        <header className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">📚 BookHeaven</span>
                    </Link>

                    {/* Navegación */}
                    <nav className="hidden md:flex gap-8">
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <Link to="/libros" className="hover:text-blue-600">📚 Libros</Link>
                        <Link to="/audiobooks" className="hover:text-blue-600">🎧 Audiolibros</Link>
                        {user && isPremium() && (
                            <Link to="/premium" className="text-yellow-600 font-semibold">⭐ Premium</Link>
                        )}
                        {isAdmin() && (
                            <Link to="/admin" className="text-red-600 font-semibold">⚙️ Admin</Link>
                        )}
                    </nav>

                    {/* Acciones */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    {user.profile_photo_path ? (
                                        <img
                                            src={`/api/user/profile-photo/${user.profile_photo_path.split('/').pop()}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                                            {user.name.charAt(0)}
                                        </span>
                                    )}
                                    <span>{user.name}</span>
                                </button>

                                {showMenu && (
                                    <div className={`absolute right-0 mt-2 w-48 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg`}>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            👤 Perfil
                                        </Link>
                                        {!isPremium() && !isAdmin() && (
                                            <Link
                                                to="/premium"
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-600"
                                            >
                                                ⭐ Obtener Premium
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleLoginClick}
                                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={handleRegisterClick}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                                >
                                    Registrarse
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
