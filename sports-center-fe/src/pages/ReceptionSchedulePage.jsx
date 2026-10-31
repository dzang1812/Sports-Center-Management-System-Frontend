import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Badge, Field, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import CourseScheduleCalendar from '../components/CourseScheduleCalendar'
import { addDays, toDateOnly } from '../dateUtils'
import { LEVEL_LABEL } from '../labels'

// Read-only course schedule for the front desk, without selecting a member first.
const DEFAULT_FILTERS = (today) => ({ sportId: '', level: '', from: today, to: addDays(today, 7) })

export default function ReceptionSchedulePage() {
  const today = toDateOnly(new Date())
  const [filters, setFilters] = useState(DEFAULT_FILTERS(today))
  const [sports, setSports] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailError, setDetailError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(null)
  const detailRequest = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    api('/sports', { signal: controller.signal }).then((list) => {
      if (!controller.signal.aborted) setSports(list.filter((s) => s.hasClasses))
    }).catch(() => {})
    return () => { controller.abort(); detailRequest.current?.abort() }
  }, [])

  const load = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await api('/courses', { signal: controller.signal })
      // The catalog contains one row per course; dates filter the full course period.
      const items = result.filter(({ course: c }) =>
        (!filters.sportId || String(c.sportId) === filters.sportId) &&
        (!filters.level || c.level === filters.level) &&
        (!filters.from || (c.lastSessionDate ?? c.endDate) >= filters.from) &&
        (!filters.to || (c.firstSessionDate ?? c.startDate) <= filters.to))
      if (!controller.signal.aborted) setCourses(items)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }, [filters])

  useEffect(() => {
    load()
    return () => request.current?.abort()
  }, [load])

  const setFilter = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })
  const viewSchedule = async course => {
    detailRequest.current?.abort()
    const controller = new AbortController()
    detailRequest.current = controller
    setSelectedCourse(course); setDetail(null); setDetailError('')
    try {
      const result = await api(`/courses/${course.id}`, { signal: controller.signal })
      if (!controller.signal.aborted) setDetail(result)
    } catch (err) { if (!controller.signal.aborted) setDetailError(err.message) }
  }
  const closeSchedule = () => { detailRequest.current?.abort(); setSelectedCourse(null) }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Lịch khóa học trung tâm</h1>
        <p className="text-secondary">Mỗi khóa học hiển thị một dòng. Lọc theo thời gian diễn ra toàn khóa, bấm “Xem lịch” để xem từng buổi.</p>
      </div>

      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Bộ môn">
            <select className={inputCls} value={filters.sportId} onChange={setFilter('sportId')}>
              <option value="">— Tất cả —</option>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Cấp độ">
            <select className={inputCls} value={filters.level} onChange={setFilter('level')}>
              <option value="">— Tất cả —</option>
              {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Từ ngày">
            <input className={inputCls} type="date" value={filters.from} onChange={setFilter('from')} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={filters.to} onChange={setFilter('to')} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" className={btnOutline} onClick={() => setFilters(DEFAULT_FILTERS(today))}>Đặt lại</button>
          <button type="button" className={btnPrimary} onClick={load}>Tìm kiếm</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">STT</th>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3">Thời gian toàn khóa</th>
              <th className="px-4 py-3">Phòng</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Chỗ trống</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {courses.map(({ course: c, canEnroll }, i) => (
              <tr key={c.id} className="border-t border-surface-container">
                <td className="px-4 py-3 text-secondary">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.name}</div>
                  <Badge tone="indigo">{LEVEL_LABEL[c.level]}</Badge>
                  <p className="text-secondary text-body-sm mt-1">{Number(c.courseFee).toLocaleString('vi-VN')}đ / toàn khóa</p>
                </td>
                <td className="px-4 py-3 text-secondary">{c.firstSessionDate ?? c.startDate} → {c.lastSessionDate ?? c.endDate}<p className="text-body-sm">{c.durationWeeks} tuần • {c.expectedSessions} buổi</p></td>
                <td className="px-4 py-3 text-secondary">{c.room}</td>
                <td className="px-4 py-3 text-secondary">{c.coach ?? '—'}</td>
                <td className="px-4 py-3 text-secondary">{Math.max(0, c.capacity - c.enrolled)}/{c.capacity}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" className={btnOutline + ' !h-9'} onClick={() => viewSchedule(c)}>Xem lịch</button>
                    {canEnroll ? <Link to="/reception/classes" className={btnOutline + ' !h-9'}>Đăng ký khóa học</Link>
                      : <button type="button" className={btnOutline + ' !h-9'} disabled>Đã đóng / hết chỗ</button>}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !courses.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Không có khóa học phù hợp trong khoảng thời gian này.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedCourse && <Modal size="wide" title={`Lịch toàn khóa — ${selectedCourse.name}`} onClose={closeSchedule}>
        {!detail && !detailError && <p role="status">Đang tải lịch khóa học…</p>}
        {detailError && <Alert>{detailError}</Alert>}
        {detail && <div className="space-y-3">
          <p>{detail.expectedSessions} buổi • {Number(detail.courseFee).toLocaleString('vi-VN')}đ / toàn khóa</p>
          <CourseScheduleCalendar key={detail.id} title={detail.name} sessions={detail.sessions} />
        </div>}
        <div className="flex justify-end mt-4"><button type="button" className={btnOutline} onClick={closeSchedule}>Đóng</button></div>
      </Modal>}
    </div>
  )
}
