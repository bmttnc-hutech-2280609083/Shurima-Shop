import apiClient from '../lib/apiClient'

/**
 * Lấy danh sách Categories (public)
 * GET /api/categories
 */
export const getAllCategories = async () => {
  const response = await apiClient.get('/categories')
  return response.data
}

export const createCategory = async (data) => {
  const response = await apiClient.post('/categories', data)
  return response.data
}

export const updateCategory = async (id, data) => {
  const response = await apiClient.put(`/categories/${id}`, data)
  return response.data
}

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`)
  return response.data
}

/**
 * Lấy tất cả users (Admin)
 * GET /api/users
 */
export const getAllUsers = async (params = {}) => {
  const response = await apiClient.get('/users', { params })
  return response.data
}

export const createUser = async (data) => {
  const response = await apiClient.post('/users', data)
  return response.data
}

export const updateUser = async (id, data) => {
  const response = await apiClient.put(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`)
  return response.data
}
