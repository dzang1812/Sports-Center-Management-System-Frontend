import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Icon, Modal, btnOutline, inputCls } from './ui'

// Catalog names differ between the center and WorkoutX; let the member choose the actual variant.
const SEARCH_NAMES = { 'Barbell Back Squat': 'Barbell Squat', 'Conventional Deadlift': 'Barbell Deadlift' }

export default function ExerciseGuideModal({ exercise, onClose }) {
  const initial = SEARCH_NAMES[exercise.exerciseName] ?? exercise.exerciseName
  const [text, setText] = useState(initial)
  const [search, setSearch] = useState({ q: initial, offset: 0, attempt: 0 })
  const [page, setPage] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mediaError, setMediaError] = useState(false)

  const runSearch = (q, offset = 0) => {
    setLoading(true)
    setError('')
    setSelected(null)
    setPage(null)
    setMediaError(false)
    setSearch({ q, offset, attempt: search.attempt + 1 })
  }

  useEffect(() => {
    const controller = new AbortController()
    api(`/exercise-guides?${new URLSearchParams({ q: search.q, offset: search.offset })}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setPage(data)
        const exact = data.results.find((x) => x.name.toLowerCase() === exercise.exerciseName.toLowerCase())
        setSelected(exact ?? (data.total === 1 ? data.results[0] : null))
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.status === 404
          ? 'Backend chưa có tính năng hướng dẫn tập. Cần cập nhật Backend để sử dụng.' : e.message)
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [search, exercise.exerciseName])

  const choose = (row) => { setSelected(row); setMediaError(false) }
  return (
    <Modal title="Hướng dẫn tập" onClose={onClose} footer={<button className={btnOutline} onClick={onClose}>Đóng</button>}>
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-on-surface">{exercise.exerciseName}</p>
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault()
          if (text.trim().length >= 2) runSearch(text.trim())
        }}>
          <input aria-label="Tên bài trên WorkoutX" className={`${inputCls} min-w-0 flex-1`} value={text} minLength={2} maxLength={100}
            onChange={(e) => setText(e.target.value)} placeholder="Tên bài tiếng Anh…" required />
          <button className={btnOutline} disabled={loading || text.trim().length < 2}>Tìm</button>
        </form>
        {loading && <p role="status" className="text-secondary py-6 text-center">Đang tải hướng dẫn…</p>}
        {error && <Alert>{error}</Alert>}
        {!loading && selected && <>
          <div>
            <h3 className="font-semibold text-primary-container">{selected.name}</h3>
            <p className="text-body-sm text-secondary">{[selected.bodyPart, selected.equipment].filter(Boolean).join(' · ')}</p>
          </div>
          {selected.videoUrl && !mediaError ? <video key={selected.id} src={selected.videoUrl} poster={selected.imageUrl || undefined}
            controls playsInline loop preload="none" onError={() => setMediaError(true)}
            aria-label={`Video ${selected.name}`} className="w-full max-h-56 rounded-xl bg-slate-950" />
            : <p className="text-body-sm text-secondary">{mediaError ? 'Video tạm thời không tải được. Bạn vẫn có thể đọc các bước bên dưới.' : 'Bài này chưa có video mẫu.'}</p>}
          <div>
            <h4 className="font-semibold mb-2">Cách thực hiện</h4>
            {selected.instructions.length ? <ol className="list-decimal pl-5 space-y-2 text-body-sm">{selected.instructions.map((step, i) => <li key={i}>{step}</li>)}</ol>
              : <p className="text-body-sm text-secondary">WorkoutX chưa cung cấp các bước cho bài này.</p>}
          </div>
          {selected.tips.length > 0 && <details className="rounded-lg bg-surface-container-low p-3 text-body-sm">
            <summary className="cursor-pointer font-semibold">Lưu ý kỹ thuật</summary>
            <ul className="list-disc pl-5 mt-2 space-y-1">{selected.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
          </details>}
          {page.total > 1 && <button className={`${btnOutline} self-start`} onClick={() => setSelected(null)}>Chọn biến thể khác</button>}
        </>}
        {!loading && !selected && page && <>
          <p className="text-body-sm text-secondary">{page.total ? 'Chọn đúng bài và dụng cụ bạn sử dụng:' : 'Chưa tìm thấy bài. Thử tên tiếng Anh ngắn hơn hoặc tên khác.'}</p>
          <div className="flex flex-col gap-2">
            {page.results.map((row) => <button key={row.id} onClick={() => choose(row)}
              className="flex items-center gap-3 text-left rounded-lg border border-outline-variant p-3 hover:border-primary-container hover:bg-primary-container/5">
              <Icon name="play_circle" className="text-primary-container shrink-0" />
              <span className="min-w-0"><span className="block font-semibold text-body-sm">{row.name}</span>
                <span className="block text-body-sm text-secondary">{[row.bodyPart, row.equipment].filter(Boolean).join(' · ')}</span></span>
            </button>)}
          </div>
          {page.total > 10 && <div className="flex items-center justify-between gap-2 text-body-sm">
            <button className={btnOutline} disabled={search.offset === 0} onClick={() => runSearch(search.q, search.offset - 10)}>Trước</button>
            <span>{search.offset + 1}–{Math.min(search.offset + 10, page.total)} / {page.total}</span>
            <button className={btnOutline} disabled={search.offset + 10 >= page.total || search.offset >= 1000} onClick={() => runSearch(search.q, search.offset + 10)}>Tiếp</button>
          </div>}
        </>}
        <p className="text-body-sm text-secondary">Nguồn: WorkoutX · Hướng dẫn gốc tiếng Anh.</p>
      </div>
    </Modal>
  )
}
