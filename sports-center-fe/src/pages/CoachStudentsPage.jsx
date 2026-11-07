import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { formatDate } from '../dateUtils'
import { profileFacts } from '../labels'
import { EvaluationList, ResultsBySession } from '../components/TrainingFeedback'
import { Alert, Badge, Field, Icon, Modal, btnPrimary, inputCls } from '../components/ui'

const Facts = ({ profile }) => (
  <div className="flex flex-wrap gap-1.5">
    {profileFacts(profile).map((fact) => <span key={fact} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[12px]">{fact}</span>)}
    {!profileFacts(profile).length && <span className="text-body-sm text-secondary">Chưa cập nhật hồ sơ</span>}
  </div>
)

function EvaluationForm({ memberId, onAdded }) {
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return setError('Nhập nhận xét trước khi lưu.')
    setBusy(true); setError('')
    try {
      onAdded(await api(`/coach/students/${memberId}/evaluations`, { method: 'POST', body: { score: score ? Number(score) : null, comment: comment.trim() } }))
      setScore(''); setComment('')
    } catch (err) { setError(err.message) }
    setBusy(false)
  }
  return (
    <form onSubmit={submit} className="rounded-xl border border-outline-variant/60 p-4 flex flex-col gap-3" aria-label="Thêm đánh giá">
      <h3 className="font-semibold">Thêm đánh giá</h3>
      {error && <Alert>{error}</Alert>}
      <Field label="Điểm (không bắt buộc)">
        <select className={inputCls} value={score} onChange={(e) => setScore(e.target.value)}>
          <option value="">Không chấm điểm</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}/10</option>)}
        </select>
      </Field>
      <Field label="Nhận xét">
        <textarea className={inputCls + ' !h-28 py-2'} maxLength={2000} value={comment} onChange={(e) => { setComment(e.target.value); setError('') }} placeholder="Tiến bộ, điểm cần cải thiện, mục tiêu tuần tới…" />
      </Field>
      <div className="flex justify-end"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu đánh giá'}</button></div>
    </form>
  )
}

function StudentDetail({ student, onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const id = student.memberId
    Promise.all([api(`/coach/training-plans${query({ memberId: id })}`, { signal: controller.signal }), api(`/coach/students/${id}/results`, { signal: controller.signal }),
      api(`/coach/students/${id}/evaluations`, { signal: controller.signal })])
      .then(([plans, results, evaluations]) => setData({ plans, results, evaluations }))
      .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [student])

  return (
    <Modal title={`${student.fullName} #${student.memberId}`} size="wide" onClose={onClose}>
      <div className="flex flex-col gap-5 max-w-5xl mx-auto">
        <section className="flex flex-col gap-2" aria-label="Hồ sơ">
          <p className="text-body-sm text-secondary">{student.email}</p>
          <Facts profile={student.profile} />
        </section>
        {error && <Alert>{error}</Alert>}
        {!data && !error && <p role="status" className="text-secondary">Đang tải…</p>}
        {data && <>
          <section className="flex flex-col gap-2" aria-label="Kế hoạch tập">
            <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-lg">Kế hoạch tập</h3>
              <Link className="text-primary text-body-sm font-semibold" to={`/coach/plans?memberId=${student.memberId}`}>Lập kế hoạch mới →</Link></div>
            {!data.plans.length && <p className="text-body-sm text-secondary">Bạn chưa lập kế hoạch riêng cho học viên này.</p>}
            {data.plans.map((p) => (
              <Link key={p.id} to={`/coach/plans?planId=${p.id}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant/50 p-3 hover:bg-surface-container-low">
                <b>{p.title}</b>
                <Badge tone={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Đang áp dụng' : 'Tạm ngưng'}</Badge>
                <span className="text-body-sm text-secondary">{p.daysPerWeek} buổi/tuần{p.startDate ? ` · từ ${formatDate(p.startDate)}` : ''}{p.endDate ? ` đến ${formatDate(p.endDate)}` : ''}</span>
              </Link>
            ))}
          </section>
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr] items-start">
            <section className="flex flex-col gap-3" aria-label="Lịch sử kết quả"><h3 className="font-semibold text-lg">Lịch sử kết quả</h3><ResultsBySession results={data.results} /></section>
            <section className="flex flex-col gap-3" aria-label="Đánh giá">
              <h3 className="font-semibold text-lg">Đánh giá</h3>
              <EvaluationForm memberId={student.memberId} onAdded={(e) => setData((d) => ({ ...d, evaluations: [e, ...d.evaluations] }))} />
              <EvaluationList evaluations={data.evaluations} />
            </section>
          </div>
        </>}
      </div>
    </Modal>
  )
}

// Members the coach teaches (class bookings, course enrollments, PT bookings).
export default function CoachStudentsPage() {
  const [q, setQ] = useState('')
  const [students, setStudents] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const t = setTimeout(() => {
      api(`/coach/students${query({ q: q.trim() })}`, { signal: controller.signal })
        .then((list) => { setStudents(list); setError('') })
        .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
    }, 250)
    return () => { clearTimeout(t); controller.abort() }
  }, [q])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Học viên của tôi</h1>
        <p className="text-secondary">Hội viên học lớp, khóa hoặc PT với bạn. Bấm vào một người để xem hồ sơ, kết quả và đánh giá.</p>
      </div>
      <div className="relative max-w-md">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
        <input className={inputCls + ' pl-10'} placeholder="Tìm theo tên, email, số điện thoại" aria-label="Tìm học viên" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {error && <Alert>{error}</Alert>}
      {!students && !error && <p role="status" className="text-secondary">Đang tải…</p>}
      {students && !students.length && <p className="text-secondary py-6">{q.trim() ? 'Không tìm thấy học viên phù hợp.' : 'Bạn chưa có học viên nào.'}</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {students?.map((s) => (
          <button key={s.memberId} type="button" onClick={() => setSelected(s)} className="text-left rounded-xl border border-outline-variant/50 bg-white p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
            <div><div className="font-semibold">{s.fullName} <span className="text-secondary font-normal">#{s.memberId}</span></div><div className="text-body-sm text-secondary truncate">{s.email}</div></div>
            <Facts profile={s.profile} />
          </button>
        ))}
      </div>
      {selected && <StudentDetail key={selected.memberId} student={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
