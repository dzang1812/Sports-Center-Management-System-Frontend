import { useSearchParams } from 'react-router-dom'
import { PtPricing } from '../components/commerce'
import ManagerPtBookingsPage from './ManagerPtBookingsPage'

export default function ManagerPtPage() {
  const [params, setParams] = useSearchParams()
  const pricing = params.get('tab') === 'pricing'
  return <div className="space-y-5">
    <div><h1 className="font-headline-xl text-headline-xl">Lịch PT & giá buổi</h1><p className="text-secondary mt-2">Theo dõi các buổi PT và cấu hình giá theo bộ môn.</p></div>
    <nav aria-label="Quản lý PT" className="flex gap-1 p-1 rounded-xl bg-surface-container-low w-fit">{[[false, 'Lịch hẹn PT'], [true, 'Giá buổi PT']].map(([value, label]) => <button type="button" key={label} aria-pressed={pricing === value} onClick={() => setParams(value ? { tab: 'pricing' } : {})} className={`rounded-lg px-4 py-2 text-body-sm font-semibold ${pricing === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container'}`}>{label}</button>)}</nav>
    {pricing ? <PtPricing /> : <ManagerPtBookingsPage embedded />}
  </div>
}
