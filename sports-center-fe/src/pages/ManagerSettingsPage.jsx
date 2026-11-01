import { useSearchParams } from 'react-router-dom'
import AuditLogsPage from './AuditLogsPage'
import CatalogPage from './CatalogPage'
import ManagerPackagesPage from './ManagerPackagesPage'

export default function ManagerSettingsPage() {
  const [params, setParams] = useSearchParams()
  const tab = ['packages', 'audit'].includes(params.get('tab')) ? params.get('tab') : 'catalog'
  return <div className="space-y-5">
    <div><h1 className="font-headline-xl text-headline-xl">Danh mục & nhật ký</h1><p className="text-secondary mt-2">Quản lý bộ môn, phòng tập, gói tập và tra cứu lịch sử thao tác.</p></div>
    <nav aria-label="Danh mục quản lý" className="flex flex-wrap gap-1 p-1 rounded-xl bg-surface-container-low w-fit">{[['catalog', 'Bộ môn & phòng'], ['packages', 'Gói tập'], ['audit', 'Nhật ký thao tác']].map(([value, label]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => setParams(value === 'catalog' ? {} : { tab: value })} className={`rounded-lg px-4 py-2 text-body-sm font-semibold ${tab === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container'}`}>{label}</button>)}</nav>
    {tab === 'catalog' && <CatalogPage embedded />}{tab === 'packages' && <ManagerPackagesPage embedded />}{tab === 'audit' && <AuditLogsPage embedded />}
  </div>
}
