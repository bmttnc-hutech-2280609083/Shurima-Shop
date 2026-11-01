import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, ChevronLeft, Star, Package } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { getProductById } from '../../services/product.service'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../lib/apiClient'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
  'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const cart = useCart()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isReviewLoading, setIsReviewLoading] = useState(true)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  const getDisplayPrice = (p) => {
    if (!p) return 0
    if (typeof p.price === 'number') return p.price
    const variantPrices = (p.variants || [])
      .map((v) => v?.price)
      .filter((val) => typeof val === 'number')
    return variantPrices.length ? Math.min(...variantPrices) : 0
  }

  const getDisplayStock = (p) => {
    if (!p) return 0
    const variantStocks = (p.variants || [])
      .map((v) => Number(v?.stock || 0))
      .reduce((sum, n) => sum + n, 0)
    const productStock = Number(p.stock || 0)
    return Math.max(productStock, variantStocks)
  }

  useEffect(() => {
    setIsLoading(true)
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false))
  }, [id])

  const fetchReviews = async () => {
    setIsReviewLoading(true)
    try {
      const res = await apiClient.get(`/reviews/product/${id}`)
      setReviews(res.data?.data || [])
    } catch {
      setReviews([])
    } finally {
      setIsReviewLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await cart.addItem(product._id, qty)
      setToast({ msg: 'Đã thêm vào giỏ hàng! 🛒', type: 'success' })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi thêm vào giỏ!'
      setToast({ msg, type: 'error' })
    } finally {
      setAdding(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setIsSubmittingReview(true)
      await apiClient.post('/reviews', {
        productId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      })
      setReviewForm({ rating: 5, comment: '' })
      await Promise.all([
        fetchReviews(),
        getProductById(id).then((res) => setProduct(res.data)).catch(() => {}),
      ])
      setToast({ msg: 'Đánh giá của bạn đã được ghi nhận!', type: 'success' })
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Không thể gửi đánh giá.', type: 'error' })
    } finally {
      setIsSubmittingReview(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Không tìm thấy sản phẩm.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">← Quay lại</Button>
      </div>
    )
  }

  const displayPrice = getDisplayPrice(product)
  const displayStock = getDisplayStock(product)
  const avgRating = Number(product.avgRating || 0)

  return (
    <div className="container mx-auto px-4 py-12">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-xs ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-8 text-muted-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại
      </Button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img
              src={product.images?.[0] || PLACEHOLDER_IMAGES[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            {(product.images?.length > 0 ? product.images : PLACEHOLDER_IMAGES).slice(0, 3).map((img, i) => (
              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary cursor-pointer transition-colors">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                {product.category?.name || product.category}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                {avgRating.toFixed(1)} ({reviews.length} đánh giá)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-extrabold text-primary">
              {displayPrice.toLocaleString('vi-VN')}đ
            </span>
            {product.originalPrice && product.originalPrice > displayPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {product.originalPrice?.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {displayStock > 0
              ? <span className="text-green-600 font-medium">Còn {displayStock} sản phẩm</span>
              : <span className="text-muted-foreground">Liên hệ để biết tình trạng hàng</span>
            }
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-lg font-medium transition-colors"
              >−</button>
              <span className="px-6 py-2 font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(displayStock || 99, qty + 1))}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-lg font-medium transition-colors"
              >+</button>
            </div>
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 h-12 text-base rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-14 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Đánh giá & bình luận</h2>

          {isReviewLoading ? (
            <div className="p-6 rounded-xl border bg-white text-muted-foreground">Đang tải đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className="p-6 rounded-xl border bg-white text-muted-foreground">
              Chưa có đánh giá nào cho sản phẩm này.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review._id} className="p-4 rounded-xl border bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm">{review.user?.name || 'Khách hàng'}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Number(review.rating || 0) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN') : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="p-5 rounded-xl border bg-white space-y-4 sticky top-24">
            <h3 className="text-lg font-semibold">Viết đánh giá</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Số sao</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={5}>5 sao</option>
                  <option value={4}>4 sao</option>
                  <option value={3}>3 sao</option>
                  <option value={2}>2 sao</option>
                  <option value={1}>1 sao</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bình luận</label>
                <textarea
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
