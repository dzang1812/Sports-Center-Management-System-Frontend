import { Link, useSearchParams } from 'react-router-dom'
import { MemberCommerce } from '../components/commerce'
import { Icon } from '../components/ui'
import MemberPtPage from './MemberPtPage'
import MemberSchedule from './static/MemberSchedule'
import MemberPackages from '../components/MemberPackages'

export default function MemberExplorePage() {
  const [params, setParams] = useSearchParams()
  const type = ['pt', 'single', 'packages'].includes(params.get('type')) ? params.get('type') : 'courses'
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h1 className="text-2xl font-bold text-slate-900">Bạn muốn tập gì hôm nay?</h1><p className="text-body-sm text-secondary mt-1">Chọn khóa học, tập với HLV hoặc đăng ký gói tập.</p></div>
      <Link to="/member/schedule" className="inline-flex items-center gap-1 text-primary text-body-sm font-semibold py-2"><Icon name="event_note" className="text-lg" />Lịch của tôi<Icon name="arrow_forward" className="text-base" /></Link>
    </div>
    <div className="space-y-4">
    <nav aria-label="Hình thức tập luyện" className="grid grid-cols-3 gap-2 rounded-xl border border-outline-variant/40 bg-white p-2">
      {[['courses', 'school', 'Khóa học', 'Học theo lịch cố định, đăng ký trọn khóa.'], ['pt', 'fitness_center', 'Tập với HLV', 'Chọn HLV, giờ tập và thanh toán.'], ['packages', 'card_membership', 'Gói tập', 'Các gói theo thời hạn hoặc số buổi do trung tâm mở bán.']].map(([value, icon, label, description]) =>
        <button type="button" key={value} aria-pressed={type === value} onClick={() => setParams(value === 'courses' ? {} : { type: value })}
          title={description} className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-3 rounded-lg text-body-sm font-semibold transition-colors ${type === value ? 'bg-primary-container text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Icon name={icon} className="text-lg sm:text-2xl shrink-0" /><span className="text-left"><span className="block">{label}</span><span className={`hidden lg:block mt-0.5 text-xs font-normal ${type === value ? 'text-white/80' : 'text-slate-500'}`}>{description}</span></span>
        </button>)}
    </nav>
    {type === 'courses' && <MemberCommerce viewMode="catalog" embedded />}
    {type === 'pt' && <MemberPtPage embedded />}
    {type === 'packages' && <MemberPackages />}
    {type === 'single' && <MemberSchedule />}
    </div>
    <details className="text-body-sm text-slate-500"><summary className="cursor-pointer w-fit">Khóa đã mua & tùy chọn khác</summary><div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
      <Link className="text-primary hover:underline" to="/member/schedule?tab=courses">Xem khóa đã đăng ký</Link>
      <Link className="hover:underline" to="/member/classes?type=single">Lớp theo buổi</Link>
      <Link className="hover:underline" to="/member/subscription">Gói tập đã mua</Link>
    </div></details>
  </div>
}
