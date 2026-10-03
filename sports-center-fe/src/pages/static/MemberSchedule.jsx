// UI exported from Stitch; wired to the real class-booking API (GET /sessions, POST /sessions/{id}/bookings,
// GET /me/schedule) while keeping the original layout/markup. Fields with no backing API (waitlist, the
// "empty state" demo toggle, stock coach photos) were dropped or replaced — see src/components/booking.jsx
// for the equivalent Reception-facing flow and API_MAPPING.md for details.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, query } from '../../api'
import { addDays, fromDateOnly, fromTimeOnly, toDateOnly, weekRange } from '../../dateUtils'
import { LEVEL_LABEL } from '../../labels'

const SPORT_COLOR = {
  Yoga: { dot: '#0EA5E9', bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  GroupX: { dot: '#4338CA', bg: '#EEF2FF', text: '#4338CA', border: '#4338CA' },
}
const FALLBACK_COLOR = { dot: '#64748B', bg: '#F1F5F9', text: '#334155', border: '#64748B' }
const sportColor = (name) => SPORT_COLOR[name] ?? FALLBACK_COLOR

const SLOT_RANGES = [
  ['morning', 'Sáng', '00:00:00', '12:00:00'],
  ['afternoon', 'Chiều', '12:00:00', '17:00:00'],
  ['evening', 'Tối', '17:00:00', '24:00:00'],
]
const slotOf = (startTime) => SLOT_RANGES.find(([, , from, to]) => startTime >= from && startTime < to)?.[1] ?? 'Sáng'

const initials = (name) => (name ?? '?').trim().split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() ?? '?'

const dayHeading = (dateStr, today, tomorrow) => {
  const weekday = new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long' })
  const [y, m, d] = dateStr.split('-')
  const prefix = dateStr === today ? 'Hôm nay - ' : dateStr === tomorrow ? 'Ngày mai - ' : ''
  return `${prefix}${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${d}/${m}/${y}`
}

export default function MemberSchedule() {
  const today = toDateOnly(new Date())
  const tomorrow = addDays(today, 1)
  const [week, setWeek] = useState(weekRange())
  const [sports, setSports] = useState([])
  const [sessions, setSessions] = useState([])
  const [bookedIds, setBookedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const [filters, setFilters] = useState({ search: '', day: 'all', coach: 'all', level: 'all', slot: 'all', sport: 'all' })

  useEffect(() => {
    api('/sports').then((list) => setSports(list.filter((s) => s.hasClasses))).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [from, to] = week
      const { items } = await api(`/sessions${query({ from, to, pageSize: 100 })}`)
      setSessions(items.filter((s) => s.status === 'Scheduled'))
      const mine = await api(`/me/schedule${query({ from, to, includeCancelled: false })}`)
      setBookedIds(new Set(mine.filter((m) => m.type === 'Class' && m.status === 'Confirmed').map((m) => m.referenceId)))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [week])

  useEffect(() => {
    load()
  }, [load])

  const coaches = useMemo(() => [...new Set(sessions.map((s) => s.coach).filter(Boolean))], [sessions])

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return sessions.filter((s) => {
      if (filters.sport !== 'all' && s.sport !== filters.sport) return false
      if (filters.day !== 'all' && s.date !== filters.day) return false
      if (filters.coach !== 'all' && s.coach !== filters.coach) return false
      if (filters.level !== 'all' && s.level !== filters.level) return false
      if (filters.slot !== 'all' && slotOf(s.startTime) !== SLOT_RANGES.find(([v]) => v === filters.slot)[1]) return false
      if (q && !`${s.className} ${s.coach ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [sessions, filters])

  const byDate = useMemo(() => {
    const groups = new Map()
    for (const s of [...filtered].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))) {
      if (!groups.has(s.date)) groups.set(s.date, [])
      groups.get(s.date).push(s)
    }
    return [...groups.entries()]
  }, [filtered])

  const sportCounts = useMemo(() => {
    const counts = {}
    for (const s of sessions) counts[s.sport] = (counts[s.sport] ?? 0) + 1
    return counts
  }, [sessions])

  const resetFilters = () => setFilters({ search: '', day: 'all', coach: 'all', level: 'all', slot: 'all', sport: 'all' })
  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  const book = async (session) => {
    setBusyId(session.id)
    setError('')
    try {
      await api(`/sessions/${session.id}/bookings`, { method: 'POST', body: { memberId: null } })
      setBookedIds((prev) => new Set(prev).add(session.id))
      setToast({ title: 'Đã giữ chỗ thành công!', desc: `${session.className} • ${session.date} ${fromTimeOnly(session.startTime)}` })
      setTimeout(() => setToast(null), 4000)
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusyId(null)
  }

  const shiftWeek = (days) => {
    const monday = fromDateOnly(week[0])
    monday.setDate(monday.getDate() + days)
    setWeek(weekRange(monday))
  }
  const goToday = () => setWeek(weekRange())

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-16 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 text-primary font-label-sm text-label-sm tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Hệ thống đặt lịch thời gian thực
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Lịch Lớp Học &amp; Đặt Chỗ Trực Tuyến</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Cập nhật thời gian biểu các lớp học tại FitZone. Đặt chỗ sớm để đảm bảo suất tập cùng đội ngũ HLV.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-surface-container-lowest p-1.5 rounded-xl shadow-sm">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors" title="Tuần trước" onClick={() => shiftWeek(-7)}>
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-tight">
                  Tuần hiện tại: {week[0].slice(8)}/{week[0].slice(5, 7)} - {week[1].slice(8)}/{week[1].slice(5, 7)}
                </span>
              </div>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors" title="Tuần sau" onClick={() => shiftWeek(7)}>
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
              <button className="h-9 px-3.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all" onClick={goToday}>
                Hôm nay
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              className={`px-4 py-2 rounded-xl font-label-md text-label-md shadow-sm shrink-0 transition-all flex items-center gap-2 ${filters.sport === 'all' ? 'text-on-primary bg-primary-container' : 'text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high'}`}
              onClick={() => setFilter('sport', 'all')}
            >
              <span>Tất cả bộ môn</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">{sessions.length}</span>
            </button>
            {sports.map((s) => {
              const c = sportColor(s.name)
              const active = filters.sport === s.name
              return (
                <button
                  key={s.id}
                  className={`px-4 py-2 rounded-xl font-label-md text-label-md transition-all shrink-0 flex items-center gap-2 shadow-sm ${active ? 'text-on-primary' : 'text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-high'}`}
                  style={active ? { backgroundColor: c.border } : undefined}
                  onClick={() => setFilter('sport', s.name)}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }}></span>
                  <span>{s.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">{sportCounts[s.name] ?? 0}</span>
                </button>
              )
            })}
          </div>

          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
              <div className="lg:col-span-4 relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">search</span>
                <input
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Tìm kiếm lớp học, HLV..."
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                />
              </div>

              <div className="lg:col-span-2">
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" value={filters.day} onChange={(e) => setFilter('day', e.target.value)}>
                  <option value="all">Tất cả các ngày</option>
                  {byDate.map(([date]) => (
                    <option key={date} value={date}>
                      {dayHeading(date, today, tomorrow)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" value={filters.coach} onChange={(e) => setFilter('coach', e.target.value)}>
                  <option value="all">Tất cả HLV</option>
                  {coaches.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" value={filters.level} onChange={(e) => setFilter('level', e.target.value)}>
                  <option value="all">Mọi cấp độ</option>
                  {Object.entries(LEVEL_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex items-center gap-2">
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest cursor-pointer" value={filters.slot} onChange={(e) => setFilter('slot', e.target.value)}>
                  <option value="all">Cả ngày</option>
                  {SLOT_RANGES.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <button className="h-10 w-10 shrink-0 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors" title="Xóa toàn bộ bộ lọc" onClick={resetFilters}>
                  <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-error font-body-sm text-body-sm">{error}</p>}

          <div className="flex items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-on-surface">{filtered.length} lớp học</span>
              <span>được tìm thấy trong tuần này</span>
            </div>
          </div>

          <div className={`space-y-10 ${loading ? 'opacity-50' : ''}`}>
            {byDate.map(([date, items]) => (
              <section key={date} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-6 rounded-full ${date === today ? 'bg-primary' : 'bg-secondary'}`}></div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{dayHeading(date, today, tomorrow)}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">{items.length} lớp</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {items.map((s) => {
                    const c = sportColor(s.sport)
                    const booked = bookedIds.has(s.id)
                    const full = s.remainingSeats <= 0
                    return (
                      <div key={s.id} className="class-card group bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5" style={{ borderLeft: `4px solid ${c.border}` }}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:w-5/12">
                          <div className="shrink-0 space-y-0.5 sm:text-center sm:min-w-[100px] sm:pr-4 sm:border-r sm:border-surface-container-high">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold block">{fromTimeOnly(s.startTime)}</span>
                            <span className="font-label-sm text-label-sm text-secondary block">{fromTimeOnly(s.endTime)}</span>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">{slotOf(s.startTime)}</span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold tracking-tight" style={{ backgroundColor: c.bg, color: c.text }}>{s.sport}</span>
                              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{LEVEL_LABEL[s.level]}</span>
                            </div>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">{s.className}</h3>
                            <div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
                              <span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
                              <span>{s.room}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 lg:w-4/12">
                          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold shrink-0">
                            {initials(s.coach)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">Huấn luyện viên</span>
                            <p className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">{s.coach ?? 'Chưa phân công'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-surface-container-low">
                          <div className="text-left lg:text-right">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md font-bold"
                              style={full ? { backgroundColor: '#FEE2E2', color: '#B91C1C' } : s.remainingSeats <= 3 ? { backgroundColor: '#FEF3C7', color: '#B45309' } : { backgroundColor: '#DCFCE7', color: '#15803D' }}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: full ? '#DC2626' : s.remainingSeats <= 3 ? '#F59E0B' : '#16A34A' }}></span>
                              {full ? 'Hết chỗ' : `Còn ${s.remainingSeats} chỗ`}
                            </span>
                            <span className="block mt-1 font-label-sm text-label-sm text-secondary">Đã đặt: {s.capacity - s.remainingSeats}/{s.capacity}</span>
                          </div>
                          <button
                            className={`h-10 px-5 rounded-lg font-label-lg text-label-lg transition-all shadow-sm flex items-center gap-1.5 active:scale-95 ${booked ? 'bg-surface-container text-on-surface-variant' : full ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-primary-container text-on-primary hover:bg-primary'}`}
                            disabled={booked || full || busyId === s.id}
                            onClick={() => book(s)}
                          >
                            <span>{booked ? 'Đã đăng ký' : full ? 'Hết chỗ' : busyId === s.id ? 'Đang đặt…' : 'Đăng ký'}</span>
                            {!booked && !full && <span className="material-symbols-outlined text-[18px]">{busyId === s.id ? 'hourglass_top' : 'arrow_forward'}</span>}
                            {booked && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          {!loading && !byDate.length && (
            <div className="bg-surface-container-lowest rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm my-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[44px]">event_busy</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">Không tìm thấy lớp học phù hợp</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed max-w-md mx-auto">
                Không có lớp học nào khớp với bộ lọc đã chọn trong tuần này. Vui lòng thử tuần khác hoặc xóa bộ lọc.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button className="h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm flex items-center gap-2" onClick={resetFilters}>
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-r from-primary-container to-primary p-8 sm:p-10 text-on-primary shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[180px]">sports_gymnastics</span>
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">health_and_safety</span>
                  <span>Tư vấn lộ trình cá nhân hóa</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-white tracking-tight">Chưa biết bắt đầu với bộ môn nào?</h2>
                <p className="font-body-md text-body-md text-white/90 leading-relaxed">
                  Đội ngũ chuyên gia FitZone sẽ hỗ trợ đo chỉ số cơ thể InBody miễn phí 100%, tư vấn lớp học khoa học phù hợp nhất với thể trạng của bạn.
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0">
                <button className="w-full sm:w-auto h-11 px-5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-label-lg text-label-lg transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                  <span>Đo InBody miễn phí</span>
                </button>
                <a className="w-full sm:w-auto h-11 px-5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2 backdrop-blur-sm" href="tel:19008888">
                  <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  <span>Gọi hotline 1900 8888</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-sm ${toast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">check</span>
          </div>
          <div className="text-left">
            <p className="font-label-lg text-label-lg font-bold">{toast?.title}</p>
            <p className="font-body-sm text-body-sm text-surface-variant/80">{toast?.desc}</p>
          </div>
        </div>
      </div>
    </>
  )
}
