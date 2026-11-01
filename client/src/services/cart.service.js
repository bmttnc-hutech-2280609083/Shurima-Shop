import apiClient from '../lib/apiClient'

export const getCart = async () => {
  const response = await apiClient.get('/carts')
  return response.data
}

export const addToCart = async ({ productId, variantId, quantity }) => {
  const response = await apiClient.post('/cart-items', { productId, variantId, quantity })
  return response.data
}

export const updateCartItem = async (itemId, quantity) => {
  const response = await apiClient.put(`/cart-items/${itemId}`, { quantity })
  return response.data
}

export const removeCartItem = async (itemId) => {
  const response = await apiClient.delete(`/cart-items/${itemId}`)
  return response.data
}
