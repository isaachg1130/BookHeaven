// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Validación de email
    const validateEmail = (emailValue) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            return 'Por favor ingresa un correo electrónico válido';
        }
        return '';
    };

    // Validación de contraseña
    const validatePassword = (passwordValue) => {
        if (passwordValue.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }
        return '';
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setError(''); // Limpiar error de autenticación cuando el usuario edita

        if (value) {
            setEmailError(validateEmail(value));
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setError(''); // Limpiar error de autenticación cuando el usuario edita

        if (value) {
            setPasswordError(validatePassword(value));
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setEmailError('');
        setPasswordError('');

        // Validación final del email
        const finalEmailError = validateEmail(email);
        if (finalEmailError) {
            setEmailError(finalEmailError);
            setError(finalEmailError);
            return;
        }

        // Validación final de la contraseña
        const finalPasswordError = validatePassword(password);
        if (finalPasswordError) {
            setPasswordError(finalPasswordError);
            setError(finalPasswordError);
            return;
        }

        setLoading(true);

        try {
            await login(email, password);
            // Limpiar datos solo en caso de éxito
            setEmail('');
            setPassword('');
            navigate('/');
        } catch (err) {
            // IMPORTANTE: No limpiamos email ni password para que el usuario vea sus datos
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert" aria-live="polite">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    setEmailError(validateEmail(e.target.value));
                                }
                            }}
                            aria-required="true"
                            aria-invalid={!!emailError}
                            aria-describedby={emailError ? "email-error" : undefined}
                            className={`w-full px-4 py-2 border ${
                                emailError
                                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                    : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700`}
                            required
                            disabled={loading}
                        />
                        {emailError && (
                            <p id="email-error" className="text-red-600 text-sm mt-1">
                                ✗ {emailError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    setPasswordError(validatePassword(e.target.value));
                                }
                            }}
                            aria-required="true"
                            aria-invalid={!!passwordError}
                            aria-describedby={passwordError ? "password-error" : undefined}
                            minLength="6"
                            className={`w-full px-4 py-2 border ${
                                passwordError
                                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                    : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700`}
                            required
                            disabled={loading}
                        />
                        {passwordError && (
                            <p id="password-error" className="text-red-600 text-sm mt-1">
                                ✗ {passwordError}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!emailError || !email || !!passwordError || !password}
                        aria-busy={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
