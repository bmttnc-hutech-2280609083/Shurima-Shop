import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// User Pages
import Home from './pages/user/Home'
import ProductsPage from './pages/user/ProductsPage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CartPage from './pages/user/CartPage'
import ProfilePage from './pages/user/ProfilePage'
import OrdersPage from './pages/user/OrdersPage'
import CheckoutPage from './pages/user/CheckoutPage'
import CheckoutResultPage from './pages/user/CheckoutResultPage'
import SaleHuntPage from './pages/user/SaleHuntPage'

// Admin Pages
import DashboardOverview from './pages/admin/DashboardOverview'
import AdminProductsPage from './pages/admin/ProductsPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import CustomersPage from './pages/admin/CustomersPage'
import PaymentsPage from './pages/admin/PaymentsPage'
import ReviewsPage from './pages/admin/ReviewsPage'
import DiscountsPage from './pages/admin/DiscountsPage'
import SettingsPage from './pages/admin/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="checkout/result" element={<CheckoutResultPage />} />
              <Route path="sale-hunt" element={<SaleHuntPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="discounts" element={<DiscountsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
