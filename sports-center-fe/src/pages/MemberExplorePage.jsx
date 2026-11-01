import { Link, useSearchParams } from 'react-router-dom'
import { MemberCommerce } from '../components/commerce'
import { Icon } from '../components/ui'
import MemberPtPage from './MemberPtPage'
import MemberSchedule from './static/MemberSchedule'

export default function MemberExplorePage() {
  const [params, setParams] = useSearchParams()
  const type = ['pt', 'single'].includes(params.get('type')) ? params.get('type') : 'courses'
  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-primary text-body-sm font-semibold mb-1">TẬP LUYỆN CÙNG FITZONE</p>
        <h1 className="font-headline-xl text-headline-xl">Khám phá & đăng ký</h1>
        <p className="text-secondary mt-2">Chọn khóa nhiều tuần hoặc buổi tập riêng với huấn luyện viên.</p>
      </div>
      <Link to="/member/schedule" className="inline-flex items-center gap-2 text-primary font-semibold py-2"><Icon name="event_note" />Lịch của tôi<Icon name="arrow_forward" className="text-lg" /></Link>
    </div>
    <nav aria-label="Hình thức tập luyện" className="grid sm:grid-cols-2 gap-3">
      {[['courses', 'school', 'Khóa học nhiều tuần', 'Một lần đăng ký, trọn lịch tập trong khóa.'], ['pt', 'fitness_center', 'Tập riêng với HLV', 'Chọn huấn luyện viên, giờ tập và thanh toán.']].map(([value, icon, label, description]) =>
        <button type="button" key={value} aria-pressed={type === value} onClick={() => setParams(value === 'courses' ? {} : { type: value })}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${type === value ? 'border-primary-container bg-primary-container/5 ring-1 ring-primary-container' : 'border-outline-variant/50 bg-white hover:border-primary-container'}`}>
          <span className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${type === value ? 'bg-primary-container text-white' : 'bg-surface-container text-primary'}`}><Icon name={icon} /></span>
          <span><span className="block font-semibold">{label}</span><span className="block text-body-sm text-secondary mt-0.5">{description}</span></span>
          {type === value && <Icon name="check_circle" className="text-primary ml-auto shrink-0" />}
        </button>)}
    </nav>
    {type === 'courses' && <MemberCommerce viewMode="catalog" embedded />}
    {type === 'pt' && <MemberPtPage embedded />}
    {type === 'single' && <MemberSchedule />}
    <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant/40 pt-4 text-body-sm text-secondary">
      <span>Bạn đã có đăng ký trước đây?</span>
      <Link className="text-primary hover:underline" to="/member/schedule?tab=courses">Xem khóa đã đăng ký</Link>
      <Link className="hover:underline" to="/member/classes?type=single">Lớp theo buổi</Link>
      <Link className="hover:underline" to="/member/schedule?tab=packages">Gói tập đã mua</Link>
    </div>
  </div>
}
