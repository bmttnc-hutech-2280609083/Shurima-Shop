import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, ShoppingBag } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Lock className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Chưa đăng nhập</h2>
        <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Đăng nhập
        </button>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-extrabold mb-8">Tài khoản của tôi</h1>

      {/* User info card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 mb-6">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=c0df85&color=fff&size=80`}
            alt="Avatar"
            className="w-full h-full"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.name || 'Người dùng'}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {user.role === 'admin' ? '👑 Admin' : 'Khách hàng'}
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3">
        <Link to="/orders" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-primary/20 hover:shadow-md transition-all group">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold group-hover:text-primary transition-colors">Đơn hàng của tôi</p>
            <p className="text-xs text-muted-foreground">Theo dõi và quản lý đơn hàng</p>
          </div>
        </Link>

        {user.role === 'admin' && (
          <Link to="/admin/dashboard" className="bg-primary/5 rounded-2xl p-5 shadow-sm border border-primary/20 flex items-center gap-4 hover:bg-primary/10 transition-all group">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-primary">Trang Quản trị</p>
              <p className="text-xs text-muted-foreground">Vào Admin Dashboard</p>
            </div>
          </Link>
        )}
      </div>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
