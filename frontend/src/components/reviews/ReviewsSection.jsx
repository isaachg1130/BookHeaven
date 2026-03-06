import React, { useState, useEffect, useCallback } from 'react'
import { reviewAPI } from '../../api/reviews'
import ReviewItem from './ReviewItem'
import ReviewForm from './ReviewForm'
import { useAuth } from '../../context/AuthContext'
import '../../styles/reviews.css'

const ReviewsSection = ({ contentType, contentId }) => {
    const { user } = useAuth()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ average: 0, total: 0 })
    const [_page, _setPage] = useState(1)
    const [_hasMore, _setHasMore] = useState(true)

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await reviewAPI.getReviews(contentType, contentId, 1)
            setReviews(data.reviews.data)
            setStats({
                average: data.average_rating,
                total: data.total_reviews
            })
            _setHasMore(data.reviews.next_page_url !== null)
        } catch (error) {
            console.error('Error loading reviews:', error)
        } finally {
            setLoading(false)
        }
    }, [contentType, contentId])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    const handleReviewAdded = (newReview) => {
        setReviews(prev => [newReview, ...prev])
        setStats(prev => ({
            ...prev,
            total: prev.total + 1
            // Note: average update would require refetch or complex calc, 
            // for now we just increment total
        }))
    }

    const handleReviewDeleted = (reviewId) => {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        setStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1)
        }))
    }

    return (
        <div className="reviews-section">
            <div className="reviews-header">
                <h3>Reseñas y Opiniones</h3>
                <div className="average-rating">
                    <span className="rating-number">{stats.average || '0.0'}</span>
                    <div className="stars-display">
                        {'★'.repeat(Math.round(stats.average))}
                        {'☆'.repeat(5 - Math.round(stats.average))}
                    </div>
                    <span className="review-count">({stats.total})</span>
                </div>
            </div>

            {user ? (
                <ReviewForm
                    contentType={contentType}
                    contentId={contentId}
                    onReviewAdded={handleReviewAdded}
                />
            ) : (
                <div className="login-prompt">
                    <p>Inicia sesión para dejar tu reseña.</p>
                </div>
            )}

            <div className="reviews-list">
                {reviews.length === 0 && !loading ? (
                    <p className="no-reviews">Sé el primero en opinar sobre este título.</p>
                ) : (
                    reviews.map(review => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onDelete={handleReviewDeleted}
                        />
                    ))
                )}

                {loading && <p>Cargando reseñas...</p>}
            </div>
        </div>
    )
}

export default ReviewsSection
