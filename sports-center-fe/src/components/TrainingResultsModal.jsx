import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Icon, Modal, btnOutline, btnPrimary, inputCls } from './ui'

const emptyRow = () => ({ exerciseId: '', sets: '', reps: '', weightKg: '', durationMin: '', notes: '' })
const num = (value) => (value === '' || value == null ? null : Number(value))
const text = (value) => (value == null ? '' : String(value))

// Coach records what each member did in one class session / PT booking. PUT replaces the whole list,
// so the modal always loads the saved rows first and sends everything back on save.
export default function TrainingResultsModal({ item, members, onClose }) {
  const path = item.type === 'PT' ? `/coach/sessions/pt/${item.referenceId}/results` : `/coach/sessions/class/${item.referenceId}/results`
  const [people, setPeople] = useState(members)
  const [rows, setRows] = useState(null) // { [memberId]: row[] }
  const [exercises, setExercises] = useState([])
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([api(path, { signal: controller.signal }), api('/exercises', { signal: controller.signal })])
      .then(([results, list]) => {
        setExercises(list)
        const byMember = Object.fromEntries(members.map((m) => [m.memberId, []]))
        const extra = []
        results.forEach((r) => {
          if (!byMember[r.memberId]) { byMember[r.memberId] = []; extra.push({ memberId: r.memberId, fullName: r.memberName }) }
          byMember[r.memberId].push({ exerciseId: text(r.exerciseId), sets: text(r.sets), reps: text(r.reps), weightKg: text(r.weightKg), durationMin: text(r.durationMin), notes: r.notes ?? '' })
        })
        setPeople([...members, ...extra])
        setRows(byMember)
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [path, members])

  const update = (memberId, list) => { setSaved(false); setRows((r) => ({ ...r, [memberId]: list })) }
  const setCell = (memberId, index, patch) => update(memberId, rows[memberId].map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const save = async () => {
    const missing = people.find((p) => rows[p.memberId].some((row) => !row.exerciseId && !row.notes.trim()))
    if (missing) return setError(`Mỗi dòng của ${missing.fullName} cần chọn bài tập hoặc ghi chú.`)
    setBusy(true); setError('')
    try {
      const items = people.flatMap((p) => rows[p.memberId].map((row) => ({
        memberId: p.memberId, exerciseId: num(row.exerciseId), sets: num(row.sets), reps: num(row.reps),
        weightKg: num(row.weightKg), durationMin: num(row.durationMin), notes: row.notes.trim() || null,
      })))
      await api(path, { method: 'PUT', body: { items } })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  const footer = (
    <>
      <button type="button" className={btnOutline} onClick={onClose}>Đóng</button>
      <button type="button" className={btnPrimary} disabled={busy || !rows} onClick={save}>{busy ? 'Đang lưu…' : 'Lưu kết quả'}</button>
    </>
  )

  return (
    <Modal title={`Kết quả tập — ${item.title}`} size="wide" onClose={onClose} footer={footer}>
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        <p className="text-body-sm text-secondary">{item.date} · Mỗi dòng là một bài tập (hoặc một ghi chú) học viên đã làm trong buổi. Bỏ trống ô nào không cần.</p>
        {error && <Alert>{error}</Alert>}
        {saved && <Alert type="success">Đã lưu kết quả buổi tập.</Alert>}
        {!rows && !error && <p role="status" className="text-secondary">Đang tải…</p>}
        {rows && !people.length && <p className="text-secondary">Buổi này chưa có học viên.</p>}
        {rows && people.map((p) => (
          <section key={p.memberId} className="rounded-xl border border-outline-variant/60 p-3 sm:p-4 flex flex-col gap-2" aria-label={`Kết quả của ${p.fullName}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{p.fullName} <span className="text-secondary font-normal">#{p.memberId}</span></h3>
              <button type="button" className={btnOutline + ' !h-9'} onClick={() => update(p.memberId, [...rows[p.memberId], emptyRow()])}>
                <Icon name="add" className="text-base" />Thêm dòng
              </button>
            </div>
            {!rows[p.memberId].length && <p className="text-body-sm text-secondary">Chưa ghi kết quả.</p>}
            {rows[p.memberId].map((row, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-[minmax(0,2fr)_repeat(4,4.5rem)_minmax(0,2fr)_auto] gap-2 items-center">
                <select aria-label="Bài tập" className={inputCls + ' col-span-2 sm:col-span-1 !h-10'} value={row.exerciseId} onChange={(e) => setCell(p.memberId, i, { exerciseId: e.target.value })}>
                  <option value="">— Không chọn bài tập —</option>
                  {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                </select>
                <input aria-label="Số hiệp" placeholder="Hiệp" type="number" min={0} max={100} className={inputCls + ' !h-10'} value={row.sets} onChange={(e) => setCell(p.memberId, i, { sets: e.target.value })} />
                <input aria-label="Số lần" placeholder="Lần" type="number" min={0} max={1000} className={inputCls + ' !h-10'} value={row.reps} onChange={(e) => setCell(p.memberId, i, { reps: e.target.value })} />
                <input aria-label="Mức tạ (kg)" placeholder="Kg" type="number" min={0} max={1000} step="0.5" className={inputCls + ' !h-10'} value={row.weightKg} onChange={(e) => setCell(p.memberId, i, { weightKg: e.target.value })} />
                <input aria-label="Thời gian (phút)" placeholder="Phút" type="number" min={0} max={600} className={inputCls + ' !h-10'} value={row.durationMin} onChange={(e) => setCell(p.memberId, i, { durationMin: e.target.value })} />
                <input aria-label="Ghi chú" placeholder="Ghi chú" maxLength={1000} className={inputCls + ' col-span-2 sm:col-span-1 !h-10'} value={row.notes} onChange={(e) => setCell(p.memberId, i, { notes: e.target.value })} />
                <button type="button" aria-label="Xoá dòng" className="justify-self-end p-2 text-secondary hover:text-error" onClick={() => update(p.memberId, rows[p.memberId].filter((_, j) => j !== i))}>
                  <Icon name="delete" className="text-xl" />
                </button>
              </div>
            ))}
          </section>
        ))}
      </div>
    </Modal>
  )
}
