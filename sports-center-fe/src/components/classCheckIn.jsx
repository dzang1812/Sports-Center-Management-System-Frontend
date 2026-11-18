import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { formatTimestamp } from '../dateUtils'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { ATTENDANCE_STATUS_LABEL } from '../labels'
import { Alert, Icon, Modal, btnOutline, btnPrimary, inputCls } from './ui'

const msLeft = (expiresAt) => Math.max(0, new Date(expiresAt).getTime() - Date.now())

function CodeModal({ sessionId, onClose }) {
  const { enforceTimeRules } = useFlow2TimeRules()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [left, setLeft] = useState(0)
  const issued = useRef(null)

  useEffect(() => {
    let cancelled = false
    // StrictMode re-runs effects in development. Share the request for this opening.
    if (issued.current?.sessionId !== sessionId)
      issued.current = { sessionId, promise: api(`/sessions/${sessionId}/check-in-code`, { method: 'POST' }) }
    issued.current.promise
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLeft(msLeft(d.expiresAt))
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [sessionId])

  useEffect(() => {
    if (!data) return
    const t = setInterval(() => setLeft(msLeft(data.expiresAt)), 1000)
    return () => clearInterval(t)
  }, [data])

  const expired = enforceTimeRules && data && left <= 0

  return (
    <Modal title="Mã check-in buổi học" onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      {!data && !error && <p className="text-secondary">Đang tạo mã…</p>}
      {data && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className={`font-mono text-4xl font-bold tracking-widest px-6 py-4 rounded-xl ${
              expired ? 'bg-surface-container text-outline line-through' : 'bg-primary-container text-on-primary'
            }`}
          >
            {data.code}
          </div>
          <p className={expired ? 'text-error font-semibold' : 'text-secondary'}>
            {!enforceTimeRules ? 'Đang bật bỏ qua thời gian check-in cho tất cả vai trò.' : expired ? 'Mã đã hết hạn — bấm lại nút Mở mã để tạo mã mới.' : `Hết hạn sau ${Math.ceil(left / 1000)}s`}
          </p>
          <p className="text-body-sm text-secondary text-center max-w-xs">Đọc mã này cho hội viên/HLV để họ nhập vào ô check-in.</p>
          <p className="text-body-sm text-secondary text-center">Buổi #{sessionId} · Mã riêng cho buổi này. Mở lại giữ nguyên mã còn hiệu lực.</p>
          <p className="text-body-sm text-secondary">Hạn mã (giờ Việt Nam): {formatTimestamp(data.expiresAt)}</p>
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button className={btnOutline} onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  )
}

function SelfCheckInModal({ title, endpoint, codeEndpoint, onClose, onDone }) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loadingCode, setLoadingCode] = useState(false)
  const [codeExpiry, setCodeExpiry] = useState(null)

  const getCode = async () => {
    if (loadingCode || busy) return
    setError('')
    setLoadingCode(true)
    try {
      const data = await api(codeEndpoint, { method: 'POST', notify: false })
      setCode(data.code)
      setCodeExpiry(data.expiresAt)
    } catch (err) {
      setError(err.status === 404
        ? 'Backend chưa có tính năng tự lấy mã. Bạn có thể nhập mã từ HLV/lễ tân.'
        : err.message)
    } finally {
      setLoadingCode(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy || loadingCode) return
    setError('')
    setBusy(true)
    try {
      const res = await api(endpoint, { method: 'POST', body: { code: code.trim() } })
      setResult(res)
      onDone?.(res)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <Modal title={title} onClose={onClose}>
      {!result ? (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <p className="text-body-sm text-secondary">{codeEndpoint
            ? 'Bấm lấy mã để tự điền, sau đó xác nhận check-in cho đúng buổi trong thời gian điểm danh.'
            : 'Nhập mã hiện tại của đúng buổi từ HLV/lễ tân. Mã của buổi khác không dùng được.'}</p>
          {codeEndpoint && (
            <button type="button" className={btnOutline} disabled={loadingCode || busy} onClick={getCode}>
              <Icon name="qr_code_2" className="text-lg" />
              {loadingCode ? 'Đang lấy mã…' : codeExpiry ? 'Lấy lại mã check-in' : 'Tự lấy mã check-in'}
            </button>
          )}
          <input
            className={inputCls}
            placeholder="Nhập mã check-in"
            autoFocus
            minLength={6}
            maxLength={64}
            required
            disabled={busy || loadingCode}
            value={code}
            onChange={(e) => { setCode(e.target.value); setCodeExpiry(null) }}
          />
          {codeExpiry && <p className="text-body-sm text-secondary" role="status">Đã điền mã của buổi này. Hạn mã: {formatTimestamp(codeExpiry)}.</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
            <button type="submit" disabled={busy || loadingCode || !code.trim()} className={btnPrimary}>{busy ? 'Đang gửi…' : 'Check-in'}</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <Icon name="check_circle" className="text-5xl text-green-600" />
          <p className="font-semibold">{result.alreadyCheckedIn ? 'Bạn đã check-in buổi này trước đó.' : 'Check-in thành công!'}</p>
          <p className="text-secondary">
            Trạng thái: {ATTENDANCE_STATUS_LABEL[result.status] ?? result.status}
            {result.checkedInAt && ` • lúc ${formatTimestamp(result.checkedInAt, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </p>
          <button className={btnPrimary} onClick={onClose}>Đóng</button>
        </div>
      )}
    </Modal>
  )
}

// Manager/Receptionist/assigned Coach — opens the active code, renewing only after expiry.
export function OpenCheckInCodeButton({ sessionId, className }) {
  const { enforceTimeRules } = useFlow2TimeRules()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={className ?? btnOutline + ' !h-8 !px-2'} title="Mở mã check-in" onClick={() => setOpen(true)}>
        <Icon name="qr_code_2" className="text-base" />
      </button>
      {open && <CodeModal key={`${sessionId}:${enforceTimeRules}`} sessionId={sessionId} onClose={() => setOpen(false)} />}
    </>
  )
}

// Member checks in to their own booked session, or an assigned Coach checks in to the session they teach —
// same code-entry flow, different endpoint.
export function SelfCheckInButton({ sessionId, as = 'member', className, onDone }) {
  const [open, setOpen] = useState(false)
  const endpoint = as === 'coach' ? `/coach/sessions/class/${sessionId}/check-in` : `/me/class-sessions/${sessionId}/check-in`
  return (
    <>
      <button type="button" className={className ?? btnPrimary} onClick={() => setOpen(true)}>
        <Icon name="how_to_reg" className="text-lg" />
        Check-in
      </button>
      {open && (
        <SelfCheckInModal
          title={as === 'coach' ? 'Check-in buổi dạy' : 'Check-in buổi học'}
          endpoint={endpoint}
          codeEndpoint={as === 'coach' ? `/sessions/${sessionId}/check-in-code` : `/me/class-sessions/${sessionId}/check-in-code`}
          onClose={() => setOpen(false)}
          onDone={onDone}
        />
      )}
    </>
  )
}
