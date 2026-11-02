import { Link, useSearchParams } from 'react-router-dom'
import { CourseManagement } from '../components/commerce'
import { Icon, btnPrimary } from '../components/ui'
import ManagerClassesPage from './ManagerClassesPage'

export default function ManagerCoursesPage() {
  const [params, setParams] = useSearchParams()
  const tab = ['sessions', 'advanced'].includes(params.get('tab')) ? params.get('tab') : 'courses'
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-headline-xl text-headline-xl">Khóa học & lịch</h1><p className="text-secondary mt-2">Tạo khóa, xem lịch, quản lý học phí và học viên tại một nơi.</p></div><Link className={btnPrimary} to="/manager/courses/new"><Icon name="add" className="text-lg" />Tạo khóa học</Link></div>
    <nav aria-label="Quản lý khóa học" className="flex flex-wrap gap-1 p-1 rounded-xl bg-surface-container-low w-fit">
      {[['courses', 'Danh sách khóa'], ['sessions', 'Lịch từng buổi']].map(([value, label]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => setParams(value === 'courses' ? {} : { tab: value })} className={`rounded-lg px-4 py-2 text-body-sm font-semibold ${tab === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container'}`}>{label}</button>)}
    </nav>
    {tab === 'courses' && <CourseManagement embedded />}
    {tab === 'sessions' && <ManagerClassesPage embedded sessionsOnly />}
    {tab === 'advanced' && <ManagerClassesPage embedded />}
    <details className="border-t border-outline-variant/40 pt-4 text-body-sm text-secondary"><summary className="cursor-pointer w-fit">Công cụ bổ sung</summary><Link className="inline-block pt-3 text-primary hover:underline" to="/manager/courses?tab=advanced">Chỉnh sửa thông tin khóa, tạo thêm buổi và xem danh sách đăng ký</Link></details>
  </div>
}
