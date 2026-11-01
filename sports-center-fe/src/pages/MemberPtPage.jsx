import { PtBrowser } from '../components/booking'

export default function MemberPtPage({ embedded = false }) {
  return (
    <div className="flex flex-col gap-4">
      {!embedded && <div>
        <h1 className="font-headline-xl text-headline-xl">Đặt lịch PT</h1>
        <p className="text-secondary">Chọn huấn luyện viên và giờ tập, rồi thanh toán ngay bằng số dư để xác nhận lịch. Không cần mua gói PT trước.</p>
      </div>}
      <PtBrowser />
    </div>
  )
}
