import { useState } from 'react'
import { MemberLookupField } from '../components/booking'
import { MemberCommerce } from '../components/commerce'

export default function ReceptionClassBookingPage() {
  const [memberId, setMemberId] = useState('')
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đăng ký khóa học cho hội viên</h1>
        <p className="text-secondary">Chọn hội viên để xem khóa học và đăng ký toàn khóa. Học phí thanh toán một lần bằng số dư của hội viên.</p>
      </div>
      <MemberLookupField onSelect={setMemberId} />
      {memberId ? <MemberCommerce key={memberId} memberId={memberId} coursesOnly />
        : <p className="rounded-xl bg-surface-container p-5 text-secondary">Chọn hội viên ở trên để xem các khóa được công bố và khóa đã đăng ký.</p>}
    </div>
  )
}
