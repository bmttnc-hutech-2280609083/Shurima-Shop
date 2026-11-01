import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Search, ShoppingBag, User, LogIn, LayoutDashboard, LogOut, Package } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { getAllCategories } from '../../services/common.service'

const NAV_ITEMS = [
  { label: 'Tất cả', to: '/products', category: '' },
  { label: 'Nam', to: '/products?category=nam', category: 'nam' },
  { label: 'Nữ', to: '/products?category=nu', category: 'nu' },
  { label: 'Giày', to: '/products?category=giay', category: 'giay' },
  { label: 'Phụ kiện', to: '/products?category=phu-kien', category: 'phu-kien' },
]

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

export default function Header() {
  const { user } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchVal, setSearchVal] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getAllCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => {
        console.error('[Header Error] Không thể tải danh sách danh mục:', err)
      })
  }, [])

  const currentCategoryParam = location.pathname === '/products' ? (searchParams.get('category') || '') : null

  const handleNavClick = async (item) => {
    try {
      if (!item.category) return

      let currentCats = categories
      if (!currentCats.length) {
        const res = await getAllCategories()
        currentCats = res.data || []
        setCategories(currentCats)
      }

      const matched = currentCats.find(
        (cat) => cat._id === item.category || matchCategoryBySlug(cat.name, toSlug(item.category))
      )

      if (!matched) {
        console.error(
          `[Nav Click Error] Không tìm thấy danh mục "${item.label}" (slug="${item.category}") trong cơ sở dữ liệu!`,
          {
            clickedNav: item,
            availableCategories: currentCats.map((c) => ({ id: c._id, name: c.name })),
          }
        )
      }
    } catch (err) {
      console.error(`[Nav Click Error] Lỗi khi xử lý click danh mục "${item.label}":`, err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`)
    } else {
      navigate('/products')
    }
  }

  const totalItems = cart?.totalItems || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl tracking-tight text-primary">
              ShurimaShop
            </span>
          </Link>
          {/* Menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive =
                currentCategoryParam !== null &&
                (toSlug(currentCategoryParam) === item.category ||
                  (item.category &&
                    categories.some(
                      (c) =>
                        c._id === currentCategoryParam &&
                        matchCategoryBySlug(c.name, item.category)
                    )))

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => handleNavClick(item)}
                  className={`transition-colors hover:text-primary ${
                    isActive ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-64 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-8 bg-muted/50 border-none rounded-full h-9"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </form>

          {/* Icons & CTA */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>

            {/* Profile / Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted hover:text-foreground outline-none"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=c0df85&color=fff&size=32`}
                    alt="Profile"
                    className="h-7 w-7 rounded-full"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name || 'Người dùng'}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer py-2">
                    <User className="mr-2 h-4 w-4" />
                    Tài khoản của tôi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer py-2">
                    <Package className="mr-2 h-4 w-4" />
                    Đơn hàng của tôi
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="cursor-pointer py-2 text-primary focus:text-primary focus:bg-primary/10">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Trang Quản Trị (Admin)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { localStorage.clear(); window.location.href = '/' }} className="cursor-pointer py-2 text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary"
                onClick={() => navigate('/login')}
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}

            <Button
              size="sm"
              className="hidden sm:inline-flex rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ml-2"
              onClick={() => navigate('/products')}
            >
              Sale 🔥
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
