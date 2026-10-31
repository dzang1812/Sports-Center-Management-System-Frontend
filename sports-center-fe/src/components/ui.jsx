import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export const inputCls =
  'w-full h-11 px-3.5 rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-lowest border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all disabled:bg-surface-container-low disabled:text-outline'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed'

export const btnOutline =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-lg text-label-lg transition-all disabled:opacity-60'

export const Icon = ({ name, className = '' }) => <span className={`material-symbols-outlined ${className}`}>{name}</span>

// Shows the user's avatarUrl when set; falls back to the person icon on a broken/missing link.
export function Avatar({ src, className = 'w-8 h-8' }) {
  const [broken, setBroken] = useState(false)
  return src && !broken ? (
    <img src={src} alt="" onError={() => setBroken(true)} className={`${className} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${className} rounded-full bg-primary flex items-center justify-center shrink-0`}>
      <Icon name="person" className="text-on-primary text-[60%]" />
    </div>
  )
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-md text-label-md text-on-surface font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="font-body-sm text-body-sm text-error flex items-center gap-1">
          <Icon name="warning" className="text-sm" />
          {error}
        </span>
      ) : (
        hint && <span className="font-body-sm text-body-sm text-secondary">{hint}</span>
      )}
    </label>
  )
}

const ALERT = {
  error: ['bg-error-container/40 border-error text-error', 'error'],
  success: ['bg-green-50 border-green-600 text-green-700', 'check_circle'],
  info: ['bg-sky-50 border-sky-500 text-sky-700', 'info'],
  warning: ['bg-amber-50 border-amber-500 text-amber-700', 'warning'],
}

export function Alert({ type = 'error', title, children, className = '' }) {
  const [cls, icon] = ALERT[type]
  return (
    <div role="alert" className={`border-l-4 p-4 rounded-r-xl flex items-start gap-3 ${cls} ${className}`}>
      <Icon name={icon} className="text-xl shrink-0 mt-0.5" />
      <div className="flex flex-col">
        {title && <span className="font-label-md text-label-md font-bold">{title}</span>}
        <span className="font-body-sm text-body-sm">{children}</span>
      </div>
    </div>
  )
}

// Self-dismissing popup for one-off confirmations (e.g. "action completed"), as opposed to
// Alert which stays inline on the page until the caller clears it.
export function Toast({ type = 'success', children, onClose, duration = 4000 }) {
  const [cls, icon] = ALERT[type]
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <div role="status" className={`shadow-lg border-l-4 pl-4 pr-3 py-3 rounded-xl flex items-center gap-3 bg-surface-container-lowest ${cls}`}>
        <Icon name={icon} className="text-xl shrink-0" />
        <span className="font-body-sm text-body-sm text-on-surface">{children}</span>
        <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
          <Icon name="close" className="text-base" />
        </button>
      </div>
    </div>
  )
}

export function Modal({ title, onClose, children, size = 'default', footer }) {
  const closeButton = useRef(null)
  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = closeButton.current?.closest('[role="dialog"]')
    if (!dialog?.contains(document.activeElement)) closeButton.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Escape transformed/backdrop-filtered ancestors such as the fixed navigation header.
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${size === 'wide' ? 'max-w-[1440px]' : 'max-w-lg'} max-h-[90dvh] flex flex-col bg-surface-container-lowest rounded-xl shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 p-4 sm:p-6 border-b border-outline-variant/40">
          <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          <button ref={closeButton} type="button" onClick={onClose} className="shrink-0 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Đóng ${title}`}>
            <Icon name="close" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
        {footer && <div className="shrink-0 flex justify-end gap-2 border-t border-outline-variant/40 px-4 py-3 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Badge({ tone = 'slate', children }) {
  const tones = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`inline-flex px-2 py-0.5 rounded-full font-label-sm text-label-sm ${tones[tone]}`}>{children}</span>
}

export function Pagination({ page, pageSize, total, onPage, onPageSize }) {
  const pages = Math.max(Math.ceil(total / pageSize), 1)
  const from = total ? (page - 1) * pageSize + 1 : 0
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-surface-container text-body-sm text-secondary">
      <span>
        Hiển thị {from}–{Math.min(page * pageSize, total)} / {total}
      </span>
      <div className="flex items-center gap-2">
        <select value={pageSize} onChange={(e) => onPageSize(+e.target.value)} className="h-9 px-2 rounded-lg border border-outline-variant bg-surface-container-lowest">
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} dòng
            </option>
          ))}
        </select>
        <button className={btnOutline + ' !h-9 !px-2'} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Trang trước">
          <Icon name="chevron_left" />
        </button>
        <span>
          {page} / {pages}
        </span>
        <button className={btnOutline + ' !h-9 !px-2'} disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Trang sau">
          <Icon name="chevron_right" />
        </button>
      </div>
    </div>
  )
}
