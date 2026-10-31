import { useEffect, useRef, useState } from 'react'
import { api, apiForm } from '../api'
import { Alert, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from './ui'

const GOALS = [
  ['MuscleGain', 'Tăng cơ'],
  ['WeightLoss', 'Giảm mỡ'],
  ['Endurance', 'Tăng sức bền'],
  ['GeneralHealth', 'Sức khỏe tổng quát'],
]
const LEVELS = [['Beginner', 'Mới bắt đầu'], ['Intermediate', 'Trung cấp'], ['Advanced', 'Nâng cao']]
const INTENSITIES = [['Light', 'Nhẹ'], ['Moderate', 'Vừa'], ['High', 'Cao']]
const DAYS = [['Monday', 'T2'], ['Tuesday', 'T3'], ['Wednesday', 'T4'], ['Thursday', 'T5'], ['Friday', 'T6'], ['Saturday', 'T7'], ['Sunday', 'CN']]

// Applies the AI's suggestion batch to the member's plan; shared by the generator and the chat.
function ApplyButton({ suggestions, onApplied }) {
  const [state, setState] = useState('idle') // idle | busy | done
  const [error, setError] = useState('')
  if (!suggestions?.length) return null
  const apply = async () => {
    setState('busy')
    setError('')
    try {
      await api('/ai/apply', { method: 'POST', body: { suggestions } })
      setState('done')
      onApplied()
    } catch (e) {
      setError(e.message)
      setState('idle')
    }
  }
  return (
    <div className="flex flex-col gap-2 mt-2">
      {error && <Alert>{error}</Alert>}
      <button className={btnPrimary} onClick={apply} disabled={state !== 'idle'}>
        {state === 'done' ? 'Đã áp dụng vào lịch tập' : state === 'busy' ? 'Đang áp dụng…' : `Áp dụng ${suggestions.length} thay đổi vào lịch tập`}
      </button>
    </div>
  )
}

export function AiGenerateModal({ onClose, onApplied }) {
  const [form, setForm] = useState({ goal: 'MuscleGain', experienceLevel: 'Beginner', daysPerWeek: 3, intensity: 'Moderate', healthIssues: '', trainingDays: ['Monday', 'Wednesday', 'Friday'] })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const toggleDay = (d) =>
    setForm((f) => {
      const trainingDays = f.trainingDays.includes(d) ? f.trainingDays.filter((x) => x !== d) : [...f.trainingDays, d]
      return { ...f, trainingDays, daysPerWeek: trainingDays.length || f.daysPerWeek }
    })

  const generate = async () => {
    setBusy(true)
    setError('')
    try {
      setResult(await api('/ai/workout-plan', { method: 'POST', body: form }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const select = (key, options) => (
    <select className={inputCls} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  )

  return (
    <Modal title="Tạo lịch tập bằng AI" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {error && <Alert>{error}</Alert>}
        {!result ? (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Mục tiêu">{select('goal', GOALS)}</Field>
              <Field label="Trình độ">{select('experienceLevel', LEVELS)}</Field>
              <Field label="Cường độ">{select('intensity', INTENSITIES)}</Field>
            </div>
            <Field label="Ngày muốn tập">
              <div className="flex gap-2 flex-wrap">
                {DAYS.map(([d, l]) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-lg border text-label-md ${form.trainingDays.includes(d) ? 'border-primary-container bg-primary-container text-on-primary' : 'border-outline-variant'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Vấn đề sức khỏe / chấn thương (không bắt buộc)">
              <input className={inputCls} maxLength={300} value={form.healthIssues} onChange={(e) => setForm({ ...form, healthIssues: e.target.value })} />
            </Field>
            <p className="text-body-sm text-secondary">AI chỉ chọn bài trong thư viện bài tập của trung tâm. Lịch đang dùng sẽ được thay bằng lịch mới khi bạn áp dụng.</p>
            <button className={btnPrimary} onClick={generate} disabled={busy || form.trainingDays.length === 0}>
              {busy ? 'AI đang soạn lịch…' : 'Tạo lịch'}
            </button>
          </>
        ) : (
          <>
            <div className="whitespace-pre-wrap text-body-md max-h-[50vh] overflow-y-auto rounded-lg bg-surface-container p-3">{result.response}</div>
            <ApplyButton suggestions={result.suggestions} onApplied={onApplied} />
            <button className={btnOutline} onClick={() => setResult(null)}>Tạo lại</button>
          </>
        )}
      </div>
    </Modal>
  )
}

export function AiChatModal({ onClose, onApplied }) {
  const [messages, setMessages] = useState([]) // { role, content, suggestions? }
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottom = useRef(null)

  useEffect(() => {
    api('/ai/history').then((h) => setMessages(h.map((m) => ({ role: m.role, content: m.content })))).catch((e) => setError(e.message))
  }, [])
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [messages, busy])

  const send = async (e) => {
    e.preventDefault()
    const message = text.trim()
    if (!message || busy) return
    setText('')
    setError('')
    setMessages((m) => [...m, { role: 'user', content: message }])
    setBusy(true)
    try {
      const r = await api('/ai/chat', { method: 'POST', body: { message } })
      setMessages((m) => [...m, { role: 'assistant', content: r.response, suggestions: r.suggestions }])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const clear = async () => {
    await api('/ai/history', { method: 'DELETE' }).catch(() => {})
    setMessages([])
  }

  return (
    <Modal title="Chat với trợ lý AI" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 h-[50vh] overflow-y-auto pr-1">
          {messages.length === 0 && !busy && <p className="text-secondary text-center mt-8">Hỏi về bài tập, dinh dưỡng hoặc nhờ AI chỉnh lịch tập của bạn.</p>}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 whitespace-pre-wrap ${m.role === 'user' ? 'self-end bg-primary-container text-on-primary' : 'self-start bg-surface-container'}`}>
              {m.content}
              {m.suggestions?.length > 0 && <ApplyButton suggestions={m.suggestions} onApplied={onApplied} />}
            </div>
          ))}
          {busy && <p className="self-start text-secondary">AI đang trả lời…</p>}
          <div ref={bottom} />
        </div>
        {error && <Alert>{error}</Alert>}
        <form onSubmit={send} className="flex gap-2">
          <input className={`${inputCls} flex-1`} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Nhập câu hỏi…" />
          <button className={btnPrimary} disabled={busy || !text.trim()}>Gửi</button>
          <button type="button" className={btnOutline} onClick={clear} title="Xóa lịch sử chat">
            <Icon name="delete" className="text-[18px]" />
          </button>
        </form>
      </div>
    </Modal>
  )
}

const MEDIA_TABS = {
  equipment_info: { label: 'Hỏi đáp máy tập', kind: 'image', hint: 'Chụp ảnh máy tập để AI cho biết tên máy, nhóm cơ và cách dùng.' },
  body_check: { label: 'Đánh giá thể hình', kind: 'image', hint: 'Tải ảnh cơ thể để AI nhận xét nhóm cơ cần ưu tiên.' },
  form_video: { label: 'Kiểm tra form', kind: 'video', hint: 'Quay video (MP4/MOV, tối đa 25MB) một hiệp tập để AI đánh giá kỹ thuật.' },
}

const SECTIONS = [
  [detectedItems, 'Nhận diện'], [bodyObservations, 'Quan sát'], [muscles, 'Nhóm cơ'], [priorityMuscles, 'Nhóm cơ ưu tiên'],
  [suggestedExercises, 'Bài tập gợi ý'], [movementSummary, 'Chuyển động'], [majorIssues, 'Lỗi lớn'], [minorIssues, 'Lỗi nhỏ'],
  [correctPoints, 'Điểm đúng'], [correctiveCues, 'Cách sửa'], [suggestedFixes, 'Gợi ý chỉnh'], [formFeedback, 'Nhận xét form'],
  [trainingAdvice, 'Lời khuyên'], [warnings, 'Lưu ý'],
]

function MediaResult({ r }) {
  return (
    <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto rounded-lg bg-surface-container p-3">
      <p className="font-semibold">{r.title}</p>
      {r.overallVerdict && <p><b>Kết luận:</b> {r.overallVerdict}{r.detectedExercise ? ` (${r.detectedExercise})` : ''}</p>}
      <p>{r.summary}</p>
      {SECTIONS.map(([k, label]) => {
        const v = r[k]
        if (!v || (Array.isArray(v) && v.length === 0)) return null
        return (
          <div key={k}>
            <p className="font-label-md text-label-md">{label}</p>
            {Array.isArray(v) ? <ul className="list-disc pl-5">{v.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p>{v}</p>}
          </div>
        )
      })}
    </div>
  )
}

export function AiMediaModal({ onClose }) {
  const [tab, setTab] = useState('equipment_info')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const t = MEDIA_TABS[tab]

  const analyze = async () => {
    const form = new FormData()
    if (t.kind === 'video') form.append('video', file)
    else {
      form.append('image', file)
      form.append('mode', tab)
    }
    setBusy(true)
    setError('')
    try {
      setResult(await apiForm(t.kind === 'video' ? '/ai/analyze-form-video' : '/ai/analyze-image', form))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Phân tích ảnh / video bằng AI" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(MEDIA_TABS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { setTab(k); setFile(null); setResult(null); setError('') }}
              className={`px-3 py-1.5 rounded-lg border text-label-md ${tab === k ? 'border-primary-container bg-primary-container text-on-primary' : 'border-outline-variant'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="text-body-sm text-secondary">{t.hint}</p>
        {error && <Alert>{error}</Alert>}
        <input
          key={tab}
          type="file"
          accept={t.kind === 'video' ? 'video/mp4,video/quicktime' : 'image/jpeg,image/png,image/webp'}
          onChange={(e) => { setFile(e.target.files[0] ?? null); setResult(null) }}
        />
        <button className={btnPrimary} onClick={analyze} disabled={!file || busy}>
          {busy ? 'AI đang phân tích…' : 'Phân tích'}
        </button>
        {result && <MediaResult r={result} />}
      </div>
    </Modal>
  )
}
