import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatTimestamp } from '../dateUtils'
import { Alert, Avatar, Icon, btnOutline, btnPrimary, inputCls } from './ui'

const filled = { fontVariationSettings: "'FILL' 1" }

export function Stars({ value, className = 'text-base' }) {
  return <span className="inline-flex text-amber-400" aria-hidden="true">
    {[1, 2, 3, 4, 5].map(n => {
      const full = value >= n - 0.25, half = !full && value >= n - 0.75
      return <span key={n} className={`material-symbols-outlined ${className} ${full || half ? '' : 'text-slate-300'}`} style={full || half ? filled : undefined}>{half ? 'star_half' : 'star'}</span>
    })}
  </span>
}

// "★ 4.6 (12 đánh giá)" or a quiet "Chưa có đánh giá"; works on any coach object carrying averageRating/reviewCount.
export function RatingBadge({ coach, className = '' }) {
  if (!coach?.reviewCount) return <span className={`text-[12px] text-slate-400 ${className}`}>Chưa có đánh giá</span>
  return <span className={`inline-flex items-center gap-1 text-[12px] font-semibold text-slate-700 ${className}`} aria-label={`${coach.averageRating} trên 5 sao, ${coach.reviewCount} đánh giá`}>
    <span className="material-symbols-outlined text-[16px] text-amber-400" style={filled}>star</span>{coach.averageRating.toFixed(1)}
    <span className="font-normal text-slate-500">({coach.reviewCount})</span>
  </span>
}

export function FeaturedBadge({ className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm ${className}`}>
    <span className="material-symbols-outlined text-[14px]" style={filled}>workspace_premium</span>HLV tiêu biểu
  </span>
}

// Map coachId -> { averageRating, reviewCount, isFeatured } for lists that don't come from /pt/coaches.
export function useCoachRatings(refresh = 0) {
  const [ratings, setRatings] = useState(new Map())
  useEffect(() => {
    const c = new AbortController()
    api('/coaches/ratings', { signal: c.signal }).then(list => setRatings(new Map(list.map(r => [r.coachId, r])))).catch(() => {})
    return () => c.abort()
  }, [refresh])
  return [ratings, setRatings]
}

// Manager / receptionist switch; the parent keeps the source of truth and gets the saved rating back.
export function FeatureToggle({ coachId, featured, onChange, className = '' }) {
  const [busy, setBusy] = useState(false)
  const toggle = async () => {
    setBusy(true)
    try { onChange(await api(`/coaches/${coachId}/featured`, { method: 'PUT', body: { featured: !featured } })) }
    catch (err) { window.alert(err.message) }
    finally { setBusy(false) }
  }
  return <button type="button" disabled={busy} aria-pressed={featured} onClick={toggle} title={featured ? 'Bỏ đánh dấu HLV tiêu biểu' : 'Đánh dấu là HLV tiêu biểu để hiển thị lên đầu'}
    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[12px] font-semibold transition-colors disabled:opacity-50 ${featured ? 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'border-outline-variant text-secondary hover:border-amber-400 hover:text-amber-700'} ${className}`}>
    <span className="material-symbols-outlined text-[16px]" style={featured ? filled : undefined}>workspace_premium</span>{featured ? 'Tiêu biểu' : 'Đánh dấu tiêu biểu'}
  </button>
}

