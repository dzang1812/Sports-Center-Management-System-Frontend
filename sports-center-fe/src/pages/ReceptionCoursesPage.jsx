import { useSearchParams } from 'react-router-dom'
import ReceptionSchedulePage from './ReceptionSchedulePage'
import ReceptionClassBookingPage from './ReceptionClassBookingPage'

export default function ReceptionCoursesPage() {
  const [params, setParams] = useSearchParams()
  const registering = params.get('tab') === 'register'
  return <div className="space-y-5"><div><h1 className="font-headline-xl text-headline-xl">Khóa học & lịch</h1><p className="text-secondary mt-2">Tra cứu khóa để tư vấn hoặc chọn hội viên và đăng ký toàn khóa.</p></div>
    <nav aria-label="Khóa học tại quầy" className="flex flex-wrap gap-1 p-1 rounded-xl bg-surface-container-low w-fit">{[[false, 'Tra cứu khóa học'], [true, 'Đăng ký cho hội viên']].map(([value, label]) => <button type="button" key={label} aria-pressed={registering === value} onClick={() => { const next = new URLSearchParams(params); if (value) next.set('tab', 'register'); else next.delete('tab'); setParams(next) }} className={`rounded-lg px-4 py-2 text-body-sm font-semibold ${registering === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container'}`}>{label}</button>)}</nav>
    {registering ? <ReceptionClassBookingPage embedded /> : <ReceptionSchedulePage embedded />}
  </div>
}
