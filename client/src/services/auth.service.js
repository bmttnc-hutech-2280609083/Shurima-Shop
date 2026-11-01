import apiClient from '../lib/apiClient'

/**
 * Đăng nhập
 * POST /api/auth/login
 */
export const login = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', { email, password })
  return response.data
}

/**
 * Đăng ký tài khoản
 * POST /api/auth/register
 */
export const register = async (data) => {
  const response = await apiClient.post('/auth/register', data)
  return response.data
}

/**
 * Cập nhật thông tin profile
 * PUT /api/users/profile
 */
export const updateProfile = async (data) => {
  const response = await apiClient.put('/users/profile', data)
  return response.data
}
