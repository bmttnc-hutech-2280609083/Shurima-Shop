import apiClient from '../lib/apiClient'

export const getAllPayments = async () => {
  const response = await apiClient.get('/payments')
  return response.data
}

export const updatePaymentStatus = async (paymentId, status) => {
  const response = await apiClient.patch(`/payments/${paymentId}`, { status })
  return response.data
}

export const getPaymentByOrderId = async (orderId) => {
  const response = await apiClient.get(`/payments/order/${orderId}`)
  return response.data
}
