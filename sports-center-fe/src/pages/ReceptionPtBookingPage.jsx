import { PtBrowser } from '../components/booking'

export default function ReceptionPtBookingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đặt PT cho hội viên</h1>
        <p className="text-secondary">Chọn hội viên, HLV và giờ tập; thu tiền mặt hoặc cho khách quét QR chuyển khoản để đặt PT buổi lẻ.</p>
      </div>
      <PtBrowser requireMemberId />
    </div>
  )
}
