import apiClient from './client'

export const reviewAPI = {
    getReviews: (contentType, contentId, page = 1) => {
        return apiClient.get('/reviews', {
            params: {
                content_type: contentType,
                content_id: contentId,
                page,
            }
        })
    },

    createReview: (data) => {
        return apiClient.post('/reviews', data)
    },

    deleteReview: (reviewId) => {
        return apiClient.delete(`/reviews/${reviewId}`)
    }
}