// Public reviews block (profile dialog). Names come back already shortened by the API.
export function CoachReviewList({ coachId }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    const c = new AbortController()
    api(`/coaches/${coachId}/reviews`, { signal: c.signal }).then(setData).catch(() => setData({ reviewCount: 0, items: [] }))
    return () => c.abort()
  }, [coachId])
  if (!data) return <p role="status" className="text-body-sm text-secondary">Đang tải đánh giá…</p>
  return <section className="space-y-3 border-t border-slate-100 pt-4">
    <div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold">Đánh giá của học viên</h4>{data.reviewCount > 0 && <><Stars value={data.averageRating} /><span className="text-body-sm text-secondary">{data.averageRating.toFixed(1)}/5 · {data.reviewCount} đánh giá</span></>}</div>
    {data.items.length ? <ul className="space-y-2">{data.items.map(r => <li key={r.id} className="rounded-xl bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-body-sm font-semibold text-slate-800">{r.memberName}</span><Stars value={r.rating} className="text-[16px]" /></div>
      {r.comment && <p className="mt-1 text-sm leading-6 text-slate-600 whitespace-pre-line break-words">{r.comment}</p>}
      <p className="mt-1 text-[11px] text-slate-400">{formatTimestamp(r.updatedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
    </li>)}</ul> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có đánh giá nào.</p>}
  </section>
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return <div role="radiogroup" aria-label="Số sao" className="flex" onMouseLeave={() => setHover(0)}>
    {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} sao`} onClick={() => onChange(n)} onMouseEnter={() => setHover(n)}
      className="p-0.5 text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded">
      <span className={`material-symbols-outlined text-[28px] ${(hover || value) >= n ? '' : 'text-slate-300'}`} style={(hover || value) >= n ? filled : undefined}>star</span>
    </button>)}
  </div>
}

function ReviewRow({ item, onSaved }) {
  const [editing, setEditing] = useState(!item.myRating)
  const [rating, setRating] = useState(item.myRating ?? 0)
  const [comment, setComment] = useState(item.myComment ?? '')
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const save = async () => {
    if (!rating) return setError('Chọn số sao trước khi gửi.')
    setBusy(true); setError('')
    try { onSaved(await api(`/me/coach-reviews/${item.coachId}`, { method: 'PUT', body: { rating, comment: comment.trim() || null } })); setEditing(false) }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <li className="rounded-xl border border-slate-200 p-3 space-y-2">
    <div className="flex flex-wrap items-center gap-3"><Avatar src={item.avatarUrl} className="h-10 w-10" />
      <div className="min-w-0 flex-1"><p className="font-semibold truncate">{item.fullName}</p>
        {item.myRating && !editing ? <div className="flex items-center gap-2"><Stars value={item.myRating} className="text-[16px]" /><span className="text-[11px] text-slate-400">Đã gửi {formatTimestamp(item.reviewedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>
          : <p className="text-body-sm text-secondary">Bạn đã học với HLV này — chia sẻ cảm nhận nhé.</p>}
      </div>
      {item.myRating && !editing && <button type="button" className={btnOutline + ' !h-8 !text-xs'} onClick={() => setEditing(true)}>Sửa đánh giá</button>}
    </div>
    {item.myRating && !editing && item.myComment && <p className="text-sm text-slate-600 whitespace-pre-line break-words">{item.myComment}</p>}
    {editing && <div className="space-y-2">
      <StarPicker value={rating} onChange={setRating} />
      <textarea className={inputCls + ' min-h-20'} maxLength={1000} placeholder="Nhận xét về HLV (không bắt buộc)…" value={comment} onChange={e => setComment(e.target.value)} />
      {error && <Alert>{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimary + ' !h-9'} disabled={busy} onClick={save}>{busy ? 'Đang gửi…' : item.myRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</button>
        {item.myRating && <button type="button" className={btnOutline + ' !h-9'} disabled={busy} onClick={() => { setEditing(false); setRating(item.myRating); setComment(item.myComment ?? '') }}>Hủy</button>}
      </div>
    </div>}
  </li>
}

// Member: coaches they actually trained with (class or PT already held) — rate & comment, editable later.
export function MyCoachReviews() {
  const [items, setItems] = useState(null)
  useEffect(() => { api('/me/coach-reviews').then(setItems).catch(() => setItems([])) }, [])
  if (!items?.length) return null
  const pending = items.filter(i => !i.myRating).length
  return <details open={pending > 0} className="rounded-2xl border border-outline-variant/50 bg-white p-4 sm:p-5 shadow-sm group">
    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 list-none">
      <span className="flex items-center gap-2 font-semibold"><Icon name="reviews" className="text-xl text-amber-500" />Đánh giá HLV bạn đã học</span>
      <span className="text-body-sm text-secondary">{pending ? `${pending} HLV chờ bạn đánh giá` : 'Bạn đã đánh giá tất cả'}<Icon name="expand_more" className="ml-1 align-middle text-lg transition-transform group-open:rotate-180" /></span>
    </summary>
    <ul className="mt-3 grid gap-3 lg:grid-cols-2">{items.map(item => <ReviewRow key={item.coachId} item={item} onSaved={saved => setItems(list => list.map(i => i.coachId === saved.coachId ? saved : i))} />)}</ul>
  </details>
}
