import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { addDays, formatDate, toDateOnly, weekRange } from '../dateUtils'
import { AiGenerateModal, AiMediaModal } from '../components/AiAssistant'
import ExerciseDetailModal from '../components/ExerciseDetail'
import { Alert, Badge, Field, Icon, Modal, Toast, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { coachLabel } from '../labels'

const ExerciseGuideModal = lazy(() => import('../components/ExerciseGuide'))

export const DAYS = [
  ['Monday', 'Thứ 2'],
  ['Tuesday', 'Thứ 3'],
  ['Wednesday', 'Thứ 4'],
  ['Thursday', 'Thứ 5'],
  ['Friday', 'Thứ 6'],
  ['Saturday', 'Thứ 7'],
  ['Sunday', 'Chủ nhật'],
]

const emptyDraft = () => ({ id: null, title: '', goal: '', days: {} })

// Server plan -> editable draft: one entry per training day, rest days are simply absent.
// A coach-made plan (coachId set) keeps the plan in `coach` and is shown read-only.
export const toDraft = (plan) => ({
  id: plan.id,
  coach: plan.coachId ? plan : null,
  title: plan.title,
  goal: plan.goal ?? '',
  days: Object.fromEntries(
    plan.sessions.map((s) => [s.dayOfWeek, { focus: s.focus, items: s.items.map((i) => ({ ...i, sets: i.sets ?? 3, reps: i.reps ?? '10' })) }]),
  ),
})

function Thumb({ src, name }) {
  return src ? (
    <img src={src} alt={name} loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-surface-container" />
  ) : (
    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
      <Icon name="fitness_center" className="text-outline" />
    </div>
  )
}

export function ExercisePicker({ onPick, onClose }) {
  const [groups, setGroups] = useState([])
  const [group, setGroup] = useState('')
  const [q, setQ] = useState('')
  const [list, setList] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    api('/exercises/muscle-groups').then(setGroups).catch(() => {})
  }, [])
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams()
      if (group) params.set('muscleGroup', group)
      if (q.trim()) params.set('q', q.trim())
      api(`/exercises?${params}`).then(setList).catch(() => setList([]))
    }, 250)
    return () => clearTimeout(t)
  }, [group, q])

  return (
    <Modal title="Chọn bài tập" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          <input className={`${inputCls} flex-1 min-w-40`} placeholder="Tìm bài tập…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Tất cả nhóm cơ</option>
            {groups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        {list === null && <p className="text-secondary text-center">Đang tải…</p>}
        {list?.length === 0 && <p className="text-secondary text-center">Chưa có bài tập nào. Nhờ quản lý nạp thư viện bài tập.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {list?.map((e) => (
            <div key={e.id} className="relative">
            <button
              type="button"
              onClick={() => onPick(e)}
              className="w-full text-left rounded-xl border border-outline-variant overflow-hidden hover:border-primary-container hover:shadow-sm transition"
            >
              {e.imageUrl ? (
                <img src={e.imageUrl} alt={e.name} loading="lazy" className="w-full h-28 object-cover bg-surface-container" />
              ) : (
                <div className="w-full h-28 bg-surface-container flex items-center justify-center">
                  <Icon name="fitness_center" className="text-3xl text-outline" />
                </div>
              )}
              <div className="p-2">
                <p className="font-label-md text-label-md text-on-surface leading-tight">{e.name}</p>
                <p className="text-body-sm text-secondary">{e.muscleGroup}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDetail(e)}
              title="Xem chi tiết"
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-primary-container hover:bg-white"
            >
              <Icon name="info" className="text-[18px]" />
            </button>
            </div>
          ))}
        </div>
        {detail && <ExerciseDetailModal exercise={detail} onClose={() => setDetail(null)} />}
      </div>
    </Modal>
  )
}

