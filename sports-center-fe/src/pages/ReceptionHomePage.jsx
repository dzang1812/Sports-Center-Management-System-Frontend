import { useSearchParams, Link } from 'react-router-dom'
import ReceptionMemberPicker from '../components/ReceptionMemberPicker'
import { Icon } from '../components/ui'
import GymCheckInPanel from '../components/GymCheckInPanel'

const Action = ({ to, icon, title, children }) => <Link to={to} className="flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-white p-4 hover:border-primary-container transition-colors"><span className="h-10 w-10 shrink-0 rounded-xl bg-surface-container text-primary flex items-center justify-center"><Icon name={icon} /></span><span><b className="block">{title}</b><span className="block text-body-sm text-secondary mt-1">{children}</span></span><Icon name="arrow_forward" className="text-primary text-lg ml-auto shrink-0" /></Link>

export default function ReceptionHomePage() {
  const [params, setParams] = useSearchParams()
  const checkIn = params.get('tab') === 'checkin'
  const rawId = params.get('memberId') ?? ''
  const memberId = /^[1-9]\d*$/.test(rawId) ? rawId : ''
  const choose = id => { const next = new URLSearchParams(params); if (id) next.set('memberId', id); else next.delete('memberId'); setParams(next) }
  return <div className="space-y-5">
    <div><h1 className="font-headline-xl text-headline-xl">Quầy lễ tân</h1><p className="text-secondary mt-2">Chọn hội viên rồi mở nhanh công việc cần làm.</p></div>
    <nav aria-label="Quầy lễ tân" className="flex gap-1 p-1 rounded-xl bg-surface-container-low w-fit">{[[false, 'Tiếp đón hội viên'], [true, 'Check-in Gym']].map(([value, label]) => <button type="button" key={label} aria-pressed={checkIn === value} onClick={() => { const next = new URLSearchParams(params); if (value) next.set('tab', 'checkin'); else next.delete('tab'); setParams(next) }} className={`px-4 py-2 rounded-lg text-body-sm font-semibold ${checkIn === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container'}`}>{label}</button>)}</nav>
    {checkIn ? <GymCheckInPanel /> : <>
      <ReceptionMemberPicker memberId={memberId} onChange={choose}>{member => <div className="grid sm:grid-cols-2 gap-3">
        <Action to={`/reception/members/${member.id}`} icon="school" title="Khóa học & hồ sơ">Xem khóa đã đăng ký, lịch tập và thông tin hội viên.</Action>
        <Action to={`/reception/schedule?tab=register&memberId=${member.id}`} icon="event_available" title="Đăng ký khóa học">Chọn khóa nhiều tuần và xác nhận học phí.</Action>
        <Action to={`/reception/pt?memberId=${member.id}`} icon="fitness_center" title="Đặt PT riêng">Chọn HLV, giờ tập và phương thức thanh toán.</Action>
        <Action to={`/reception/members/${member.id}?tab=wallet`} icon="account_balance_wallet" title="Số dư & nạp tiền">Thu tiền tại quầy và tra cứu lịch sử giao dịch.</Action>
      </div>}</ReceptionMemberPicker>
      <section className="space-y-3"><h2 className="font-semibold text-lg">Tra cứu nhanh</h2><div className="grid sm:grid-cols-3 gap-3"><Action to="/reception/members" icon="group" title="Danh sách hội viên">Tìm hồ sơ hội viên.</Action><Action to="/reception/schedule" icon="calendar_month" title="Khóa học & lịch">Tư vấn lịch và học phí.</Action><Action to="/reception/payments" icon="payments" title="Thanh toán đang chờ">Kiểm tra các đơn cần xử lý.</Action></div></section>
    </>}
  </div>
}
