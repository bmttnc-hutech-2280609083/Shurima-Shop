import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, AlertCircle, RefreshCw, MapPin, CalendarDays } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { getAllOrders } from '../../services/order.service'
import { useAuth } from '../../context/AuthContext'

const STATUS_CONFIG = {
  pending:  { label: 'Chờ xử lý',   className: 'bg-amber-100 text-amber-700' },
  shipping: { label: 'Đang giao',   className: 'bg-indigo-100 text-indigo-700' },
  completed:{ label: 'Hoàn thành',  className: 'bg-green-100 text-green-700' },
  cancelled:{ label: 'Đã hủy',      className: 'bg-red-100 text-red-700' },
}

const getProductImage = (product) => {
  if (!product) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=60'
  return product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=60'
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

export default function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getAllOrders()
      setOrders(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải đơn hàng.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchOrders()
  }, [user, navigate])

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold">Đơn hàng của tôi</h1>
        <Button variant="outline" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ xử lý' },
          { key: 'shipping', label: 'Đang giao' },
          { key: 'completed', label: 'Hoàn thành' },
          { key: 'cancelled', label: 'Đã hủy' },
        ].map((item) => (
          <Button
            key={item.key}
            type="button"
            size="sm"
            variant={statusFilter === item.key ? 'default' : 'outline'}
            onClick={() => setStatusFilter(item.key)}
            className="rounded-full"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="text-center py-24">
          <Package className="h-16 w-16 mx-auto text-muted mb-4" />
          <h2 className="text-xl font-bold mb-2">Không có đơn hàng phù hợp</h2>
          <p className="text-muted-foreground mb-8">Thử đổi bộ lọc hoặc bắt đầu mua sắm để tạo đơn mới.</p>
          <Button size="lg" onClick={() => navigate('/products')} className="rounded-full px-10">
            Khám phá sản phẩm
          </Button>
        </div>
      )}

      {!isLoading && !error && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || { label: order.status, className: '' }
            const displayTotal = Number(order.finalPrice || order.totalPrice || 0)
            return (
              <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <p className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="inline-flex items-center gap-1 break-all">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.address || 'Chưa có địa chỉ giao hàng'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${cfg.className} font-medium text-xs px-3 py-1`}>{cfg.label}</Badge>
                </div>

                {(order.items || []).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-t first:border-t-0">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product?.name || 'Sản phẩm'}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{getItemPrice(item)}.đ</p>
                  </div>
                ))}
                {(order.items || []).length > 2 && (
                  <p className="text-xs text-muted-foreground pt-2 border-t">+{order.items.length - 2} sản phẩm khác</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Tổng tiền</span>
                  <span className="font-bold text-primary text-lg">{displayTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
