import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { formatDate } from '../dateUtils'
import ExerciseDetailModal from '../components/ExerciseDetail'
import { Alert, Badge, Field, Icon, Modal, Toast, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { DAYS, DayCard, ExercisePicker, WeekCalendar, toDraft } from './MemberTrainingPage'

const newDraft = (memberId = '') => ({ id: null, target: 'member', memberId: String(memberId), classId: '', title: '', goal: '', description: '',
  startDate: '', endDate: '', activate: true, days: {} })
const fromPlan = (p) => ({ ...toDraft(p), target: p.classId ? 'class' : 'member', memberId: String(p.memberId ?? ''), classId: String(p.classId ?? ''),
  memberName: p.memberName, className: p.className, description: p.description ?? '', startDate: p.startDate ?? '', endDate: p.endDate ?? '', activate: p.isActive })
const targetLabel = (p) => (p.classId ? `Lớp ${p.className}` : `Cá nhân · ${p.memberName}`)

function PlanEditor({ draft, setDraft, students, classes, onSaved, onDeleted, onCancel }) {
  const [editing, setEditing] = useState(null)
  const [picking, setPicking] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const setDay = (key, day) => setDraft((d) => { const days = { ...d.days }; if (day) days[key] = day; else delete days[key]; return { ...d, days } })

  const save = async () => {
    const sessions = DAYS.filter(([k]) => draft.days[k]).map(([k]) => ({
      dayOfWeek: k, focus: draft.days[k].focus,
      items: draft.days[k].items.map((i) => ({ exerciseId: i.exerciseId, sets: i.sets, reps: i.reps, notes: i.notes ?? null })),
    }))
    if (!draft.id && !(draft.target === 'member' ? draft.memberId : draft.classId)) return setError(draft.target === 'member' ? 'Chọn học viên.' : 'Chọn lớp.')
    if (!draft.title.trim()) return setError('Đặt tên cho kế hoạch.')
    if (!sessions.length) return setError('Thêm ít nhất một buổi tập.')
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) return setError('Ngày kết thúc phải sau ngày bắt đầu.')
    setBusy(true); setError('')
    try {
      const body = {
        title: draft.title.trim(), goal: draft.goal.trim() || null, description: draft.description.trim() || null, activate: draft.activate,
        startDate: draft.startDate || null, endDate: draft.endDate || null, sessions,
        ...(!draft.id && (draft.target === 'member' ? { memberId: Number(draft.memberId) } : { classId: Number(draft.classId) })),
      }
      onSaved(await api(draft.id ? `/coach/training-plans/${draft.id}` : '/coach/training-plans', { method: draft.id ? 'PUT' : 'POST', body }))
    } catch (err) { setError(err.message) }
    setBusy(false)
  }

  const remove = async () => {
    if (!window.confirm('Xoá kế hoạch này? Học viên sẽ không còn thấy nó.')) return
    setBusy(true); setError('')
    try { await api(`/coach/training-plans/${draft.id}`, { method: 'DELETE' }); onDeleted(draft.id) } catch (err) { setError(err.message); setBusy(false) }
  }

  const showDetail = async (id) => {
    try { setDetail((await api('/exercises')).find((e) => e.id === id) ?? null) } catch (err) { setError(err.message) }
  }

  const label = editing && DAYS.find(([k]) => k === editing)[1]
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/50 bg-white p-4 sm:p-5" aria-label={draft.id ? 'Sửa kế hoạch' : 'Kế hoạch mới'}>
      <h2 className="font-semibold text-lg">{draft.id ? 'Sửa kế hoạch' : 'Kế hoạch mới'}</h2>
      {error && <Alert>{error}</Alert>}
      {draft.id ? (
        <p className="text-body-sm"><b>Áp dụng cho:</b> {draft.target === 'class' ? `Lớp ${draft.className}` : `Học viên ${draft.memberName}`}</p>
      ) : (
        <div className="grid sm:grid-cols-[auto_1fr] gap-3 items-end">
          <div role="radiogroup" aria-label="Áp dụng cho" className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit h-fit">
            {[['member', 'Một học viên'], ['class', 'Cả lớp']].map(([v, l]) => (
              <button key={v} type="button" role="radio" aria-checked={draft.target === v} onClick={() => set({ target: v })}
                className={`px-3 py-2 rounded-lg text-label-md ${draft.target === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant'}`}>{l}</button>
            ))}
          </div>
          {draft.target === 'member' ? (
            <Field label="Học viên">
              <select className={inputCls} value={draft.memberId} onChange={(e) => set({ memberId: e.target.value })}>
                <option value="">— Chọn học viên —</option>
                {students.map((s) => <option key={s.memberId} value={s.memberId}>{s.fullName} (#{s.memberId})</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Lớp">
              <select className={inputCls} value={draft.classId} onChange={(e) => set({ classId: e.target.value })}>
                <option value="">— Chọn lớp —</option>
                {classes.map((c) => <option key={c.classId} value={c.classId}>{c.name}{c.sport ? ` · ${c.sport}` : ''}</option>)}
              </select>
            </Field>
          )}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Tên kế hoạch"><input className={inputCls} maxLength={100} value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="vd: Giảm mỡ 4 tuần" /></Field>
        <Field label="Mục tiêu (không bắt buộc)"><input className={inputCls} maxLength={100} value={draft.goal} onChange={(e) => set({ goal: e.target.value })} /></Field>
        <Field label="Ngày bắt đầu" hint="Bỏ trống = hôm nay"><input className={inputCls} type="date" value={draft.startDate} onChange={(e) => set({ startDate: e.target.value })} /></Field>
        <Field label="Ngày kết thúc (không bắt buộc)"><input className={inputCls} type="date" value={draft.endDate} onChange={(e) => set({ endDate: e.target.value })} /></Field>
      </div>
      <Field label="Ghi chú cho học viên (không bắt buộc)">
        <textarea className={inputCls + ' !h-20 py-2'} maxLength={500} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
      </Field>
      <label className="flex items-center gap-2 text-body-sm w-fit"><input type="checkbox" checked={draft.activate} onChange={(e) => set({ activate: e.target.checked })} /> Đang áp dụng (học viên thấy kế hoạch là đang dùng)</label>

      <WeekCalendar days={draft.days} onOpen={setEditing} />
      <p className="text-body-sm text-secondary -mt-2">Bấm vào một ngày để thêm/sửa bài tập.</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} disabled={busy} onClick={save}>{busy ? 'Đang lưu…' : draft.id ? 'Lưu thay đổi' : 'Tạo kế hoạch'}</button>
        <button type="button" className={btnOutline} disabled={busy} onClick={onCancel}>Huỷ</button>
        {draft.id && <button type="button" className={btnOutline + ' !text-error ml-auto'} disabled={busy} onClick={remove}><Icon name="delete" className="text-base" />Xoá</button>}
      </div>

      {editing && !picking && (
        <Modal title={`Buổi tập ${label}`} onClose={() => setEditing(null)}>
          <DayCard label={label} day={draft.days[editing]} onChange={(d) => setDay(editing, d)} onAdd={() => setPicking(editing)} onDetail={showDetail} />
        </Modal>
      )}
      {picking && <ExercisePicker onClose={() => setPicking(null)} onPick={(e) => {
        setDay(picking, { ...draft.days[picking], items: [...draft.days[picking].items, { exerciseId: e.id, exerciseName: e.name, imageUrl: e.imageUrl, sets: e.defaultSets ?? 3, reps: e.defaultReps ?? '10' }] })
        setPicking(null)
      }} />}
      {detail && <ExerciseDetailModal exercise={detail} onClose={() => setDetail(null)} />}
    </section>
  )
}

// Coach-made weekly plans for one student or a whole class; members see them read-only on "Tự tập".
export default function CoachPlansPage() {
  const [params, setParams] = useSearchParams()
  const [plans, setPlans] = useState(null)
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    Promise.all([api('/coach/training-plans'), api('/coach/students'), api('/coach/classes')])
      .then(([p, s, c]) => { setPlans(p); setStudents(s); setClasses(c) })
      .catch((err) => setError(err.message))
  }, [])

  // Deep links from "Học viên của tôi": ?planId= opens a plan, ?memberId= starts a plan for that student.
  useEffect(() => {
    if (!plans) return
    const planId = Number(params.get('planId')), memberId = params.get('memberId')
    const plan = planId && plans.find((p) => p.id === planId)
    if (plan) setDraft(fromPlan(plan))
    else if (memberId) setDraft(newDraft(memberId))
    if (planId || memberId) setParams({}, { replace: true })
  }, [plans, params, setParams])

  const saved = (plan) => {
    setPlans((list) => [plan, ...list.filter((p) => p.id !== plan.id)])
    setDraft(null); setToast('Đã lưu kế hoạch')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Kế hoạch tập</h1>
          <p className="text-secondary">Lập lịch tập theo tuần cho một học viên hoặc cả lớp. Học viên xem được nhưng không sửa được.</p>
        </div>
        {!draft && <button type="button" className={btnPrimary} onClick={() => setDraft(newDraft())}><Icon name="add" className="text-lg" />Kế hoạch mới</button>}
      </div>
      {error && <Alert>{error}</Alert>}
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}
      {draft && <PlanEditor key={draft.id ?? 'new'} draft={draft} setDraft={setDraft} students={students} classes={classes} onSaved={saved}
        onDeleted={(id) => { setPlans((list) => list.filter((p) => p.id !== id)); setDraft(null); setToast('Đã xoá kế hoạch') }} onCancel={() => setDraft(null)} />}
      {!plans && !error && <p role="status" className="text-secondary">Đang tải…</p>}
      {plans && !plans.length && !draft && <p className="text-secondary py-6">Bạn chưa lập kế hoạch nào.</p>}
      {plans && plans.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <button key={p.id} type="button" onClick={() => setDraft(fromPlan(p))}
              className={`text-left rounded-xl border bg-white p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow ${draft?.id === p.id ? 'border-primary-container' : 'border-outline-variant/50'}`}>
              <div className="flex flex-wrap items-center gap-2"><b>{p.title}</b><Badge tone={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Đang áp dụng' : 'Tạm ngưng'}</Badge></div>
              <span className="text-body-sm">{targetLabel(p)}</span>
              <span className="text-body-sm text-secondary">{p.daysPerWeek} buổi/tuần{p.startDate ? ` · từ ${formatDate(p.startDate)}` : ''}{p.endDate ? ` đến ${formatDate(p.endDate)}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
