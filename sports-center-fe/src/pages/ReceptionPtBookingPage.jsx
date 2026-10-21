import { PtBrowser } from '../components/booking'

export default function ReceptionPtBookingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đặt PT cho hội viên</h1>
        <p className="text-secondary">Đặt lịch huấn luyện cá nhân thay cho hội viên tại quầy.</p>
      </div>
      <PtBrowser requireMemberId />
    </div>
  )
}
