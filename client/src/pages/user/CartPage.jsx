import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, PackageX } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80'

const getProductImage = (product) => {
  if (!product) return PLACEHOLDER_IMG
  return product.images?.[0] || product.image || PLACEHOLDER_IMG
}

export default function CartPage() {
  const { user } = useAuth()
  const { items, totalItems, totalPrice, updateItem, removeItem, isLoading } = useCart()
  const navigate = useNavigate()
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const getItemPrice = (item) => {
    const variantPrice = item.variant?.price
    const productPrice = item.product?.price
    const itemPrice = item.price
    if (typeof variantPrice === 'number') return variantPrice
    if (typeof productPrice === 'number') return productPrice
    if (typeof itemPrice === 'number') return itemPrice
    return 0
  }

  const handleUpdate = async (itemId, newQty) => {
    setUpdatingId(itemId)
    try {
      if (newQty < 1) {
        await handleRemove(itemId)
      } else {
        await updateItem(itemId, newQty)
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId)
    try {
      await removeItem(itemId)
      showToast('Đã xóa sản phẩm khỏi giỏ hàng')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-5" />
        <h2 className="text-2xl font-bold mb-3">Bạn chưa đăng nhập</h2>
        <p className="text-muted-foreground mb-8">Đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/login')} className="rounded-full px-8">Đăng nhập</Button>
          <Button variant="outline" onClick={() => navigate('/register')} className="rounded-full px-8">Đăng ký</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <p className="text-muted-foreground">Đang tải giỏ hàng...</p>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <PackageX className="h-14 w-14 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mb-8">Hãy thêm những sản phẩm bạn yêu thích vào giỏ!</p>
        <Button size="lg" onClick={() => navigate('/products')} className="rounded-full px-10">
          Khám phá sản phẩm
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold">
            Giỏ hàng <span className="text-lg text-muted-foreground font-normal">({totalItems} sản phẩm)</span>
          </h1>
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')} className="text-muted-foreground">
            ← Tiếp tục mua sắm
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product || {}
              const price = getItemPrice(item)
              const itemTotal = price * (item.quantity || 1)
              const isUpdating = updatingId === item._id

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl p-5 flex gap-5 items-start shadow-sm border transition-opacity ${isUpdating ? 'opacity-60' : 'opacity-100'}`}
                >
                  {/* Product Image */}
                  <Link to={`/products/${product._id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0 block">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product._id}`} className="font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {product.name || '—'}
                    </Link>
                    {product.category && (
                      <span className="text-xs text-muted-foreground mt-1 block">{product.category?.name || ''}</span>
                    )}
                    <p className="text-primary font-bold mt-2 text-base">{price.toLocaleString('vi-VN')}đ</p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleUpdate(item._id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-50 text-muted-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdate(item._id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-50 text-muted-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> Xóa
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base text-foreground">{itemTotal.toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-muted-foreground mt-1">{price.toLocaleString('vi-VN')} × {item.quantity}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border sticky top-24">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Giảm giá</span>
                  <span>0đ</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-base">Tổng cộng</span>
                  <span className="font-extrabold text-2xl text-primary">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-13 rounded-xl text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={() => navigate('/checkout')}
              >
                Tiến hành thanh toán <ArrowRight className="h-5 w-5" />
              </Button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>🔒</span>
                  <span>Thanh toán bảo mật SSL</span>
                </div>
                <div className="flex items-center justify-center gap-4 pt-1">
                  {['💵 COD'].map(m => (
                    <span key={m} className="text-xs text-muted-foreground">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
