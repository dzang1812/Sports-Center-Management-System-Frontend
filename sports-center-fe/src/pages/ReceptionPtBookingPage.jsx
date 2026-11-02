import { PtBrowser } from '../components/booking'
import { useSearchParams } from 'react-router-dom'
import ReceptionMemberPicker from '../components/ReceptionMemberPicker'

export default function ReceptionPtBookingPage() {
  const [params, setParams] = useSearchParams()
  const rawId = params.get('memberId') ?? ''
  const memberId = /^[1-9]\d*$/.test(rawId) ? rawId : ''
  const choose = id => { const next = new URLSearchParams(params); if (id) next.set('memberId', id); else next.delete('memberId'); setParams(next) }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đặt PT cho hội viên</h1>
        <p className="text-secondary">Chọn hội viên, HLV và giờ tập; thu tiền mặt hoặc cho khách quét QR chuyển khoản để đặt PT buổi lẻ.</p>
      </div>
      <ReceptionMemberPicker memberId={memberId} onChange={choose}>{member => <PtBrowser requireMemberId targetMemberId={String(member.id)} />}</ReceptionMemberPicker>
    </div>
  )
}
