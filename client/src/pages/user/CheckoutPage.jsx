import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Phone, User, ShoppingBag, AlertCircle,
  CheckCircle, CreditCard, ChevronRight, Truck,
  Ticket, ChevronDown, Tag, X, Sparkles
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../lib/apiClient'
import { checkDiscountByCode, applyDiscountToOrder, getAvailableDiscounts } from '../../services/discount.service'

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&q=70'

const getProductImage = (product) => {
  if (!product) return PLACEHOLDER_IMG
  return product.images?.[0] || product.image || PLACEHOLDER_IMG
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

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalPrice, fetchCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    note: '',
  })
  
  // State quản lý phương thức thanh toán ('cod' hoặc 'qr')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const [isLoading, setIsLoading] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [discountPreview, setDiscountPreview] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // State danh sách mã giảm giá và dropdown
  const [availableDiscounts, setAvailableDiscounts] = useState([])
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false)
  const [isDiscountDropdownOpen, setIsDiscountDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setIsLoadingDiscounts(true)
        const res = await getAvailableDiscounts()
        setAvailableDiscounts(res.data || [])
      } catch (err) {
        console.error('[CheckoutPage] Lỗi khi tải danh sách mã giảm giá:', err)
      } finally {
        setIsLoadingDiscounts(false)
      }
    }
    fetchDiscounts()
  }, [])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <Button onClick={() => navigate('/login')} className="mt-4">Đăng nhập</Button>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-14 w-14 mx-auto text-muted mb-4" />
        <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mb-6">Thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <Button onClick={() => navigate('/products')}>Mua sắm ngay</Button>
      </div>
    )
  }

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value })

  const handleApplyDiscount = async (codeOverride) => {
    setError(null)
    const code = (typeof codeOverride === 'string' ? codeOverride : discountCode).trim().toUpperCase()
    if (!code) {
      setError('Vui lòng nhập hoặc chọn mã giảm giá.')
      return
    }

    try {
      setIsApplyingDiscount(true)
      setDiscountCode(code)
      const res = await checkDiscountByCode(code, totalPrice)
      setDiscountPreview(res.data)
    } catch (err) {
      setDiscountPreview(null)
      setError(err.response?.data?.message || 'Mã giảm giá không hợp lệ.')
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const shippingFee = 0
  const discountAmount = Number(discountPreview?.discountAmount || 0)
  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.address.trim() || !form.phone.trim()) {
      setError('Vui lòng điền đầy đủ địa chỉ và số điện thoại.')
      return
    }

    setIsLoading(true)
    try {
      const fullAddress = `${form.address}, ${form.city}`.trim().replace(/,$/, '')
      const orderRes = await apiClient.post('/orders', {
        address: fullAddress,
        status: 'pending',
      })

      const orderId = orderRes.data?.data?._id
      if (!orderId) {
        throw new Error('Không thể tạo đơn hàng')
      }

      // Tạo order items tuần tự để dừng ngay khi gặp lỗi stock/validation.
      for (const item of items) {
        await apiClient.post('/order-items', {
          order: orderId,
          product: typeof item.product === 'object' ? item.product?._id : item.product,
          variant: item.variant ? (typeof item.variant === 'object' ? item.variant?._id : item.variant) : null,
          quantity: item.quantity,
        })
      }

      if (discountPreview?.discount?.code) {
        await applyDiscountToOrder(orderId, discountPreview.discount.code)
      }

      // Gửi phương thức thanh toán tương ứng (cod hoặc qr)
      await apiClient.post('/payments', {
        orderId,
        method: paymentMethod,
      })

      await Promise.all(items.map((item) => apiClient.delete(`/cart-items/${item._id}`)))
      await fetchCart()

      setSuccess(true)
    } catch (err) {
      if (err.response?.status === 400) {
        await fetchCart()
      }
      setError(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-5 max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold">Đặt hàng thành công! 🎉</h2>
          <p className="text-muted-foreground">
            Cảm ơn bạn đã mua sắm tại ShurimaShop! Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={() => navigate('/orders')} className="rounded-full px-8">
              Xem đơn hàng
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="rounded-full px-8">
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-8">Thanh toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Shipping Info + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Thông tin giao hàng
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={handleChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0901234567"
                      value={form.phone}
                      onChange={handleChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Địa chỉ *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Số nhà, tên đường, phường/xã..."
                      value={form.address}
                      onChange={handleChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Tỉnh / Thành phố *</Label>
                  <Input
                    id="city"
                    placeholder="TP. Hồ Chí Minh"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                  <Input
                    id="note"
                    placeholder="Ghi chú cho người giao hàng..."
                    value={form.note}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
              </h2>
              
              {/* COD Option */}
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}
              >
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-medium text-sm">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-muted-foreground">Thanh toán bằng tiền mặt khi giao hàng</p>
                </div>
                <div className={`ml-auto h-5 w-5 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary text-primary-foreground' : 'border border-gray-300'}`}>
                  {paymentMethod === 'cod' && <CheckCircle className="h-3 w-3" />}
                </div>
              </div>

              {/* QR Code Option */}
              <div 
                onClick={() => setPaymentMethod('qr')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}
              >
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium text-sm">Chuyển khoản quét mã QR (VietQR)</p>
                  <p className="text-xs text-muted-foreground">Dùng app ngân hàng quét mã để thanh toán ngay</p>
                </div>
                <div className={`ml-auto h-5 w-5 rounded-full flex items-center justify-center ${paymentMethod === 'qr' ? 'bg-primary text-primary-foreground' : 'border border-gray-300'}`}>
                  {paymentMethod === 'qr' && <CheckCircle className="h-3 w-3" />}
                </div>
              </div>

              {/* Hiển thị khung QR tự động tính theo số tiền đơn hàng */}
              {paymentMethod === 'qr' && (
                <div className="p-4 bg-gray-50 rounded-xl border text-center space-y-3 mt-4 animate-fadeIn">
                  <p className="text-sm font-medium text-foreground">Quét mã QR bằng ứng dụng ngân hàng</p>
                  <div className="bg-white p-3 inline-block rounded-xl shadow-sm border mx-auto">
                    <img 
                      src={`https://img.vietqr.io/image/VCB-1028520271-compact2.png?amount=${finalTotal}&addInfo=SHURIMA_ORDER`} 
                      alt="QR Code Thanh Toán" 
                      className="w-44 h-44 object-contain mx-auto"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Ngân hàng: <span className="font-semibold text-foreground">Vietcombank</span></p>
                    <p>STK: <span className="font-semibold text-foreground">1028520271</span></p>
                    <p>Chủ tài khoản: <span className="font-semibold text-foreground">DOAN MINH KHANG</span></p>
                    <p>Số tiền: <span className="font-bold text-primary">{finalTotal.toLocaleString('vi-VN')}đ</span></p>
                    <p>Nội dung chuyển khoản: <span className="font-bold text-foreground">SHURIMA_ORDER_[Mã_Đơn_Hàng]</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Mã giảm giá - Tích hợp dropdown chọn mã của entity Discount */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" /> Mã giảm giá
                </h2>
                {availableDiscounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsDiscountDropdownOpen(!isDiscountDropdownOpen)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <span>{isDiscountDropdownOpen ? 'Đóng danh sách' : `Xem tất cả mã (${availableDiscounts.length})`}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isDiscountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Input và Button Áp dụng */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    onFocus={() => {
                      if (availableDiscounts.length > 0) setIsDiscountDropdownOpen(true)
                    }}
                    placeholder="Nhập hoặc chọn mã giảm giá (VD: SALE10)"
                    className="pr-9"
                  />
                  {availableDiscounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsDiscountDropdownOpen(!isDiscountDropdownOpen)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                      title="Chọn mã từ danh sách"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDiscountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleApplyDiscount()}
                  disabled={isApplyingDiscount}
                >
                  {isApplyingDiscount ? 'Đang áp...' : 'Áp dụng'}
                </Button>
              </div>

              {/* Dropdown danh sách tất cả mã của entity Discount */}
              {isDiscountDropdownOpen && (
                <div className="border rounded-xl p-3 bg-gray-50/80 space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between pb-1 border-b">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Danh sách mã ưu đãi ShurimaShop
                    </p>
                    <span className="text-[11px] text-muted-foreground">{availableDiscounts.length} mã khả dụng</span>
                  </div>

                  {isLoadingDiscounts ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">Đang tải danh sách mã...</p>
                  ) : availableDiscounts.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">Hiện chưa có mã giảm giá nào trong hệ thống.</p>
                  ) : (
                    availableDiscounts.map((disc) => {
                      const isSelected = discountPreview?.discount?.code === disc.code || discountCode === disc.code
                      const meetsMin = totalPrice >= Number(disc.minOrderValue || 0)
                      return (
                        <div
                          key={disc._id || disc.code}
                          onClick={() => {
                            handleApplyDiscount(disc.code)
                            setIsDiscountDropdownOpen(false)
                          }}
                          className={`p-3 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between gap-3 hover:border-primary hover:shadow-sm ${
                            isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-primary tracking-wide">{disc.code}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                {disc.type === 'percent' ? `Giảm ${disc.value}%` : `Giảm ${Number(disc.value).toLocaleString('vi-VN')}đ`}
                              </span>
                              {disc.maxDiscount > 0 && disc.type === 'percent' && (
                                <span className="text-[10px] text-muted-foreground">
                                  (tối đa {Number(disc.maxDiscount).toLocaleString('vi-VN')}đ)
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground font-medium truncate">{disc.name}</p>
                            {disc.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{disc.description}</p>
                            )}
                            {disc.minOrderValue > 0 && (
                              <p className={`text-[11px] ${meetsMin ? 'text-muted-foreground' : 'text-amber-600 font-medium'}`}>
                                Đơn tối thiểu: {Number(disc.minOrderValue).toLocaleString('vi-VN')}đ {meetsMin ? '✓' : '(chưa đủ điều kiện)'}
                              </p>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            className="h-8 text-xs shrink-0 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApplyDiscount(disc.code)
                              setIsDiscountDropdownOpen(false)
                            }}
                          >
                            {isSelected ? 'Đang áp dụng' : 'Chọn mã'}
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Thông báo áp dụng thành công / Thao tác gỡ mã */}
              {discountPreview && (
                <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-200 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <span>
                      Đã áp dụng mã <strong>{discountPreview.discount?.code}</strong>: giảm <strong>{Number(discountPreview.discountAmount || 0).toLocaleString('vi-VN')}đ</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountPreview(null)
                      setDiscountCode('')
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive underline ml-3 shrink-0"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-5">
              <h2 className="text-lg font-bold">Đơn hàng ({items.length} sản phẩm)</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => {
                  const product = item.product || {}
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 leading-snug">{product.name || '—'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold flex-shrink-0">
                        {(getItemPrice(item) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Giảm giá</span>
                  <span className="text-green-600 font-medium">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary text-xl">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-13 rounded-xl text-base bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đặt hàng...' : (
                  <span className="flex items-center gap-2">
                    Đặt hàng ngay <ChevronRight className="h-5 w-5" />
                  </span>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <span className="text-primary cursor-pointer hover:underline">Điều khoản dịch vụ</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
