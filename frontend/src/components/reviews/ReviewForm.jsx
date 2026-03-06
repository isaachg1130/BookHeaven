import React, { useState } from 'react'
import { reviewAPI } from '../../api/reviews'

const ReviewForm = ({ contentType, contentId, onReviewAdded }) => {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data } = await reviewAPI.createReview({
                content_type: contentType,
                content_id: contentId,
                rating,
                comment,
            })
            setComment('')
            setRating(5)
            onReviewAdded(data.review)
        } catch (err) {
            console.error('Error submitting review:', err)
            if (err.response?.status === 409) {
                setError('Ya has enviado una reseña para este contenido.')
            } else {
                setError('Error al enviar la reseña. Inténtalo de nuevo.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <h4>Escribe tu reseña</h4>

            <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                    >
                        ★
                    </button>
                ))}
            </div>

            <textarea
                className="review-textarea"
                placeholder="¿Qué te pareció este título? Comparte tu opinión..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            />

            {error && <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</div>}

            <button
                type="submit"
                className="btn-submit-review"
                disabled={loading}
            >
                {loading ? 'Enviando...' : 'Publicar Reseña'}
            </button>
        </form>
    )
}

export default ReviewForm
