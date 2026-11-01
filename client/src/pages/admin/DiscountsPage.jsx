import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, AlertCircle, RefreshCw, TicketPercent } from 'lucide-react'
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
  DialogTrigger,
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount, setDiscountPublicStatus } from '../../services/discount.service'

const INITIAL_FORM = {
  code: '',
  name: '',
  description: '',
  type: 'percent',
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  isActive: true,
  isPublic: false,
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const buildUpdatePayload = (discount, override = {}) => ({
    code: discount.code,
    name: discount.name,
    description: discount.description || '',
    type: discount.type,
    value: Number(discount.value || 0),
    minOrderValue: Number(discount.minOrderValue || 0),
    maxDiscount: discount.maxDiscount === null || discount.maxDiscount === undefined ? null : Number(discount.maxDiscount),
    startDate: discount.startDate ? new Date(discount.startDate).toISOString() : undefined,
    endDate: discount.endDate ? new Date(discount.endDate).toISOString() : undefined,
    usageLimit: discount.usageLimit === null || discount.usageLimit === undefined ? null : Number(discount.usageLimit),
    isActive: discount.isActive !== false,
    isPublic: discount.isPublic === true,
    ...override,
  })

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllDiscounts()
      setDiscounts(data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách mã giảm giá.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  const openCreateModal = () => {
    setEditingDiscount(null)
    setForm(INITIAL_FORM)
    setIsModalOpen(true)
  }

  const openEditModal = (discount) => {
    setEditingDiscount(discount)
    setForm({
      code: discount.code || '',
      name: discount.name || '',
      description: discount.description || '',
      type: discount.type || 'percent',
      value: discount.value ?? '',
      minOrderValue: discount.minOrderValue ?? '',
      maxDiscount: discount.maxDiscount ?? '',
      startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 10) : '',
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 10) : '',
      usageLimit: discount.usageLimit ?? '',
      isActive: discount.isActive !== false,
      isPublic: discount.isPublic === true,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      code: form.code,
      name: form.name,
      description: form.description,
      type: form.type,
      value: Number(form.value),
      minOrderValue: form.minOrderValue === '' ? 0 : Number(form.minOrderValue),
      maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      isActive: Boolean(form.isActive),
    }

    try {
      let savedDiscount = null

      if (editingDiscount?._id) {
        const res = await updateDiscount(editingDiscount._id, payload)
        savedDiscount = res?.data || null
        showToast('Cập nhật mã giảm giá thành công!')
      } else {
        const res = await createDiscount(payload)
        savedDiscount = res?.data || null
        showToast('Tạo mã giảm giá thành công!')
      }

      const targetId = savedDiscount?._id || editingDiscount?._id
      if (targetId && typeof form.isPublic === 'boolean') {
        try {
          await setDiscountPublicStatus(targetId, Boolean(form.isPublic))
        } catch (err) {
          if (err.response?.status === 404) {
            const fallbackPayload = buildUpdatePayload(savedDiscount || editingDiscount || {}, { isPublic: Boolean(form.isPublic) })
            await updateDiscount(targetId, fallbackPayload)
          } else {
            showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái public!', 'error')
          }
        }
      }

      setIsModalOpen(false)
      setEditingDiscount(null)
      await fetchDiscounts()
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể lưu mã giảm giá!', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return
    try {
      await deleteDiscount(id)
      showToast('Đã xóa mã giảm giá!')
      setDiscounts((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa mã giảm giá!', 'error')
    }
  }

  const handleTogglePublic = async (discount) => {
    try {
      const nextPublic = !(discount.isPublic === true)
      await setDiscountPublicStatus(discount._id, nextPublic)
      setDiscounts((prev) => prev.map((item) => (
        item._id === discount._id ? { ...item, isPublic: nextPublic } : item
      )))
      showToast(nextPublic ? 'Đã đẩy mã ra public cho user săn.' : 'Đã thu hồi mã khỏi public.')
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const fallbackPayload = buildUpdatePayload(discount, { isPublic: !(discount.isPublic === true) })
          await updateDiscount(discount._id, fallbackPayload)
          const nextPublic = !(discount.isPublic === true)
          setDiscounts((prev) => prev.map((item) => (
            item._id === discount._id ? { ...item, isPublic: nextPublic } : item
          )))
          showToast(nextPublic ? 'Đã đẩy mã ra public cho user săn.' : 'Đã thu hồi mã khỏi public.')
        } catch (fallbackErr) {
          showToast(fallbackErr.response?.data?.message || 'Không thể cập nhật trạng thái public!', 'error')
        }
      } else {
        showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái public!', 'error')
      }
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
          <h2 className="text-2xl font-bold text-slate-800">Mã giảm giá</h2>
          <p className="text-sm text-slate-500">Quản lý chương trình ưu đãi cho cửa hàng.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchDiscounts} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90"
              onClick={openCreateModal}
            >
              <Plus className="mr-2 h-4 w-4" /> Tạo mã giảm giá
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editingDiscount ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Mã *</Label>
                    <Input id="code" value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên chương trình *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input id="description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại giảm</Label>
                    <select
                      id="type"
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Giá trị giảm *</Label>
                    <Input id="value" type="number" min={0} value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderValue">Đơn tối thiểu</Label>
                    <Input id="minOrderValue" type="number" min={0} value={form.minOrderValue} onChange={(e) => setForm((prev) => ({ ...prev, minOrderValue: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Giảm tối đa</Label>
                    <Input id="maxDiscount" type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm((prev) => ({ ...prev, maxDiscount: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Bắt đầu *</Label>
                    <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Kết thúc *</Label>
                    <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                    <Input id="usageLimit" type="number" min={1} value={form.usageLimit} onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Trạng thái</Label>
                    <select
                      id="isActive"
                      value={form.isActive ? 'true' : 'false'}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Tạm tắt</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isPublic">Phát hành cho user săn sale</Label>
                  <select
                    id="isPublic"
                    value={form.isPublic ? 'true' : 'false'}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.value === 'true' }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="false">Chưa public</option>
                    <option value="true">Đang public</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-slate-500">Đang tải mã giảm giá...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDiscounts} className="ml-auto">Thử lại</Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Hiệu lực</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Public</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400">Chưa có mã giảm giá nào.</TableCell>
                </TableRow>
              ) : discounts.map((discount) => (
                <TableRow key={discount._id}>
                  <TableCell className="font-semibold text-primary">
                    <div className="inline-flex items-center gap-2">
                      <TicketPercent className="h-4 w-4" />
                      {discount.code}
                    </div>
                  </TableCell>
                  <TableCell>{discount.name}</TableCell>
                  <TableCell>{discount.type === 'percent' ? `${discount.value}%` : `${Number(discount.value || 0).toLocaleString('vi-VN')}đ`}</TableCell>
                  <TableCell>{Number(discount.minOrderValue || 0).toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {discount.startDate ? new Date(discount.startDate).toLocaleDateString('vi-VN') : '—'}
                    {' - '}
                    {discount.endDate ? new Date(discount.endDate).toLocaleDateString('vi-VN') : '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${discount.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {discount.isActive ? 'Hoạt động' : 'Tạm tắt'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${discount.isPublic ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {discount.isPublic ? 'Đang public' : 'Chưa public'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleTogglePublic(discount)}
                    >
                      {discount.isPublic ? 'Thu hồi' : 'Đẩy public'}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary" onClick={() => openEditModal(discount)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-destructive" onClick={() => handleDelete(discount._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
