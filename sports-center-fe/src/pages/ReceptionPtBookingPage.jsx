import { PtBrowser } from '../components/booking'
import { Alert } from '../components/ui'

export default function ReceptionPtBookingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đặt PT cho hội viên</h1>
        <p className="text-secondary">Đặt lịch huấn luyện cá nhân thay cho hội viên tại quầy.</p>
      </div>
      <Alert type="info">Hệ thống chưa có tra cứu hội viên theo tên/SĐT — vui lòng xác nhận mã hội viên (Member ID) trước khi đặt.</Alert>
      <PtBrowser requireMemberId />
    </div>
  )
}
