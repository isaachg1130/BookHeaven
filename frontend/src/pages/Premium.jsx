// src/pages/Premium.jsx
import React from 'react';
import { PricingPlans } from '../components/payment/PricingPlans';
import { useAuth } from '../context/AuthContext';

const Premium = () => {
    const { user, isPremium } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-600 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">⭐ Planes Premium</h1>
                    <p className="text-xl text-white/90">
                        Acceso ilimitado a todo nuestro contenido
                    </p>
                </div>

                {isPremium() && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded-lg mb-8 text-center">
                        ✓ Ya eres miembro Premium. Tu suscripción expira el{' '}
                        {user?.premium_expires_at && new Date(user.premium_expires_at).toLocaleDateString()}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl">
                    <PricingPlans />
                </div>

                <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
                    <h2 className="text-2xl font-bold mb-6">✨ ¿Qué incluye Premium?</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-3">
                            <span className="text-2xl">📚</span>
                            <div>
                                <h3 className="font-bold">Acceso Ilimitado a Libros</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Lee todos los libros premium sin restricciones
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">🎧</span>
                            <div>
                                <h3 className="font-bold">Audiolibros Premium</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Escucha cientos de audiolibros exclusivos
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">📥</span>
                            <div>
                                <h3 className="font-bold">Descargas Offline</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Descarga contenido para leer sin conexión
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">🚫</span>
                            <div>
                                <h3 className="font-bold">Sin Anuncios</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Disfrutasin interrupciones de anuncios
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Premium;
