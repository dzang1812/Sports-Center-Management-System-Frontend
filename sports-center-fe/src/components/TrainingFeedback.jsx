import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { formatDate, formatTimestamp } from '../dateUtils'
import { Alert, Badge } from './ui'

const amount = (r) => [r.sets != null && r.reps != null ? `${r.sets} × ${r.reps}` : r.sets != null ? `${r.sets} hiệp` : r.reps != null ? `${r.reps} lần` : null,
  r.weightKg != null && `${Number(r.weightKg).toLocaleString('vi-VN')} kg`, r.durationMin != null && `${r.durationMin} phút`].filter(Boolean).join(' · ')

// Results from GET /me/training-results or /coach/students/{id}/results, one card per session (newest first).
export function ResultsBySession({ results }) {
  const sessions = useMemo(() => {
    const groups = new Map()
    results.forEach((r) => {
      const key = `${r.kind}-${r.classSessionId ?? r.ptBookingId}`
      if (!groups.has(key)) groups.set(key, { key, kind: r.kind, title: r.sessionTitle, date: r.sessionDate, coach: r.recordedByName, rows: [] })
      groups.get(key).rows.push(r)
    })
    return [...groups.values()].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }, [results])
  if (!sessions.length) return <p className="text-body-sm text-secondary">Chưa có kết quả buổi tập nào.</p>
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => (
        <article key={s.key} className="rounded-xl border border-outline-variant/50 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge tone={s.kind === 'Pt' ? 'indigo' : 'slate'}>{s.kind === 'Pt' ? 'PT' : 'Lớp'}</Badge>
            <h3 className="font-semibold">{s.title ?? 'Buổi tập'}</h3>
            <span className="text-body-sm text-secondary">{s.date ? formatDate(s.date) : ''} · ghi bởi {s.coach}</span>
          </div>
          <ul className="divide-y divide-surface-container">
            {s.rows.map((r) => (
              <li key={r.id} className="py-1.5 flex flex-wrap items-baseline justify-between gap-x-4 text-body-sm">
                <span className="font-medium">{r.exerciseName ?? 'Ghi chú'}</span>
                <span className="text-secondary">{amount(r)}</span>
                {r.notes && <span className="basis-full text-secondary">{r.notes}</span>}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

export function EvaluationList({ evaluations }) {
  if (!evaluations.length) return <p className="text-body-sm text-secondary">Chưa có nhận xét nào.</p>
  return (
    <div className="flex flex-col gap-3">
      {evaluations.map((e) => (
        <article key={e.id} className="rounded-xl border border-outline-variant/50 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold">HLV {e.coachName}</span>
            {e.score != null && <Badge tone={e.score >= 7 ? 'green' : e.score >= 5 ? 'amber' : 'red'}>{e.score}/10</Badge>}
            <span className="text-body-sm text-secondary">{formatTimestamp(e.createdAt)}</span>
          </div>
          <p className="text-body-sm whitespace-pre-line">{e.comment}</p>
        </article>
      ))}
    </div>
  )
}

// Member tab: what coaches recorded for me, and their progress comments.
export default function MyTrainingFeedback() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([api('/me/training-results', { signal: controller.signal }), api('/me/evaluations', { signal: controller.signal })])
      .then(([results, evaluations]) => setData({ results, evaluations }))
      .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [])
  if (error) return <Alert>{error}</Alert>
  if (!data) return <p role="status" className="text-secondary">Đang tải…</p>
  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr] items-start">
      <section className="flex flex-col gap-3" aria-label="Kết quả buổi tập"><h2 className="font-semibold text-lg">Kết quả buổi tập</h2><ResultsBySession results={data.results} /></section>
      <section className="flex flex-col gap-3" aria-label="Nhận xét của HLV"><h2 className="font-semibold text-lg">Nhận xét của HLV</h2><EvaluationList evaluations={data.evaluations} /></section>
    </div>
  )
}
