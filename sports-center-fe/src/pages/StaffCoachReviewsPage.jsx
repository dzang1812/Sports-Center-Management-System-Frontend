import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { Stars } from '../components/CoachRating'
import { Alert, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { formatTimestamp } from '../dateUtils'
import { useClientPaged } from '../usePaged'

const dateFmt = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }

// Manager + Receptionist: moderate member reviews of coaches (GET/DELETE /coach-reviews).
export default function StaffCoachReviewsPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [coachId, setCoachId] = useState('')
  const [stars, setStars] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { api('/coach-reviews').then(setItems).catch(err => { setError(err.message); setItems([]) }) }, [])

  const coaches = useMemo(() => [...new Map((items ?? []).map(r => [r.coachId, r.coachName])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'vi')), [items])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (items ?? []).filter(r => (!coachId || r.coachId === Number(coachId)) && (!stars || r.rating === Number(stars))
      && (!q || `${r.memberName} ${r.coachName} ${r.comment ?? ''}`.toLowerCase().includes(q)))
  }, [items, coachId, stars, search])
  const { pageItems, pagination } = useClientPaged(filtered)

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Đánh giá HLV</h1>
        <p className="text-secondary mt-2">Xem toàn bộ nhận xét của hội viên và gỡ các nhận xét không phù hợp. Hội viên sẽ được thông báo khi nhận xét bị gỡ.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-outline-variant/50 bg-white p-4 shadow-sm">
        <Field label="Huấn luyện viên">
          <select className={inputCls} value={coachId} onChange={e => setCoachId(e.target.value)}>
            <option value="">Tất cả HLV</option>
            {coaches.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </Field>
        <Field label="Số sao">
          <select className={inputCls} value={stars} onChange={e => setStars(e.target.value)}>
            <option value="">Tất cả</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} sao</option>)}
          </select>
        </Field>
        <Field label="Tìm kiếm">
          <input className={inputCls} placeholder="Tên hội viên, HLV hoặc nội dung…" value={search} onChange={e => setSearch(e.target.value)} />
        </Field>
      </div>

      {error && <Alert>{error}</Alert>}
      {!items && <p role="status" className="py-10 text-center text-secondary">Đang tải…</p>}
      {items && !filtered.length && <p className="rounded-2xl border border-outline-variant/50 bg-white p-8 text-center text-secondary">{items.length ? 'Không có đánh giá nào khớp bộ lọc.' : 'Chưa có đánh giá nào.'}</p>}

      <ul className="grid gap-3 lg:grid-cols-2">
        {pageItems.map(r => (
          <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{r.memberName} <span className="font-normal text-secondary">→ HLV</span> {r.coachName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2"><Stars value={r.rating} className="text-[16px]" /><span className="text-[11px] text-slate-400">{formatTimestamp(r.updatedAt, dateFmt)}{r.updatedAt !== r.createdAt ? ' · đã sửa' : ''}</span></div>
              </div>
              <button type="button" className={btnOutline + ' !h-8 !text-xs !text-error'} onClick={() => setDeleting(r)}><Icon name="delete" className="text-base" />Gỡ</button>
            </div>
            {r.comment ? <p className="text-sm text-slate-600 whitespace-pre-line break-words">{r.comment}</p> : <p className="text-sm italic text-slate-400">Không có nhận xét.</p>}
          </li>
        ))}
      </ul>
      {pagination}

      {deleting && <DeleteReviewModal review={deleting} onClose={() => setDeleting(null)} onDeleted={id => { setItems(list => list.filter(r => r.id !== id)); setDeleting(null) }} />}
    </div>
  )
}

function DeleteReviewModal({ review, onClose, onDeleted }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setBusy(true); setError('')
    try {
      const qs = reason.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : ''
      await api(`/coach-reviews/${review.id}${qs}`, { method: 'DELETE' })
      onDeleted(review.id)
    } catch (err) { setError(err.message); setBusy(false) }
  }
  return (
    <Modal title="Gỡ đánh giá" onClose={busy ? () => {} : onClose} footer={<>
      <button type="button" className={btnOutline} disabled={busy} onClick={onClose}>Hủy</button>
      <button type="button" className={btnPrimary} disabled={busy} onClick={submit}>{busy ? 'Đang gỡ…' : 'Gỡ đánh giá'}</button>
    </>}>
      <div className="space-y-3">
        <p className="text-body-sm text-secondary">Gỡ đánh giá {review.rating}/5 sao của <b>{review.memberName}</b> cho HLV <b>{review.coachName}</b>. Hội viên sẽ nhận thông báo và có thể đánh giá lại.</p>
        <Field label="Lý do (gửi kèm thông báo cho hội viên)">
          <textarea className={inputCls + ' min-h-20'} maxLength={500} placeholder="Ví dụ: Nội dung không phù hợp…" value={reason} onChange={e => setReason(e.target.value)} />
        </Field>
        {error && <Alert>{error}</Alert>}
      </div>
    </Modal>
  )
}