export function DayCard({ label, day, onChange, onAdd, onDetail, onGuide }) {
  if (!day)
    return (
      <div className="rounded-xl border border-dashed border-outline-variant p-4 flex flex-col gap-2 bg-surface-container-lowest">
        <p className="font-label-md text-label-md text-on-surface">{label}</p>
        <p className="text-body-sm text-secondary">Ngày nghỉ</p>
        <button className={btnOutline} onClick={() => onChange({ focus: '', items: [] })}>
          <Icon name="add" className="text-[18px]" /> Thêm buổi tập
        </button>
      </div>
    )
  const setItem = (idx, patch) => onChange({ ...day, items: day.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) })
  return (
    <div className="rounded-xl border border-outline-variant p-4 flex flex-col gap-3 bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-2">
        <p className="font-label-md text-label-md text-on-surface">{label}</p>
        <button className="text-secondary hover:text-error" title="Chuyển thành ngày nghỉ" onClick={() => onChange(null)}>
          <Icon name="bedtime" className="text-[20px]" />
        </button>
      </div>
      <input className={inputCls} placeholder="Trọng tâm (vd: Ngực + Tay sau)" maxLength={100} value={day.focus} onChange={(e) => onChange({ ...day, focus: e.target.value })} />
      {day.items.map((it, idx) => (
        <div key={`${it.exerciseId}-${idx}`} className="flex items-center gap-2">
          <button type="button" onClick={() => onDetail(it.exerciseId)} title="Xem chi tiết" className="shrink-0">
            <Thumb src={it.imageUrl} name={it.exerciseName} />
          </button>
          <div className="flex-1 min-w-0">
            <button type="button" onClick={() => onDetail(it.exerciseId)} className="text-body-sm font-semibold truncate max-w-full text-left hover:underline">
              {it.exerciseName}
            </button>
            <div className="flex items-center gap-1 text-body-sm">
              <input type="number" min={1} max={20} className={`${inputCls} !w-14 !py-1`} value={it.sets} onChange={(e) => setItem(idx, { sets: Number(e.target.value) })} />
              <span>hiệp ×</span>
              <input className={`${inputCls} !w-16 !py-1`} maxLength={20} value={it.reps} onChange={(e) => setItem(idx, { reps: e.target.value })} />
              <span>lần</span>
            </div>
            {onGuide && <button type="button" onClick={() => onGuide(it)} aria-label={`Hướng dẫn ${it.exerciseName}`}
              className="mt-1 inline-flex items-center gap-1 text-body-sm font-semibold text-primary-container hover:underline">
              <Icon name="play_circle" className="text-[16px]" /> Hướng dẫn
            </button>}
          </div>
          <button className="text-secondary hover:text-error" title="Xóa bài" onClick={() => onChange({ ...day, items: day.items.filter((_, i) => i !== idx) })}>
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
      ))}
      <button className={btnOutline} onClick={onAdd}>
        <Icon name="add" className="text-[18px]" /> Thêm bài tập
      </button>
    </div>
  )
}

