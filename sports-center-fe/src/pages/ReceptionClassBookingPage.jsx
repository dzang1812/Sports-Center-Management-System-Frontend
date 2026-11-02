import { useSearchParams } from 'react-router-dom'
import { MemberCommerce } from '../components/commerce'
import ReceptionMemberPicker from '../components/ReceptionMemberPicker'

export default function ReceptionClassBookingPage({ embedded = false }) {
  const [params, setParams] = useSearchParams()
  const rawId = params.get('memberId') ?? ''
  const memberId = /^[1-9]\d*$/.test(rawId) ? rawId : ''
  const courseId = Number(params.get('courseId')) || null
  const choose = id => { const next = new URLSearchParams(params); if (id) next.set('memberId', id); else next.delete('memberId'); setParams(next) }
  return (
    <div className="flex flex-col gap-4">
      {!embedded && <div>
        <h1 className="font-headline-xl text-headline-xl">Đăng ký khóa học cho hội viên</h1>
        <p className="text-secondary">Chọn hội viên để xem khóa học và đăng ký toàn khóa. Học phí thanh toán một lần bằng số dư của hội viên.</p>
      </div>}
      <ReceptionMemberPicker memberId={memberId} onChange={choose}>{member => <div className="space-y-4">
        {courseId && <p className="text-body-sm text-secondary">Đang xem khóa đã chọn. <button type="button" className="text-primary underline" onClick={() => { const next = new URLSearchParams(params); next.delete('courseId'); setParams(next) }}>Xem tất cả khóa</button></p>}
        <MemberCommerce key={`${member.id}:${courseId ?? 'all'}`} memberId={String(member.id)} viewMode="catalog" focusCourseId={courseId} embedded />
      </div>}</ReceptionMemberPicker>
    </div>
  )
}
