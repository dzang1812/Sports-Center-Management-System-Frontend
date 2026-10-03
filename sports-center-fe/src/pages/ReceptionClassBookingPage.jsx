import { ClassBrowser } from '../components/booking'
import { Alert } from '../components/ui'

export default function ReceptionClassBookingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đặt lớp cho hội viên</h1>
        <p className="text-secondary">Đặt chỗ một buổi học thay cho hội viên tại quầy.</p>
      </div>
      <Alert type="info">Hệ thống chưa có tra cứu hội viên theo tên/SĐT — vui lòng xác nhận mã hội viên (Member ID) trước khi đặt.</Alert>
      <ClassBrowser requireMemberId />
    </div>
  )
}
