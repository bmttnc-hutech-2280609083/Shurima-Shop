import apiClient from '../lib/apiClient'

/**
 * Lấy tất cả đơn hàng (Admin)
 * GET /api/orders
 */
export const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', { params })
  return response.data
}

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/:id
 */
export const getOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`)
  return response.data
}

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 * PUT /api/orders/:id
 */
export const updateOrder = async (id, data) => {
  const response = await apiClient.put(`/orders/${id}`, data)
  return response.data
}

/**
 * Xóa đơn hàng (Admin)
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (id) => {
  const response = await apiClient.delete(`/orders/${id}`)
  return response.data
}
