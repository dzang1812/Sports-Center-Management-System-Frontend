import { useEffect, useState } from 'react'
import { api, query } from '../api'

// A full card code goes straight to the exact lookup (QR scanner / pasted code), no suggestions.
const FULL_CODE = /^GYM-[0-9A-F]{32}$/i
// Member id ("7" or "#7") is searchable from a single digit.
const MEMBER_ID = /^#?\d+$/

export function useMemberSuggestions(text) {
  const q = text.trim()
  const active = (q.length >= 2 || MEMBER_ID.test(q)) && !FULL_CODE.test(q)
  const [result, setResult] = useState({ q: '', items: [] })

  useEffect(() => {
    if (!active) return
    let cancelled = false
    const t = setTimeout(() => {
      api(`/gym-access/members${query({ q })}`)
        .then((items) => !cancelled && setResult({ q, items }))
        .catch(() => !cancelled && setResult({ q, items: [] }))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, active])

  return active ? { items: result.items, pending: result.q !== q } : null
}

export function MemberSuggestions({ state, onPick }) {
  if (!state) return null
  const { items, pending } = state
  return (
    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant max-h-96 overflow-y-auto">
      {items.map((m) => (
        <button
          key={m.memberId}
          type="button"
          onClick={() => onPick(m)}
          className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low flex flex-col border-b border-surface-container last:border-b-0"
        >
          <span className="font-bold text-on-surface">
            {m.fullName}
            <span className="ml-2 font-normal text-secondary">#{m.memberId}</span>
            {!m.isActive && <span className="ml-2 text-xs font-normal text-error">Đã khoá</span>}
          </span>
          <span className="text-body-sm text-on-surface-variant">{m.phone || '—'}</span>
          <span className="text-body-sm text-on-surface-variant break-all">{m.email}</span>
          <span className={`text-body-sm text-on-surface-variant break-all ${m.cardCode ? 'font-mono' : 'italic'}`}>
            {m.cardCode ?? 'Chưa có mã — sẽ cấp khi chọn'}
          </span>
        </button>
      ))}
      {!items.length && (
        <p className="px-4 py-3 text-body-sm text-secondary">{pending ? 'Đang tìm…' : 'Không tìm thấy hội viên phù hợp.'}</p>
      )}
    </div>
  )
}
