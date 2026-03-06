import React from 'react'
import '../styles/SkeletonLoaders.css'

/**
 * Skeleton Loader para filas de libros
 * Mostrado mientras los datos se cargan
 */
export default function SkeletonBookRow({ count = 5 }) {
    return (
        <div className="book-row skeleton-row">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-book-card">
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                        <div className="skeleton-title" />
                        <div className="skeleton-author" />
                        <div className="skeleton-button" />
                    </div>
                </div>
            ))}
        </div>
    )
}
