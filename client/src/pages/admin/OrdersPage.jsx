import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { getAllOrders, updateOrder, deleteOrder } from '../../services/order.service'

const STATUS_CONFIG = {
  pending:  { label: 'Chờ xử lý',  className: 'bg-amber-100 text-amber-800 border-amber-200' },
  shipping: { label: 'Đang giao',  className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  completed:{ label: 'Hoàn thành', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled:{ label: 'Đã hủy',     className: 'bg-red-100 text-red-800 border-red-200' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllOrders({ limit: 50 })
      setOrders(data.data || [])
    } catch (err) {
      console.error('[OrdersPage Error] Lỗi tải đơn hàng:', err)
      setError(err.response?.data?.message || 'Không thể tải đơn hàng.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrder(id, { status: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      )
      showToast('Cập nhật trạng thái thành công!')
    } catch (err) {
      console.error('[OrdersPage Error] Lỗi cập nhật trạng thái đơn hàng:', err)
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái đơn hàng!'
      showToast(msg, 'error')
    }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      await deleteOrder(orderId)
      showToast('Đã xóa đơn hàng!')
      setOrders((prev) => prev.filter((o) => o._id !== orderId))
    } catch (err) {
      console.error('[OrdersPage Error] Lỗi xóa đơn hàng:', err)
      const msg = err.response?.data?.message || err.message || 'Không thể xóa đơn hàng!'
      showToast(msg, 'error')
    }
  }

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || { label: status, className: '' }
    return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đơn hàng</h2>
          <p className="text-sm text-slate-500">Quản lý và theo dõi trạng thái các đơn đặt hàng.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders} title="Làm mới">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-slate-500">Đang tải đơn hàng...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Chưa có đơn hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium text-primary">
                      #{order._id?.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {order.user?.name || order.user?.email || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {(order.totalPrice || 0).toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 text-muted-foreground bg-background cursor-pointer"
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-destructive"
                          onClick={() => handleDelete(order._id)}
                          title="Xóa đơn hàng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
