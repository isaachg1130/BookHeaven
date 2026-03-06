import React from 'react'
import '../../styles/SkeletonLoaders.css'

/**
 * StatCardSkeleton - Skeleton para tarjetas estadísticas
 * Simula: número grande + label text
 */
export const StatCardSkeleton = () => (
    <div className="stat-card-skeleton">
        <div className="skeleton-number"></div>
        <div className="skeleton-label"></div>
    </div>
)

/**
 * ChartSkeleton - Skeleton para gráficas
 * Simula: área rectangular con animación pulse
 */
export const ChartSkeleton = ({ height = '300px' }) => (
    <div className="chart-skeleton" style={{ height }}>
        <div className="skeleton-bar skeleton-bar-1"></div>
        <div className="skeleton-bar skeleton-bar-2"></div>
        <div className="skeleton-bar skeleton-bar-3"></div>
        <div className="skeleton-bar skeleton-bar-4"></div>
    </div>
)

/**
 * TableSkeleton - Skeleton para tablas
 * Simula: múltiples filas con columnas
 */
export const TableSkeleton = ({ rows = 5 }) => (
    <div className="table-skeleton">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="skeleton-row">
                <div className="skeleton-cell skeleton-cell-1"></div>
                <div className="skeleton-cell skeleton-cell-2"></div>
                <div className="skeleton-cell skeleton-cell-3"></div>
            </div>
        ))}
    </div>
)

/**
 * DashboardSkeleton - Skeleton completo del dashboard
 * Muestra estructura principal mientras carga los datos
 */
export const DashboardSkeleton = () => (
    <div className="dashboard-skeleton">
        {/* Header del dashboard */}
        <div className="skeleton-header">
            <div className="skeleton-title"></div>
        </div>

        {/* Stats Grid */}
        <div className="skeleton-stats-grid">
            {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>

        {/* Charts Grid */}
        <div className="skeleton-charts-grid">
            <div>
                <div className="skeleton-subtitle"></div>
                <ChartSkeleton />
            </div>
            <div>
                <div className="skeleton-subtitle"></div>
                <ChartSkeleton />
            </div>
        </div>

        {/* Recent Items Table */}
        <div className="skeleton-table-section">
            <div className="skeleton-subtitle"></div>
            <TableSkeleton rows={5} />
        </div>
    </div>
)

export default DashboardSkeleton
