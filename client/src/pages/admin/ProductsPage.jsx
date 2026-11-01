import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
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
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/product.service'
import { getAllCategories } from '../../services/common.service'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedCategory, setAppliedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Form state
  const [form, setForm] = useState({
    name: '', price: '', stock: '', category: '', description: '', images: ''
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = useCallback(async (page, options = {}) => {
    const nextSearch = options.search ?? appliedSearch
    const nextCategory = options.category ?? appliedCategory
    setIsLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: 10,
      }
      if (nextSearch?.trim()) params.search = nextSearch.trim()
      if (nextCategory) params.category = nextCategory

      const data = await getAllProducts(params)
      setProducts(data.data || [])
      setCurrentPage(data.pagination?.page || page)
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm.')
    } finally {
      setIsLoading(false)
    }
  }, [appliedSearch, appliedCategory])

  useEffect(() => {
    fetchProducts(currentPage)
  }, [fetchProducts, currentPage])

  useEffect(() => {
    // Fetch categories for dropdown
    getAllCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {})
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category || undefined,
        description: form.description,
        images: form.images ? [form.images] : undefined,
      }

      if (editingProduct?._id) {
        await updateProduct(editingProduct._id, payload)
        showToast('Cập nhật sản phẩm thành công!')
      } else {
        await createProduct(payload)
        showToast('Thêm sản phẩm thành công!')
      }

      setIsModalOpen(false)
      setEditingProduct(null)
      setForm({ name: '', price: '', stock: '', category: '', description: '', images: '' })
      fetchProducts(currentPage)
    } catch (err) {
      const fallback = editingProduct ? 'Lỗi khi cập nhật sản phẩm!' : 'Lỗi khi thêm sản phẩm!'
      showToast(err.response?.data?.message || fallback, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      price: typeof product.price === 'number' ? String(product.price) : '',
      stock: String(Number(product.stock || 0)),
      category: product.category?._id || product.category || '',
      description: product.description || '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
    })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm({ name: '', price: '', stock: '', category: '', description: '', images: '' })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    try {
      await deleteProduct(id)
      showToast('Đã xóa sản phẩm!')
      const isLastRowOnPage = products.length === 1
      const targetPage = isLastRowOnPage && currentPage > 1 ? currentPage - 1 : currentPage
      fetchProducts(targetPage)
    } catch (err) {
      showToast('Không thể xóa sản phẩm!', 'error')
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchProducts(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchProducts(currentPage + 1)
    }
  }

  const handleSearch = () => {
    const normalizedSearch = searchText.trim()
    setAppliedSearch(normalizedSearch)
    setAppliedCategory(selectedCategory)
    setCurrentPage(1)
    fetchProducts(1, {
      search: normalizedSearch,
      category: selectedCategory,
    })
  }

  const handleClearFilters = () => {
    setSearchText('')
    setSelectedCategory('')
    setAppliedSearch('')
    setAppliedCategory('')
    setCurrentPage(1)
    fetchProducts(1, { search: '', category: '' })
  }

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null

    const pages = []
    const start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, currentPage + 1)

    for (let page = start; page <= end; page += 1) {
      pages.push(page)
    }

    return pages
  }

  const getDisplayPrice = (product) => {
    if (typeof product.price === 'number') return product.price
    const variantPrices = (product.variants || [])
      .map((v) => v?.price)
      .filter((val) => typeof val === 'number')
    return variantPrices.length ? Math.min(...variantPrices) : 0
  }

  const getDisplayStock = (product) => {
    const variantStocks = (product.variants || [])
      .map((v) => Number(v?.stock || 0))
      .reduce((sum, n) => sum + n, 0)
    const productStock = Number(product.stock || 0)
    return Math.max(productStock, variantStocks)
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sản phẩm</h2>
          <p className="text-sm text-slate-500">Quản lý danh sách sản phẩm của bạn.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchProducts(currentPage)} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md hover:bg-primary/90"
              onClick={openCreateModal}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Áo thun form rộng..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá bán (đ) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Tồn kho *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">URL Hình ảnh</Label>
                  <Input
                    id="images"
                    placeholder="Nhập đường dẫn hình ảnh (https://...)"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Mô tả ngắn về sản phẩm..."
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
                      setEditingProduct(null)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : editingProduct ? 'Lưu thay đổi' : 'Lưu sản phẩm'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleSearch} className="flex-1">Tìm kiếm</Button>
          <Button type="button" variant="outline" onClick={handleClearFilters}>Xóa lọc</Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-slate-500">Đang tải sản phẩm...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchProducts(currentPage)} className="ml-auto">
            Thử lại
          </Button>
        </div>
      )}

      {/* Product Table */}
      {!isLoading && !error && (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                      Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const displayPrice = getDisplayPrice(product)
                    const displayStock = getDisplayStock(product)

                    return (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                        <div className="text-xs text-muted-foreground mt-0.5">{product._id?.slice(-8)}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {displayPrice.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell>{displayStock}</TableCell>
                      <TableCell>
                        <Badge
                          className={displayStock > 0
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                          }
                          variant="outline"
                        >
                          {displayStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-primary"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-destructive"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Trang {currentPage}/{Math.max(totalPages, 1)} · Tổng {totalItems} sản phẩm · 10 sản phẩm/trang
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
              >
                Trước
              </Button>

              {renderPageNumbers()?.map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => fetchProducts(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
