import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import apiClient from '../lib/apiClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartId, setCartId] = useState(null)
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  // Ref để tránh race condition khi lấy cartId
  const cartIdRef = useRef(null)

  /**
   * Lấy hoặc tạo một Cart cho user hiện tại.
   * Trả về cartId (string).
   */
  const getOrCreateCart = useCallback(async () => {
    if (!user) return null
    if (cartIdRef.current) return cartIdRef.current

    try {
      // Lấy tất cả cart, filter theo user._id
      const res = await apiClient.get('/carts')
      const allCarts = res.data?.data || []
      const myCart = allCarts.find(
        (c) => (typeof c.user === 'object' ? c.user?._id : c.user) === user._id && c.status === 'active'
      )

      if (myCart) {
        cartIdRef.current = myCart._id
        setCartId(myCart._id)
        return myCart._id
      }

      // Tạo cart mới
      const newRes = await apiClient.post('/carts', { user: user._id })
      const newId = newRes.data?.data?._id || newRes.data?._id
      cartIdRef.current = newId
      setCartId(newId)
      return newId
    } catch (err) {
      // 409 = cart đã tồn tại → lấy lại
      if (err.response?.status === 409) {
        const res = await apiClient.get('/carts')
        const allCarts = res.data?.data || []
        const myCart = allCarts.find(
          (c) => (typeof c.user === 'object' ? c.user?._id : c.user) === user._id
        )
        if (myCart) {
          cartIdRef.current = myCart._id
          setCartId(myCart._id)
          return myCart._id
        }
      }
      console.error('[CartContext] getOrCreateCart error:', err.response?.data || err.message)
      return null
    }
  }, [user])

  /**
   * Lấy tất cả cart items của cart hiện tại (filter theo cartId).
   */
  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); cartIdRef.current = null; setCartId(null); return }
    try {
      setIsLoading(true)
      const cId = await getOrCreateCart()
      if (!cId) { setItems([]); return }

      const itemsRes = await apiClient.get('/cart-items')
      const allItems = itemsRes.data?.data || []
      // Chỉ lấy items thuộc cart của user này
      const myItems = allItems.filter(
        (item) => (typeof item.cart === 'object' ? item.cart?._id : item.cart) === cId
      )
      setItems(myItems)
    } catch (err) {
      console.error('[CartContext] fetchCart error:', err.response?.data || err.message)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [user, getOrCreateCart])

  useEffect(() => {
    cartIdRef.current = null
    setCartId(null)
    fetchCart()
  }, [user])

  /**
   * Thêm sản phẩm vào giỏ hàng.
   */
  const addItem = async (productId, quantity = 1) => {
    const cId = await getOrCreateCart()
    if (!cId) throw new Error('Không thể tạo giỏ hàng')

    await apiClient.post('/cart-items', {
      cart: cId,
      product: productId,
      quantity,
    })
    await fetchCart()
  }

  const updateItem = async (itemId, quantity) => {
    await apiClient.put(`/cart-items/${itemId}`, { quantity })
    // Cập nhật local state ngay lập tức (optimistic)
    setItems((prev) => prev.map((i) => i._id === itemId ? { ...i, quantity } : i))
  }

  const removeItem = async (itemId) => {
    await apiClient.delete(`/cart-items/${itemId}`)
    setItems((prev) => prev.filter((i) => i._id !== itemId))
  }

  // Tính tổng từ item.product.price (đã populate)
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const totalPrice = items.reduce((sum, item) => {
    const variantPrice = item.variant?.price
    const productPrice = item.product?.price
    const price = typeof variantPrice === 'number'
      ? variantPrice
      : (typeof productPrice === 'number' ? productPrice : 0)
    return sum + price * (item.quantity || 1)
  }, 0)

  return (
    <CartContext.Provider value={{
      items,
      cartId,
      isLoading,
      totalItems,
      totalPrice,
      addItem,
      updateItem,
      removeItem,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
