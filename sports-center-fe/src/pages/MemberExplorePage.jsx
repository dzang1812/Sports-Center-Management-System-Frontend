import { Link, useSearchParams } from 'react-router-dom'
import { MemberCommerce } from '../components/commerce'
import { Icon } from '../components/ui'
import MemberPtPage from './MemberPtPage'
import MemberSchedule from './static/MemberSchedule'

export default function MemberExplorePage() {
  const [params, setParams] = useSearchParams()
  const type = ['pt', 'single'].includes(params.get('type')) ? params.get('type') : 'courses'
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-2xl font-bold text-slate-900">Khám phá & đăng ký</h1>
      <Link to="/member/schedule" className="inline-flex items-center gap-1 text-primary text-body-sm font-semibold py-2"><Icon name="event_note" className="text-lg" />Lịch của tôi<Icon name="arrow_forward" className="text-base" /></Link>
    </div>
    <div className="rounded-2xl border border-outline-variant/50 bg-white p-3 sm:p-4 shadow-sm space-y-3">
    <nav aria-label="Hình thức tập luyện" className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
      {[['courses', 'school', 'Khóa học nhiều tuần', 'Một lần đăng ký, trọn lịch tập trong khóa.'], ['pt', 'fitness_center', 'Tập riêng với HLV', 'Chọn huấn luyện viên, giờ tập và thanh toán.']].map(([value, icon, label, description]) =>
        <button type="button" key={value} aria-pressed={type === value} onClick={() => setParams(value === 'courses' ? {} : { type: value })}
          title={description} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm font-semibold transition-colors ${type === value ? 'bg-primary-container text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Icon name={icon} className="text-lg" /><span>{label}</span>
        </button>)}
    </nav>
    {type === 'courses' && <MemberCommerce viewMode="catalog" embedded />}
    {type === 'pt' && <MemberPtPage embedded />}
    {type === 'single' && <MemberSchedule />}
    </div>
    <details className="text-body-sm text-slate-500"><summary className="cursor-pointer w-fit">Khóa đã mua & tùy chọn khác</summary><div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
      <Link className="text-primary hover:underline" to="/member/schedule?tab=courses">Xem khóa đã đăng ký</Link>
      <Link className="hover:underline" to="/member/classes?type=single">Lớp theo buổi</Link>
      <Link className="hover:underline" to="/member/subscription">Gói tập đã mua</Link>
    </div></details>
  </div>
}
