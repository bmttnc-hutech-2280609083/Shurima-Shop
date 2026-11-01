import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgePercent, Copy, Sparkles, Ticket } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { getPublicActiveDiscounts } from '../../services/discount.service'

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN') + 'đ'

const discountLabel = (discount) => {
  if (discount.type === 'percent') {
    return `Giảm ${discount.value}%`
  }
  return `Giảm ${formatCurrency(discount.value)}`
}

export default function SaleHuntPage() {
  const navigate = useNavigate()
  const [discounts, setDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await getPublicActiveDiscounts()
        setDiscounts(res.data || [])
      } catch {
        setDiscounts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscounts()
  }, [])

  const availableCount = useMemo(() => discounts.length, [discounts])

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 1500)
    } catch {
      setCopiedCode(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 md:p-8 mb-8 border border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
              <Sparkles className="h-4 w-4" />
              Khu vực săn sale
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Mã giảm giá đang phát hành</h1>
            <p className="text-muted-foreground mt-2">
              Chọn mã phù hợp, sao chép và dán vào bước thanh toán.
            </p>
          </div>
          <Badge className="w-fit text-sm px-4 py-2 bg-primary text-primary-foreground">
            {availableCount} mã khả dụng
          </Badge>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-52 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && discounts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <Ticket className="h-14 w-14 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-2xl font-bold mb-2">Hiện chưa có mã phát hành</h2>
          <p className="text-muted-foreground mb-6">Bạn quay lại sau để săn mã mới nhé.</p>
          <Button onClick={() => navigate('/products')}>Xem sản phẩm</Button>
        </div>
      )}

      {!isLoading && discounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {discounts.map((discount) => {
            const now = new Date()
            const isUpcoming = discount.startDate ? new Date(discount.startDate) > now : false
            const remain =
              discount.usageLimit === null || discount.usageLimit === undefined
                ? null
                : Math.max(0, Number(discount.usageLimit) - Number(discount.usedCount || 0))

            return (
              <Card key={discount._id} className="border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg leading-snug">{discount.name}</CardTitle>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      <BadgePercent className="h-3.5 w-3.5 mr-1" />
                      {discountLabel(discount)}
                    </Badge>
                  </div>
                  <div>
                    <Badge className={isUpcoming ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                      {isUpcoming ? 'Sắp mở' : 'Đang mở'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {discount.description || 'Mã giảm giá áp dụng cho đơn hàng đủ điều kiện.'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-dashed border-primary/40 p-3 flex items-center justify-between gap-3 bg-primary/5">
                    <span className="font-mono text-sm font-bold tracking-wider text-primary">{discount.code}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleCopyCode(discount.code)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      {copiedCode === discount.code ? 'Đã copy' : 'Copy'}
                    </Button>
                  </div>

                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>
                      Bắt đầu: <strong className="text-foreground">{new Date(discount.startDate).toLocaleDateString('vi-VN')}</strong>
                    </p>
                    <p>Đơn tối thiểu: <strong className="text-foreground">{formatCurrency(discount.minOrderValue)}</strong></p>
                    {discount.maxDiscount !== null && discount.maxDiscount !== undefined && (
                      <p>Mức giảm tối đa: <strong className="text-foreground">{formatCurrency(discount.maxDiscount)}</strong></p>
                    )}
                    <p>
                      Hạn dùng: <strong className="text-foreground">{new Date(discount.endDate).toLocaleDateString('vi-VN')}</strong>
                    </p>
                    {remain !== null && (
                      <p>Lượt còn lại: <strong className="text-foreground">{remain}</strong></p>
                    )}
                  </div>

                  <Button className="w-full" disabled={isUpcoming} onClick={() => navigate('/checkout')}>
                    {isUpcoming ? 'Chưa tới thời gian áp dụng' : 'Dùng mã ngay'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
