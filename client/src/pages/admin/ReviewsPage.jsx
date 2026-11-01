import { useState, useEffect, useMemo, useCallback } from 'react'
import { Edit, Trash2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { getAllReviews, updateReview, deleteReview } from '../../services/review.service'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [toast, setToast] = useState(null)
  const [editingReview, setEditingReview] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({ rating: 5, comment: '' })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllReviews()
      setReviews(data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đánh giá.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const filteredReviews = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    if (!keyword) return reviews

    return reviews.filter((review) => {
      const productName = review.product?.name?.toLowerCase() || ''
      const userName = review.user?.name?.toLowerCase() || ''
      const userEmail = review.user?.email?.toLowerCase() || ''
      const comment = review.comment?.toLowerCase() || ''
      return (
        productName.includes(keyword)
        || userName.includes(keyword)
        || userEmail.includes(keyword)
        || comment.includes(keyword)
      )
    })
  }, [reviews, searchText])

  const openEditModal = (review) => {
    setEditingReview(review)
    setForm({
      rating: Number(review.rating || 5),
      comment: review.comment || '',
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingReview?._id) return

    try {
      setIsSaving(true)
      await updateReview(editingReview._id, {
        rating: Number(form.rating),
        comment: form.comment,
      })

      showToast('Cập nhật đánh giá thành công!')
      setEditingReview(null)
      await fetchReviews()
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật đánh giá!', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    try {
      await deleteReview(reviewId)
      showToast('Đã xóa đánh giá!')
      setReviews((prev) => prev.filter((review) => review._id !== reviewId))
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa đánh giá!', 'error')
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đánh giá</h2>
          <p className="text-sm text-slate-500">Quản lý đánh giá và bình luận sản phẩm.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchReviews} title="Làm mới">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Input
        placeholder="Tìm theo sản phẩm, khách hàng, email hoặc nội dung bình luận..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-slate-500">Đang tải đánh giá...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchReviews} className="ml-auto">
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số sao</TableHead>
                <TableHead>Bình luận</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Chưa có đánh giá nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>{review.product?.name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.user?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{review.user?.email || '—'}</div>
                    </TableCell>
                    <TableCell>{Number(review.rating || 0)}/5</TableCell>
                    <TableCell className="max-w-[320px]">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{review.comment || '—'}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-primary"
                        onClick={() => openEditModal(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-destructive"
                        onClick={() => handleDelete(review._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(editingReview)} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Cập nhật đánh giá</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Số sao</Label>
              <select
                id="rating"
                value={form.rating}
                onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
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
              <Label htmlFor="comment">Bình luận</Label>
              <textarea
                id="comment"
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingReview(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}