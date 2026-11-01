import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const DEFAULT_SETTINGS = {
  shopName: 'ShurimaShop',
  shopEmail: 'contact@shurimashop.com',
  shopPhone: '0123456789',
  shopAddress: 'Quận 1, TP Hồ Chí Minh',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:shop-settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch {
      setSettings(DEFAULT_SETTINGS)
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => {
    localStorage.setItem('admin:shop-settings', JSON.stringify(settings))
    showToast('Đã lưu cấu hình cửa hàng!')
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('admin:shop-settings')
    showToast('Đã đặt lại cấu hình mặc định!')
  }

  return (
    <div className="max-w-2xl space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-destructive' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cài đặt</h2>
        <p className="text-sm text-slate-500">Quản lý thông tin cửa hàng của bạn.</p>
      </div>

      <div className="space-y-6 pt-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Thông tin công khai</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Tên cửa hàng</Label>
              <Input
                id="shopName"
                value={settings.shopName}
                onChange={(e) => setSettings((prev) => ({ ...prev, shopName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopEmail">Email liên hệ</Label>
              <Input
                id="shopEmail"
                type="email"
                value={settings.shopEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, shopEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopPhone">Số điện thoại</Label>
              <Input
                id="shopPhone"
                value={settings.shopPhone}
                onChange={(e) => setSettings((prev) => ({ ...prev, shopPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopAddress">Địa chỉ</Label>
              <Input
                id="shopAddress"
                value={settings.shopAddress}
                onChange={(e) => setSettings((prev) => ({ ...prev, shopAddress: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg border-b pb-2">Giao diện</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Hero</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex justify-center flex-col items-center text-sm text-muted-foreground bg-muted/30">
                <p>Kéo thả hoặc click để thay đổi ảnh</p>
                <Button variant="outline" size="sm" className="mt-4">Tải ảnh lên</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            Đặt lại
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  )
}
