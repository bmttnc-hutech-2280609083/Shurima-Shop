import apiClient from '../lib/apiClient'

export const getAllReviews = async () => {
  const response = await apiClient.get('/reviews')
  return response.data
}

export const updateReview = async (id, data) => {
  const response = await apiClient.put(`/reviews/${id}`, data)
  return response.data
}

export const deleteReview = async (id) => {
  const response = await apiClient.delete(`/reviews/${id}`)
  return response.data
}