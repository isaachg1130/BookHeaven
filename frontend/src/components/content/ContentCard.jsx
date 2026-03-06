// src/components/content/ContentCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';

export const ContentCard = ({ item, type = 'libro' }) => {
    const { user } = useAuth();
    const isPremium = item.is_premium;
    const canAccess = !isPremium || (user && (user.role?.name === 'admin' || user.role?.name === 'premium'));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Imagen */}
            <div className="relative h-64 bg-gray-200 overflow-hidden">
                {item.imagen ? (
                    <img
                        src={getImageUrl(item.imagen)}
                        alt={item.titulo || item.nombre}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-4xl">
                        📚
                    </div>
                )}

                {isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ PREMIUM
                    </div>
                )}

                {item.tiene_derechos_autor && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                        © Derechos
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4">
                <h3 className="font-bold text-lg line-clamp-2 mb-2">
                    {item.titulo || item.nombre}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.autor}
                </p>

                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {item.genero}
                </p>

                {type === 'audiobook' && item.duracion_segundos && (
                    <p className="text-xs text-gray-500 mb-2">
                        ⏱️ {Math.floor(item.duracion_segundos / 60)} min
                    </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-yellow-500">👁️ {item.popularidad || 0}</span>
                </div>

                {/* Botón de acceso */}
                {canAccess ? (
                    <Link
                        to={`/${type}/${item.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold text-center transition-colors"
                    >
                        Ver Detalles
                    </Link>
                ) : (
                    <button
                        disabled
                        className="w-full bg-gray-400 text-gray-700 py-2 rounded font-semibold cursor-not-allowed"
                    >
                        Solo Premium
                    </button>
                )}
            </div>
        </div>
    );
};
