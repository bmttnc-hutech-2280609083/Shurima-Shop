import { useState, useEffect } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts'
import { getAllOrders } from '../../services/order.service'
import { getAllProducts } from '../../services/product.service'
import { getAllUsers } from '../../services/common.service'

export default function DashboardOverview() {
  const [stats, setStats] = useState([
    { title: 'Doanh thu', value: '...', icon: DollarSign, trend: '', isUp: true },
    { title: 'Số đơn hàng', value: '...', icon: ShoppingBag, trend: '', isUp: true },
    { title: 'Tổng sản phẩm', value: '...', icon: TrendingUp, trend: '', isUp: true },
    { title: 'User mới', value: '+3', icon: Users, trend: 'Đang cập nhật', isUp: true },
  ])
  const [revenueData, setRevenueData] = useState([])
  const [topProductsData, setTopProductsData] = useState([])

  const buildRevenueByLast7Days = (orders) => {
    const days = [...Array(7)].map((_, idx) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - idx))
      const key = d.toISOString().slice(0, 10)
      return { key, name: `T${d.getDate()}`, total: 0 }
    })

    const map = Object.fromEntries(days.map((d) => [d.key, d]))
    orders.forEach((order) => {
      const key = new Date(order.createdAt).toISOString().slice(0, 10)
      if (map[key]) {
        map[key].total += Number(order.totalPrice || 0)
      }
    })

    return days.map((d) => ({ name: d.name, total: map[d.key].total }))
  }

  const buildTopProducts = (orders) => {
    const salesMap = {}

    orders.forEach((order) => {
      ;(order.items || []).forEach((item) => {
        const productId = item.product?._id || item.product
        const productName = item.product?.name || 'Sản phẩm'
        if (!productId) return

        if (!salesMap[productId]) {
          salesMap[productId] = { name: productName, sales: 0 }
        }
        salesMap[productId].sales += Number(item.quantity || 0)
      })
    })

    return Object.values(salesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          getAllOrders().catch(() => ({ data: [] })),
          getAllProducts({ limit: 1000 }).catch(() => ({ data: [] })),
          getAllUsers({ limit: 1000 }).catch(() => ({ data: [] }))
        ])

        const orders = ordersRes.data || []
        const products = productsRes.data || []
        const users = usersRes.data || []

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

        setRevenueData(buildRevenueByLast7Days(orders))
        setTopProductsData(buildTopProducts(orders))

        setStats([
          { title: 'Tổng Doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, icon: DollarSign, trend: 'Tất cả thời gian', isUp: true },
          { title: 'Số đơn hàng', value: orders.length.toString(), icon: ShoppingBag, trend: 'Tất cả đơn hàng', isUp: true },
          { title: 'Tổng sản phẩm', value: products.length.toString(), icon: TrendingUp, trend: 'Đang mở bán', isUp: true },
          { title: 'Tổng users', value: users.length.toString(), icon: Users, trend: 'Từ database', isUp: true },
        ])
      } catch (err) {
        console.error('Error fetching stats', err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Tổng quan</h2>
        <p className="text-slate-500 mt-1">Theo dõi hoạt động kinh doanh của cửa hàng.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-none shadow-sm hover:shadow transition-shadow group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {stat.title}
                </CardTitle>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <p className={`text-xs mt-1 font-medium ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend} so với hôm qua
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-slate-700">Biểu đồ doanh thu (Tuần)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip cursor={{full: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="total" stroke="#c0df85" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-slate-700">Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} width={100} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sales" fill="#c0df85" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
