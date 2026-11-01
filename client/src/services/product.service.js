import apiClient from '../lib/apiClient'

/**
 * Lấy danh sách tất cả sản phẩm (có filter, sort, pagination)
 * - GET /api/products
 * @param {object} params - { page, limit, search, category, sort }
 */
export const getAllProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params })
  return response.data
}

/**
 * Lấy thông tin chi tiết một sản phẩm
 * - GET /api/products/:id
 */
export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`)
  return response.data
}

/**
 * Tạo sản phẩm mới (Admin)
 * - POST /api/products
 */
export const createProduct = async (data) => {
  const response = await apiClient.post('/products', data)
  return response.data
}

/**
 * Cập nhật sản phẩm (Admin)
 * - PUT /api/products/:id
 */
export const updateProduct = async (id, data) => {
  const response = await apiClient.put(`/products/${id}`, data)
  return response.data
}

/**
 * Xóa mềm sản phẩm (Admin)
 * - DELETE /api/products/:id
 */
export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`)
  return response.data
}
