import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, CircleAlert, LoaderCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import apiClient from '../../lib/apiClient'

export default function CheckoutResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const resultCode = Number(searchParams.get('resultCode'))
  const message = searchParams.get('message') || ''
  const internalOrderId = searchParams.get('orderId')

  useEffect(() => {
    const fetchPayment = async () => {
      if (!internalOrderId) {
        setIsLoading(false)
        return
      }

      try {
        const res = await apiClient.get(`/payments/order/${internalOrderId}`)
        setPaymentInfo(res.data?.data || null)
      } catch {
        setPaymentInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayment()
  }, [internalOrderId])

  const isSuccess = resultCode === 0 || paymentInfo?.status === 'paid'

  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-sm rounded-3xl p-8 md:p-10 text-center space-y-6">
        {isLoading ? (
          <>
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <LoaderCircle className="h-10 w-10 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold">Đang kiểm tra trạng thái đơn hàng</h1>
              <p className="text-muted-foreground">Vui lòng đợi trong giây lát...</p>
            </div>
          </>
        ) : (
          <>
            <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isSuccess ? <CheckCircle className="h-10 w-10" /> : <CircleAlert className="h-10 w-10" />}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold">
                {isSuccess ? 'Đặt hàng thành công' : 'Đặt hàng chưa hoàn tất'}
              </h1>
              <p className="text-muted-foreground">
                {isSuccess
                  ? 'Đơn hàng của bạn đã được ghi nhận. Bạn có thể kiểm tra trạng thái chi tiết trong mục đơn hàng.'
                  : (message || 'Giao dịch đã bị hủy hoặc chưa được xác nhận bởi hệ thống.')}
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50/60 p-5 text-left space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Mã đơn hàng nội bộ</span>
                <span className="font-medium break-all text-right">{internalOrderId || '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Trạng thái payment</span>
                <span className="font-medium text-right">{paymentInfo?.status || (isSuccess ? 'paid' : 'pending')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Phương thức</span>
                <span className="font-medium text-right">{paymentInfo?.method || 'cod'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={() => navigate('/orders')} className="rounded-full px-8">
                Xem đơn hàng
              </Button>
              <Button variant="outline" onClick={() => navigate('/checkout')} className="rounded-full px-8">
                Quay lại thanh toán
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')} className="rounded-full px-8">
                Về trang chủ
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
