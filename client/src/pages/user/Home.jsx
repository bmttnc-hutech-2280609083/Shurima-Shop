import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { getAllProducts } from '../../services/product.service'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const CATEGORY_BG = [
  { title: 'Nam', slug: 'nam', img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500&q=80', cols: 'col-span-1 md:col-span-2' },
  { title: 'Nữ', slug: 'nu', img: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=500&q=80', cols: 'col-span-1 md:col-span-1' },
  { title: 'Giày', slug: 'giay', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80', cols: 'col-span-1 md:col-span-1 md:row-span-2' },
  { title: 'Phụ kiện', slug: 'phu-kien', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80', cols: 'col-span-1 md:col-span-3' },
]

// Placeholder images cho sản phẩm không có ảnh
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80',
  'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80',
  'https://images.unsplash.com/photo-1606902264639-65005bdf97b0?w=500&q=80',
  'https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=500&q=80',
]

// Skeleton loading card
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted animate-pulse" />
        <div className="p-5 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const cart = useCart()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const getDisplayPrice = (product) => {
    if (typeof product.price === 'number') return product.price
    const variantPrices = (product.variants || [])
      .map((v) => v?.price)
      .filter((val) => typeof val === 'number')
    return variantPrices.length ? Math.min(...variantPrices) : 0
  }

  useEffect(() => {
    getAllProducts({ limit: 8 })
      .then((res) => setProducts(res.data || []))
      .catch((err) => {
        console.error('[Home Error] Lỗi khi tải sản phẩm nổi bật:', err)
        setProducts([])
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setAddingId(product._id)
      await cart.addItem(product._id, 1)
      showToast('Đã thêm sản phẩm vào giỏ hàng!')
    } catch (err) {
      console.error('[Home Error] Lỗi khi thêm sản phẩm vào giỏ:', err)
      showToast(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ!', 'error')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/20 bg-gradient-to-tr from-primary/30 to-primary/5">
        <div className="container mx-auto px-4 h-[600px] flex items-center pt-8">
          <div className="grid md:grid-cols-2 gap-8 w-full items-center">
            <div className="space-y-6 z-10">
              <h1 className="text-5xl md:text-6xl lg:text-[64px] font-extrabold text-foreground leading-[1.1] tracking-tight">
                Phong cách của bạn <br className="hidden lg:block" />
                <span className="text-primary hidden lg:inline"> — </span>
                Định nghĩa bởi Shurima
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-[500px]">
                Khám phá bộ sưu tập thời trang mới nhất với thiết kế độc quyền, chất liệu cao cấp và xu hướng dẫn đầu.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full" onClick={() => navigate('/products')}>
                  Mua ngay
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg rounded-full bg-white/50 backdrop-blur border-primary/20 hover:bg-white text-foreground"
                  onClick={() => navigate('/products')}
                >
                  Xem bộ sưu tập
                </Button>
              </div>
            </div>
            <div className="relative h-full hidden md:flex justify-end items-end">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop"
                alt="Model"
                className="object-cover object-top h-[600px] absolute bottom-0 right-0 z-0 drop-shadow-2xl brightness-110"
                style={{
                  WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                  maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                }}
              />
              <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl -bottom-10 -right-10 z-[-1]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-wider text-muted-foreground">Theo danh mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {CATEGORY_BG.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${cat.cols}`}
            >
              <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl md:text-3xl font-bold tracking-wide">{cat.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold mb-2 text-foreground">Sản Phẩm Nổi Bật</h2>
              <p className="text-muted-foreground">Trang phục thiết kế riêng, số lượng giới hạn.</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 hidden sm:flex" onClick={() => navigate('/products')}>
              Xem tất cả &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.length > 0
                ? products.map((product, idx) => {
                  const displayPrice = getDisplayPrice(product)

                  return (
                    <Card key={product._id} className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <img
                            src={product.images?.[0] || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {product.originalPrice && product.originalPrice > displayPrice && (
                            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">Giảm giá</Badge>
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <Button
                              className="w-[80%] rounded-full shadow-md bg-white text-foreground hover:bg-primary hover:text-primary-foreground transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                              onClick={() => handleAddToCart(product)}
                              disabled={addingId === product._id}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {addingId === product._id ? 'Đang thêm...' : 'Thêm vào giỏ'}
                            </Button>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-medium text-base text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-primary">
                              {displayPrice.toLocaleString('vi-VN')}đ
                            </span>
                            {product.originalPrice && product.originalPrice > displayPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.originalPrice?.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
                : (
                  <div className="col-span-4 text-center py-16 text-muted-foreground">
                    Chưa có sản phẩm nào. Hãy quay lại sau nhé!
                  </div>
                )
            }
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Button variant="outline" className="w-full" onClick={() => navigate('/products')}>Xem tất cả</Button>
          </div>
        </div>
      </section>

      {/* Sale Banner Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50"></div>
          <div className="relative p-12 md:p-20 flex flex-col items-center text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary bg-primary/10 select-none uppercase tracking-widest px-4 py-1.5 text-xs">Phát hành số lượng giới hạn</Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Summer Sale<span className="text-primary">.</span></h2>
            <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl">
              Giảm giá lên đến <strong className="text-primary">50%</strong> cho toàn bộ sưu tập Thu Đông.
            </p>
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/sale-hunt')}
            >
              Săn sale ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
