import { useEffect, useState } from 'react'
import { api } from '../api'
import PublicShell from '../components/PublicShell'
import CoachCard from '../components/CoachCard'
import { useClientPaged } from '../usePaged'

// Public coach directory, GET /pt/coaches (no auth required). Same panel/card look as the homepage "HLV tiêu biểu".
export default function TrainersPage() {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const { pageItems, pagination } = useClientPaged(coaches)

  useEffect(() => {
    api('/pt/coaches')
      .then(setCoaches)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicShell banner="/images/banner-trainers.jpg" bannerMobile="/images/banner-trainers-m.jpg" title="Đội ngũ huấn luyện viên FitZone">
      <div className="rounded-2xl border border-outline-variant/50 bg-white overflow-hidden shadow-sm">
        <div className="relative overflow-hidden bg-slate-900 px-5 py-6 sm:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">ĐỘI NGŨ CHUYÊN MÔN</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Huấn luyện viên giàu kinh nghiệm</h2>
            <p className="mt-1.5 text-body-sm text-slate-300">Đội ngũ PT được chứng nhận chuyên môn, sẵn sàng đồng hành cùng mục tiêu tập luyện của bạn.</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-6">
          <div aria-busy={loading} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${loading ? 'opacity-50' : ''}`}>
            {loading && !coaches.length && <p role="status" className="py-10 text-secondary col-span-full">Đang tải HLV…</p>}
            {pageItems.map((c) => <CoachCard key={c.id} coach={c} />)}
            {!loading && !coaches.length && (
              <p className="col-span-full rounded-xl bg-slate-50 py-8 text-center text-body-sm text-secondary">Chưa có huấn luyện viên nào được công khai.</p>
            )}
          </div>
          {pagination}
        </div>
      </div>
    </PublicShell>
  )
}
