import apiClient from '../lib/apiClient'

export const getAllDiscounts = async () => {
  const response = await apiClient.get('/discounts')
  return response.data
}

export const getAvailableDiscounts = async () => {
  try {
    const response = await apiClient.get('/discounts/available')
    return response.data
  } catch {
    const response = await apiClient.get('/discounts/public/active')
    return response.data
  }
}

export const getPublicActiveDiscounts = async () => {
  const response = await apiClient.get('/discounts/public/active')
  return response.data
}

export const createDiscount = async (data) => {
  const response = await apiClient.post('/discounts', data)
  return response.data
}

export const updateDiscount = async (id, data) => {
  const response = await apiClient.put(`/discounts/${id}`, data)
  return response.data
}

export const setDiscountPublicStatus = async (id, isPublic) => {
  const response = await apiClient.patch(`/discounts/${id}/public`, { isPublic })
  return response.data
}

export const deleteDiscount = async (id) => {
  const response = await apiClient.delete(`/discounts/${id}`)
  return response.data
}

export const checkDiscountByCode = async (code, orderAmount) => {
  const response = await apiClient.get(`/discounts/check/${encodeURIComponent(code)}`, {
    params: { orderAmount },
  })
  return response.data
}

export const applyDiscountToOrder = async (orderId, code) => {
  const response = await apiClient.post('/discounts/apply', { orderId, code })
  return response.data
}
