import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
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
import { getAllPayments, updatePaymentStatus } from '../../services/payment.service'

const STATUS_CONFIG = {
  pending:   { label: 'Chờ xử lý',     className: 'bg-amber-100 text-amber-800 border-amber-200' },
  paid:      { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800 border-green-200' },
  shipping:  { label: 'Đang giao',     className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  completed: { label: 'Hoàn thành',    className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed:    { label: 'Thất bại',      className: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Đã hủy',        className: 'bg-slate-100 text-slate-700 border-slate-200' },
}

const normalizeStatusKey = (status) => {
  if (!status) return 'pending'
  const s = String(status).toLowerCase()
  if (s === 'complete') return 'completed'
  if (s === 'paid') return 'paid'
  return s
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllPayments()
      setPayments(data.data || [])
    } catch (err) {
      console.error('[PaymentsPage Error] Lỗi tải thanh toán:', err)
      setError(err.response?.data?.message || 'Không thể tải danh sách thanh toán.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleStatusChange = async (id, newStatus) => {
    try {
      const normalizedStatus = normalizeStatusKey(newStatus)
      await updatePaymentStatus(id, normalizedStatus)
      setPayments((prev) => prev.map((p) => (p._id === id ? { ...p, status: normalizedStatus } : p)))
      showToast('Cập nhật trạng thái thanh toán thành công!')
    } catch (err) {
      console.error('[PaymentsPage Error] Lỗi cập nhật trạng thái thanh toán:', err)
      const msg = err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái thanh toán!'
      showToast(msg, 'error')
    }
  }

  const getStatusBadge = (status) => {
    const key = normalizeStatusKey(status)
    const cfg = STATUS_CONFIG[key] || { label: status, className: 'bg-gray-100 text-gray-800' }
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
          <h2 className="text-2xl font-bold text-slate-800">Thanh toán</h2>
          <p className="text-sm text-slate-500">Quản lý trạng thái thanh toán đơn hàng.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPayments} title="Làm mới">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-slate-500">Đang tải danh sách thanh toán...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchPayments} className="ml-auto">
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Mã thanh toán</TableHead>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Chưa có dữ liệu thanh toán.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const currentStatus = normalizeStatusKey(payment.status)
                  return (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium text-primary">
                        #{payment._id?.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        #{payment.order?._id?.slice(-8).toUpperCase() || '—'}
                      </TableCell>
                      <TableCell className="uppercase">{payment.method || '—'}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 text-muted-foreground bg-background cursor-pointer"
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