// The plan repeats weekly; the calendar just pins its days onto real dates so members see "today".
export function WeekCalendar({ days, onOpen, readOnly = false }) {
  const [weekStart, setWeekStart] = useState(() => weekRange()[0])
  const today = toDateOnly()
  const trainingDays = DAYS.filter(([k]) => days[k]).length
  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-sm" aria-label="Lịch tập theo tuần">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Tuần trước" className={btnOutline + ' !h-9 !w-9 !p-0'} onClick={() => setWeekStart(addDays(weekStart, -7))}><Icon name="chevron_left" className="text-xl" /></button>
            <button type="button" className={btnOutline + ' !h-9 !px-3'} onClick={() => setWeekStart(weekRange()[0])}>Hôm nay</button>
            <button type="button" aria-label="Tuần sau" className={btnOutline + ' !h-9 !w-9 !p-0'} onClick={() => setWeekStart(addDays(weekStart, 7))}><Icon name="chevron_right" className="text-xl" /></button>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">{formatDate(weekStart, { day: '2-digit', month: '2-digit' })} – {formatDate(addDays(weekStart, 6), { day: '2-digit', month: '2-digit', year: 'numeric' })}</h2>
        </div>
        <span className="text-body-sm text-slate-600"><b className="text-slate-800">{trainingDays}</b> buổi tập · {7 - trainingDays} ngày nghỉ</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7">
        {DAYS.map(([key, label], index) => {
          const date = addDays(weekStart, index)
          const isToday = date === today
          const day = days[key]
          const Cell = readOnly ? 'div' : 'button'
          return (
            <Cell key={key} {...(readOnly ? {} : { type: 'button', onClick: () => onOpen(key), 'aria-label': `${label}, ${formatDate(date)}: ${day ? `${day.items.length} bài tập` : 'ngày nghỉ'}. Bấm để sửa` })}
              className={`group min-w-0 flex flex-col text-left border-b border-r border-slate-200 transition-colors ${readOnly ? '' : 'hover:bg-slate-50'} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:last:col-span-2 xl:last:col-span-1 xl:border-b-0 xl:last:border-r-0 ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
              <div className={`w-full flex items-center justify-between gap-1 border-b px-2 py-3 ${isToday ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100'}`}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span aria-current={isToday ? 'date' : undefined} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold ${isToday ? 'bg-primary-container text-white' : 'text-slate-800'}`}>{Number(date.slice(8))}</span>
                  <div>
                    <span className={`block text-body-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700'}`}>{label}</span>
                    <p className="text-[10px] text-slate-500">{isToday ? 'Hôm nay' : formatDate(date, { day: '2-digit', month: '2-digit' })}</p>
                  </div>
                </div>
                {!readOnly && <Icon name="edit" className="text-base text-slate-300 group-hover:text-primary-container" />}
              </div>
              {day ? (
                <div className="w-full flex-1 space-y-2 p-2 xl:min-h-48">
                  <div className="rounded-lg border-l-[3px] border-l-primary-container bg-primary-container/10 px-2.5 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-primary-container">Buổi tập · {day.items.length} bài</p>
                    <p className="break-words text-body-sm font-semibold leading-5 text-slate-900">{day.focus || 'Chưa đặt trọng tâm'}</p>
                  </div>
                  {day.items.map((it, idx) => (
                    <div key={`${it.exerciseId}-${idx}`} className="flex items-center gap-2 min-w-0">
                      {it.imageUrl ? <img src={it.imageUrl} alt="" loading="lazy" className="w-8 h-8 rounded-md object-cover shrink-0 bg-surface-container" />
                        : <span className="w-8 h-8 rounded-md bg-surface-container flex items-center justify-center shrink-0"><Icon name="fitness_center" className="text-base text-outline" /></span>}
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-slate-800">{it.exerciseName}</p>
                        <p className="text-[11px] text-slate-500">{it.sets} × {it.reps}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full flex-1 flex xl:flex-col items-center justify-center gap-1 p-3 text-center text-[12px] text-slate-400 xl:min-h-48">
                  <Icon name="bedtime" className="text-xl" /> Ngày nghỉ
                  {!readOnly && <span className="text-primary-container font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">+ Thêm buổi</span>}
                </div>
              )}
            </Cell>
          )
        })}
      </div>
    </section>
  )
}

export default function MemberTrainingPage() {
  const [guide, setGuide] = useState(null)
  const [plans, setPlans] = useState(null)
  const [draft, setDraft] = useState(null)
  const [picking, setPicking] = useState(null) // day key the picker is adding to
  const [editing, setEditing] = useState(null) // day key open in the day editor
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState(null)
  const [ai, setAi] = useState(null) // 'generate' | 'chat' | 'media'

  const load = () =>
    api('/member/training-plans')
      .then(setPlans)
      .catch((e) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  // The floating AI chat (member layout) announces plan changes it applied.
  useEffect(() => {
    const reload = () => {
      setDraft(null)
      load()
    }
    window.addEventListener('sc:plan-changed', reload)
    return () => window.removeEventListener('sc:plan-changed', reload)
  }, [])

  // Only the member's own plans are editable drafts; coach plans (coachId set) are opened read-only from the chips.
  const active = useMemo(() => plans?.find((p) => !p.coachId && p.isActive), [plans])
  useEffect(() => {
    if (plans && !draft) setDraft(active ? toDraft(active) : emptyDraft())
  }, [plans, active, draft])

  const setDay = (key, day) =>
    setDraft((d) => {
      const days = { ...d.days }
      if (day) days[key] = day
      else delete days[key]
      return { ...d, days }
    })

  const addExercise = (e) => {
    setDay(picking, {
      ...draft.days[picking],
      items: [
        ...draft.days[picking].items,
        { exerciseId: e.id, exerciseName: e.name, imageUrl: e.imageUrl, sets: e.defaultSets ?? 3, reps: e.defaultReps ?? '10' },
      ],
    })
    setPicking(null)
  }

  const save = async () => {
    const sessions = DAYS.filter(([k]) => draft.days[k]).map(([k]) => ({
      dayOfWeek: k,
      focus: draft.days[k].focus,
      items: draft.days[k].items.map((i) => ({ exerciseId: i.exerciseId, sets: i.sets, reps: i.reps })),
    }))
    if (!draft.title.trim()) return setError('Vui lòng đặt tên cho lịch tập.')
    if (sessions.length === 0) return setError('Hãy thêm ít nhất một buổi tập.')
    setError('')
    setSaving(true)
    try {
      const body = { title: draft.title, goal: draft.goal || null, activate: true, sessions }
      const saved = await api(draft.id ? `/member/training-plans/${draft.id}` : '/member/training-plans', { method: draft.id ? 'PUT' : 'POST', body })
      setDraft(toDraft(saved))
      setToast('Đã lưu lịch tập')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const act = async (fn) => {
    setError('')
    try {
      await fn()
      setDraft(null)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  // Copies the coach's plan into the member's own plans and makes it the active one.
  const useCoachPlan = async () => {
    setError('')
    try {
      const copy = await api(`/member/training-plans/${coachPlan.id}/use`, { method: 'POST' })
      await load()
      setDraft(toDraft(copy))
      setToast('Đã dùng giáo án này làm lịch tập của bạn')
    } catch (e) {
      setError(e.message)
    }
  }

  const showDetail = async (id) => {
    try {
      const all = await api('/exercises')
      setDetail(all.find((e) => e.id === id) ?? null)
    } catch (e) {
      setError(e.message)
    }
  }

  // AI apply changes the active plan server-side: reload and show it.
  const refreshAfterAi = () => {
    setDraft(null)
    load()
  }

  if (!plans || !draft) return <p className="text-secondary">{error || 'Đang tải…'}</p>
  const coachPlan = draft.coach

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Kế hoạch tự tập</h1>
        <p className="text-secondary">Xem kế hoạch HLV giao hoặc tự sắp xếp bài tập cho từng ngày trong tuần.</p>
      </div>
      {error && <Alert>{error}</Alert>}
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}

      <div className="flex gap-2 flex-wrap items-center">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setDraft(toDraft(p))}
            className={`px-3 py-1.5 rounded-lg border text-label-md flex items-center gap-2 ${draft.id === p.id ? 'border-primary-container bg-primary-container/10' : 'border-outline-variant'}`}
          >
            {p.title}
            {p.coachId ? <Badge tone="indigo">{coachLabel(p.coachName)}</Badge> : p.isActive && <Badge tone="green">Đang dùng</Badge>}
          </button>
        ))}
        <button className={btnOutline} onClick={() => setDraft(emptyDraft())}>
          <Icon name="add" className="text-[18px]" /> Lịch mới
        </button>
        <button className={btnPrimary} onClick={() => setAi('generate')}>
          <Icon name="auto_awesome" className="text-[18px]" /> Tạo lịch bằng AI
        </button>
        <button className={btnOutline} onClick={() => setAi('media')}>
          <Icon name="photo_camera" className="text-[18px]" /> Máy tập / Form tập
        </button>
      </div>

      {coachPlan ? (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex flex-col gap-1.5" aria-label="Kế hoạch do HLV lập">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-lg">{coachPlan.title}</h2>
            <Badge tone="indigo">{coachLabel(coachPlan.coachName)}</Badge>
            <Badge tone="slate">{coachPlan.classId ? `Lớp ${coachPlan.className}` : 'Cá nhân'}</Badge>
            {!coachPlan.isActive && <Badge tone="amber">Tạm ngưng</Badge>}
          </div>
          {coachPlan.goal && <p className="text-body-sm"><b>Mục tiêu:</b> {coachPlan.goal}</p>}
          {coachPlan.description && <p className="text-body-sm text-secondary whitespace-pre-line">{coachPlan.description}</p>}
          {(coachPlan.startDate || coachPlan.endDate) && <p className="text-body-sm text-secondary">Áp dụng {coachPlan.startDate ? `từ ${formatDate(coachPlan.startDate)}` : ''}{coachPlan.endDate ? ` đến ${formatDate(coachPlan.endDate)}` : ''}</p>}
          <p className="text-body-sm text-secondary">Kế hoạch do huấn luyện viên lập nên bản gốc chỉ xem được. Bấm "Dùng giáo án này" để áp dụng: bạn sẽ có một bản riêng đang dùng, có thể chỉnh sửa.</p>
          <div className="pt-1"><button className={btnPrimary} onClick={useCoachPlan}>Dùng giáo án này</button></div>
        </section>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Tên lịch tập">
            <input className={inputCls} maxLength={100} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="vd: Tăng cơ 4 buổi/tuần" />
          </Field>
          <Field label="Mục tiêu (không bắt buộc)">
            <input className={inputCls} maxLength={100} value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })} />
          </Field>
        </div>
      )}

      <WeekCalendar days={draft.days} onOpen={setEditing} readOnly={!!coachPlan} />
      {!coachPlan && <p className="text-body-sm text-secondary -mt-2">Bấm vào một ngày để thêm/sửa bài tập. Nhớ bấm lưu sau khi chỉnh.</p>}

      {!coachPlan && <div className="flex gap-2 flex-wrap">
        <button className={btnPrimary} onClick={save} disabled={saving}>
          {saving ? 'Đang lưu…' : draft.id ? 'Lưu thay đổi' : 'Tạo lịch tập'}
        </button>
        {draft.id && !plans.find((p) => p.id === draft.id)?.isActive && (
          <button className={btnOutline} onClick={() => act(() => api(`/member/training-plans/${draft.id}/activate`, { method: 'POST' }))}>
            Dùng lịch này
          </button>
        )}
        {draft.id && (
          <button
            className={btnOutline}
            onClick={() => window.confirm('Xóa lịch tập này?') && act(() => api(`/member/training-plans/${draft.id}`, { method: 'DELETE' }))}
          >
            Xóa
          </button>
        )}
      </div>}

      {ai === 'generate' && <AiGenerateModal onClose={() => setAi(null)} onApplied={refreshAfterAi} />}
      {ai === 'media' && <AiMediaModal onClose={() => setAi(null)} />}
      {detail && <ExerciseDetailModal exercise={detail} onClose={() => setDetail(null)} />}
      {guide && <Suspense fallback={<Modal title="Hướng dẫn tập" onClose={() => setGuide(null)}><p role="status">Đang mở hướng dẫn…</p></Modal>}>
        <ExerciseGuideModal key={guide.exerciseId} exercise={guide} onClose={() => setGuide(null)} />
      </Suspense>}
      {/* Hidden while the picker is open so only one dialog holds focus; it reopens after a pick. */}
      {editing && !picking && (
        <Modal title={`Buổi tập ${DAYS.find(([k]) => k === editing)[1]}`} onClose={() => setEditing(null)}>
          <DayCard label={DAYS.find(([k]) => k === editing)[1]} day={draft.days[editing]} onChange={(d) => setDay(editing, d)} onAdd={() => setPicking(editing)} onDetail={showDetail} onGuide={setGuide} />
        </Modal>
      )}
      {picking && <ExercisePicker onPick={addExercise} onClose={() => setPicking(null)} />}
    </div>
  )
}
