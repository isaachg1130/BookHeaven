// src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
            return;
        }
        fetchStats();
    }, [isAdmin, navigate]);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Cargando dashboard...</div>;
    }

    if (!stats) {
        return <div className="text-center py-12">Error al cargar estadísticas</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">⚙️ Panel Administrativo</h1>

                {/* Estadísticas principales */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="text-3xl font-bold text-blue-600">
                            {stats.stats.total_users}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Usuarios totales</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="text-3xl font-bold text-green-600">
                            {stats.stats.total_premium_users}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Usuarios Premium</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="text-3xl font-bold text-purple-600">
                            {stats.stats.total_libros + stats.stats.total_audiobooks}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Contenido total</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="text-3xl font-bold text-yellow-600">
                            ${stats.stats.total_revenue?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Ingresos totales</div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Usuarios */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h2 className="text-2xl font-bold mb-4">👥 Usuarios</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Admins:</span>
                                <span className="font-bold">{stats.stats.total_admins}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Premium:</span>
                                <span className="font-bold">{stats.stats.total_premium_users}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estándar:</span>
                                <span className="font-bold">{stats.stats.total_standard_users}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h2 className="text-2xl font-bold mb-4">📚 Contenido</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Libros:</span>
                                <span className="font-bold">{stats.stats.total_libros}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Audiolibros:</span>
                                <span className="font-bold">{stats.stats.total_audiobooks}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Premium:</span>
                                <span className="font-bold">{stats.stats.total_premium_content}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingresos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mt-8">
                    <h2 className="text-2xl font-bold mb-4">💰 Ingresos Este Mes</h2>
                    <div className="text-4xl font-bold text-green-600">
                        ${stats.stats.monthly_revenue?.toFixed(2) || '0.00'}
                    </div>
                </div>
            </div>
        </div>
    );
};
