import { useEffect, useState } from 'react'
import { api } from '../api'
import { useFlow2TimeRules } from '../flow2TimeRules'
import { ATTENDANCE_STATUS_LABEL } from '../labels'
import { Alert, Icon, Modal, btnOutline, btnPrimary, inputCls } from './ui'

const msLeft = (expiresAt) => Math.max(0, new Date(expiresAt).getTime() - Date.now())

function CodeModal({ sessionId, onClose }) {
  const { enforceTimeRules } = useFlow2TimeRules()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [left, setLeft] = useState(0)

  useEffect(() => {
    let cancelled = false
    api(`/sessions/${sessionId}/check-in-code`, { method: 'POST' })
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
            {!enforceTimeRules ? 'Đang bỏ qua hạn mã check-in: Ràng buộc thời gian Flow 2 OFF.' : expired ? 'Mã đã hết hạn — bấm lại nút Mở mã để tạo mã mới.' : `Hết hạn sau ${Math.ceil(left / 1000)}s`}
          </p>
          <p className="text-body-sm text-secondary text-center max-w-xs">Đọc mã này cho hội viên/HLV để họ nhập vào ô check-in.</p>
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button className={btnOutline} onClick={onClose}>Đóng</button>
      </div>
    </Modal>
  )
}

function SelfCheckInModal({ title, endpoint, onClose, onDone }) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await api(endpoint, { method: 'POST', body: { code: code.trim() } })
      setResult(res)
      onDone?.()
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
          <input
            className={inputCls}
            placeholder="Nhập mã check-in"
            autoFocus
            minLength={6}
            maxLength={64}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
            <button type="submit" disabled={busy || !code.trim()} className={btnPrimary}>{busy ? 'Đang gửi…' : 'Check-in'}</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <Icon name="check_circle" className="text-5xl text-green-600" />
          <p className="font-semibold">{result.alreadyCheckedIn ? 'Bạn đã check-in buổi này trước đó.' : 'Check-in thành công!'}</p>
          <p className="text-secondary">
            Trạng thái: {ATTENDANCE_STATUS_LABEL[result.status] ?? result.status}
            {result.checkedInAt && ` • lúc ${new Date(result.checkedInAt).toLocaleTimeString('vi-VN')}`}
          </p>
          <button className={btnPrimary} onClick={onClose}>Đóng</button>
        </div>
      )}
    </Modal>
  )
}

// Manager/Receptionist/assigned Coach — generates a fresh short-lived check-in code for a Scheduled session.
export function OpenCheckInCodeButton({ sessionId, className }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={className ?? btnOutline + ' !h-8 !px-2'} title="Mở mã check-in" onClick={() => setOpen(true)}>
        <Icon name="qr_code_2" className="text-base" />
      </button>
      {open && <CodeModal sessionId={sessionId} onClose={() => setOpen(false)} />}
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
          onClose={() => setOpen(false)}
          onDone={onDone}
        />
      )}
    </>
  )
}
