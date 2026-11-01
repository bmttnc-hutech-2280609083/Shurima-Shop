import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Wallet, Users, FolderTree, MessageSquare, TicketPercent, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
  { href: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { href: '/admin/payments', icon: Wallet, label: 'Thanh toán' },
  { href: '/admin/customers', icon: Users, label: 'Khách hàng' },
  { href: '/admin/reviews', icon: MessageSquare, label: 'Đánh giá' },
  { href: '/admin/discounts', icon: TicketPercent, label: 'Giảm giá' },
  { href: '/admin/settings', icon: Settings, label: 'Cài đặt' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r bg-white h-full hidden lg:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Link to="/admin" className="font-bold text-xl text-primary tracking-tight">
          ShurimaShop
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
