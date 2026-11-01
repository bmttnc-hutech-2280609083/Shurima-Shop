import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, AlertCircle, RefreshCw, FolderTree } from 'lucide-react'
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
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/common.service'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({ name: '', description: '' })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllCategories()
      setCategories(data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách danh mục.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = { name: form.name.trim() }
      if (editingCategory?._id) {
        await updateCategory(editingCategory._id, payload)
        showToast('Cập nhật danh mục thành công!')
      } else {
        await createCategory(payload)
        showToast('Thêm danh mục thành công!')
      }
      setIsModalOpen(false)
      setEditingCategory(null)
      setForm({ name: '', description: '' })
      fetchCategories()
    } catch (err) {
      const fallback = editingCategory ? 'Lỗi khi cập nhật danh mục!' : 'Lỗi khi thêm danh mục!'
      showToast(err.response?.data?.message || fallback, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setForm({
      name: category.name || '',
      description: category.description || '',
    })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setForm({ name: '', description: '' })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này? Hãy cẩn thận vì nó có thể ảnh hưởng đến sản phẩm.')) return
    try {
      await deleteCategory(id)
      showToast('Đã xóa danh mục!')
      fetchCategories()
    } catch (err) {
      showToast('Không thể xóa danh mục!', 'error')
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
          <h2 className="text-2xl font-bold text-slate-800">Danh mục</h2>
          <p className="text-sm text-slate-500">Quản lý danh sách danh mục sản phẩm.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchCategories} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90"
              onClick={openCreateModal}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên danh mục *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Áo Thun"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Mô tả ngắn..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingCategory(null)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : editingCategory ? 'Lưu thay đổi' : 'Lưu danh mục'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchCategories} className="ml-auto">Thử lại</Button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Biểu tượng</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                    Chưa có danh mục nào.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <FolderTree className="h-5 w-5" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.description || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-primary"
                        onClick={() => handleEdit(cat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-destructive"
                        onClick={() => handleDelete(cat._id)}
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
    </div>
  )
}
