import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { getAllProducts } from '../../services/product.service'
import { getAllCategories } from '../../services/common.service'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80',
  'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80',
]

const CATEGORY_LABELS = {
  nam: 'Nam',
  nu: 'Nữ',
  giay: 'Giày',
  'phu-kien': 'Phụ kiện',
}

const toSlug = (str = '') =>
  str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const matchCategoryBySlug = (catName, targetSlug) => {
  const catSlug = toSlug(catName)
  if (!catSlug || !targetSlug) return false
  if (catSlug === targetSlug) return true
  if (targetSlug.includes('-')) return catSlug.includes(targetSlug)
  return catSlug.split('-').includes(targetSlug)
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted animate-pulse" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const cart = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const urlCategory = searchParams.get('category') || ''
  const urlSearch = searchParams.get('search') || ''

  const [search, setSearch] = useState(urlSearch)
  const [selectedCategory, setSelectedCategory] = useState(urlCategory)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    setSelectedCategory(urlCategory)
  }, [urlCategory])

  useEffect(() => {
    setSearch(urlSearch)
  }, [urlSearch])

  useEffect(() => {
    getAllCategories()
      .then((res) => {
        setCategories(res.data || [])
      })
      .catch((err) => {
        console.error('[ProductsPage Error] Lỗi khi tải danh sách danh mục:', err)
        showToast('Không thể tải danh sách danh mục!', 'error')
      })
      .finally(() => {
        setCategoriesLoaded(true)
      })
  }, [])

  // Tìm danh mục khớp với selectedCategory (có thể là ObjectId hoặc slug như 'nam', 'nu', 'giay', 'phu-kien')
  const matchedCategory = useMemo(() => {
    if (!selectedCategory || !categories.length) return null
    const targetSlug = toSlug(selectedCategory)
    return (
      categories.find(
        (cat) => cat._id === selectedCategory || matchCategoryBySlug(cat.name, targetSlug)
      ) || null
    )
  }, [selectedCategory, categories])

  useEffect(() => {
    if (categoriesLoaded && selectedCategory && !matchedCategory) {
      console.error(
        `[ProductsPage Category Error] Danh mục "${selectedCategory}" không tồn tại trong hệ thống!`,
        {
          requestedCategory: selectedCategory,
          availableCategories: categories.map((c) => ({ id: c._id, name: c.name })),
        }
      )
    }
  }, [categoriesLoaded, selectedCategory, matchedCategory, categories])

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300)
    return () => clearTimeout(timer)
  }, [search, selectedCategory, matchedCategory])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const params = { limit: 24 }
      if (search.trim()) params.search = search.trim()
      if (selectedCategory) {
        params.category = matchedCategory ? matchedCategory._id : selectedCategory
      }
      const res = await getAllProducts(params)
      setProducts(res.data || [])
    } catch (err) {
      console.error('[ProductsPage Error] Lỗi khi tải danh sách sản phẩm:', {
        message: err.response?.data?.message || err.message,
        status: err.response?.status,
        params: { search, selectedCategory },
        error: err,
      })
      setProducts([])
      showToast(err.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm!', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCategory = (categoryValue) => {
    setSelectedCategory(categoryValue)
    const nextParams = new URLSearchParams(searchParams)
    if (categoryValue) {
      nextParams.set('category', categoryValue)
    } else {
      nextParams.delete('category')
    }
    setSearchParams(nextParams)
  }

  const getDisplayPrice = (product) => {
    if (typeof product.price === 'number') return product.price
    const variantPrices = (product.variants || [])
      .map((v) => v?.price)
      .filter((p) => typeof p === 'number')
    return variantPrices.length ? Math.min(...variantPrices) : 0
  }

  const getDisplayStock = (product) => {
    const variantStocks = (product.variants || [])
      .map((v) => Number(v?.stock || 0))
      .reduce((sum, n) => sum + n, 0)
    const productStock = Number(product.stock || 0)
    return Math.max(productStock, variantStocks)
  }

  const handleAddToCart = async (e, product) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await cart.addItem(product._id, 1)
      showToast(`Đã thêm "${product.name.substring(0, 30)}" vào giỏ! 🛒`, 'success')
    } catch (err) {
      console.error('[ProductsPage Error] Lỗi khi thêm sản phẩm vào giỏ hàng:', err)
      const msg = err.response?.data?.message || 'Lỗi khi thêm vào giỏ!'
      showToast(msg, 'error')
    }
  }

  const currentHeading = matchedCategory
    ? matchedCategory.name
    : selectedCategory
      ? CATEGORY_LABELS[toSlug(selectedCategory)] || selectedCategory
      : 'Tất cả sản phẩm'

  return (
    <div className="min-h-screen bg-gray-50/50">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-xs transition-all ${
            toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">{currentHeading}</h1>
          <p className="text-muted-foreground">
            Khám phá bộ sưu tập thời trang độc quyền của ShurimaShop
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Tìm kiếm
                </h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tên sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Danh mục
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === ''
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((cat) => {
                    const isSelected =
                      selectedCategory === cat._id || matchedCategory?._id === cat._id
                    return (
                      <button
                        key={cat._id}
                        onClick={() => handleSelectCategory(cat._id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Đang tải...' : `${products.length} sản phẩm`}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              ) : products.length > 0 ? (
                products.map((product, idx) => {
                  const displayPrice = getDisplayPrice(product)
                  const displayStock = getDisplayStock(product)

                  return (
                    <Link to={`/products/${product._id}`} key={product._id}>
                      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white h-full">
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={
                                product.images?.[0] ||
                                PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]
                              }
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                onClick={(e) => handleAddToCart(e, product)}
                                className="w-[80%] rounded-full bg-white text-foreground hover:bg-primary hover:text-primary-foreground text-sm transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 shadow-md"
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" /> Thêm vào giỏ
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {displayStock > 0 ? `Còn ${displayStock} sản phẩm` : 'Hết hàng'}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-primary">
                                {displayPrice.toLocaleString('vi-VN')}đ
                              </span>
                              {product.originalPrice && product.originalPrice > displayPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {product.originalPrice?.toLocaleString('vi-VN')}đ
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })
              ) : (
                <div className="col-span-4 py-20 text-center">
                  <SlidersHorizontal className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
