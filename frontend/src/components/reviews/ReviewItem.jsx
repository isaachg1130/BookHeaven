import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { reviewAPI } from '../../api/reviews'
import DeleteReviewModal from './DeleteReviewModal'

const ReviewItem = ({ review, onDelete }) => {
    const { user } = useAuth()
    const isOwner = user && review.user_id === user.id
    const isAdmin = user && user.role === 'admin'
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = () => {
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        setIsDeleting(true)
        try {
            await reviewAPI.deleteReview(review.id)
            setShowDeleteModal(false)
            onDelete(review.id)
        } catch (error) {
            console.error('Error deleting review:', error)
            setIsDeleting(false)
        }
    }

    const handleDeleteCancel = () => {
        setShowDeleteModal(false)
        setIsDeleting(false)
    }

    return (
        <>
            <div className="review-item">
                <div className="review-header">
                    <div className="reviewer-info">
                        {review.user?.profile_photo_path ? (
                            <img
                                src={`http://localhost:8000/api/user/profile-photo/${review.user.id}`}
                                alt={review.user.name}
                                className="reviewer-avatar"
                            />
                        ) : (
                            <div className="reviewer-avatar">
                                {review.user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <span className="reviewer-name">{review.user?.name || 'Usuario'}</span>
                            <span className="review-date">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {(isOwner || isAdmin) && (
                        <button 
                            onClick={handleDeleteClick} 
                            className="btn-delete-review" 
                            title="Eliminar reseña"
                            disabled={isDeleting}
                        >
                            🗑️
                        </button>
                    )}
                </div>
                <div className="review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                </div>
                <p className="review-content">{review.comment}</p>
            </div>

            <DeleteReviewModal 
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
            />
        </>
    )
}

export default ReviewItem
