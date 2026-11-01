import { Link } from 'react-router-dom'
import { Globe, Smartphone, Mail } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function Footer() {
  return (
    <footer className="border-t bg-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Contact */}
          <div>
            <h3 className="font-bold text-xl text-primary mb-4">ShurimaShop</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Phong cách của bạn – Định nghĩa bởi Shurima. Chuyên cung cấp các mẫu thời trang mới nhất.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">ShurimaShop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Liên hệ</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Cửa hàng</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Đăng ký nhận tin</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Nhận thông tin mới nhất về các chương trình khuyến mãi.
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Email của bạn" className="max-w-[200px]" />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center">
          <p>© 2026 ShurimaShop. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
