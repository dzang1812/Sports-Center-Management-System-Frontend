import { useCallback, useEffect, useRef, useState } from 'react'
import { api, query } from '../api'
import { fromTimeOnly } from '../dateUtils'
import { Alert, Field, Modal, btnOutline, btnPrimary, inputCls } from './ui'

export function CancelBookingModal({ item, kind = 'booking', onClose, onDone }) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const close = () => { if (!pending.current) onClose() }
  const submit = async (e) => {
    e.preventDefault()
    if (pending.current) return
    pending.current = true
    setBusy(true); setError('')
    try {
      const id = item.bookingId
      const text = reason.trim()
      if (kind === 'manager' || kind === 'coach')
        await api(`/pt/bookings/${id}/${kind}-cancel`, { method: 'PATCH', body: { reason: text } })
      else if (item.type === 'PT')
        await api(`/pt/bookings/${id}`, { method: 'DELETE', body: { reason: text || null } })
      else await api(`/bookings/${id}${query({ reason: text })}`, { method: 'DELETE' })
      if (active.current) onDone()
    } catch (err) { if (active.current) setError(err.message) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <Modal title={kind === 'manager' ? 'Trung tâm hủy buổi PT' : item.type === 'PT' ? 'Hủy buổi PT' : 'Hủy lịch lớp'} onClose={close}>
    <form onSubmit={submit} className="space-y-4">
      <p className="text-secondary">PT trả ví: hủy còn ít nhất 12 giờ được hoàn tiền; dùng gói: hoàn credit về đúng gói. Hủy muộn theo cấu hình không hoàn. Khóa nhóm phải hủy nguyên enrollment.</p>
      <p>Hủy <b>{item.title}</b> ngày {item.date}, {fromTimeOnly(item.startTime)}? Quyền lợi sẽ được cập nhật theo quy định sau khi xác nhận.</p>
      {error && <Alert>{error}</Alert>}
      <Field label="Lý do hủy"><textarea className={inputCls + ' !h-24 py-2'} required={kind !== 'booking'} minLength={kind === 'manager' ? 2 : undefined} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} disabled={busy} /></Field>
      <div className="flex justify-end gap-2"><button type="button" className={btnOutline} onClick={close} disabled={busy}>Giữ lại</button><button type="submit" className={btnPrimary + ' !bg-error !text-white'} disabled={busy || (kind !== 'booking' && reason.trim().length < (kind === 'manager' ? 2 : 1))}>{busy ? 'Đang hủy…' : 'Xác nhận hủy'}</button></div>
    </form>
  </Modal>
}

export function PtRescheduleModal({ item, onClose, onDone }) {
  const [date, setDate] = useState(item.date)
  const [slots, setSlots] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const pending = useRef(false)
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const load = useCallback(async (signal) => {
    setLoading(true); setSlots([]); setSelected(''); setLoadError('')
    try {
      // Schedule DTO contains the canonical Sport name, not sportId. Resolve against the actual catalog.
      const sports = await api('/sports', { signal })
      const sport = sports.find((s) => s.name === item.sport)
      if (!sport) throw new Error('Không tìm thấy bộ môn của booking. Vui lòng tải lại lịch.')
      const result = await api(`/pt/coaches/${item.coachId}/slots${query({ sportId: sport.id, from: date, to: date })}`, { signal })
      if (!signal.aborted) setSlots(result.filter((s) => s.date !== item.date || s.startTime !== item.startTime))
    } catch (err) { if (!signal.aborted) setLoadError(err.message) }
    finally { if (!signal.aborted) setLoading(false) }
  }, [item, date])
  useEffect(() => {
    const controller = new AbortController()
    if (date) void Promise.resolve().then(() => { if (!controller.signal.aborted) load(controller.signal) })
    return () => controller.abort()
  }, [load, date, reload])
  const close = () => { if (!pending.current) onClose() }
  const submit = async (e) => {
    e.preventDefault()
    const target = slots.find((s) => `${s.date}T${s.startTime}` === selected)
    if (pending.current || loading || !target) return
    pending.current = true; setBusy(true); setError('')
    try {
      const result = await api(`/pt/bookings/${item.bookingId}/reschedule`, { method: 'PUT', body: { date: target.date, startTime: target.startTime, roomId: item.roomId ?? null } })
      let refreshError = ''
      try {
        const updated = await api(`/pt/coaches/${target.coachId}/slots${query({ sportId: target.sportId, from: target.date, to: target.date })}`)
        if (active.current) setSlots(updated)
      } catch (err) { refreshError = err.message }
      if (active.current) onDone(result, refreshError)
    } catch (err) { if (active.current) { setError(err.message); setSelected(''); setReload((r) => r + 1) } }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <Modal title="Đổi lịch PT" onClose={close}>
    <form onSubmit={submit} className="space-y-4">
      <p className="text-secondary">Lịch hiện tại: {item.date} • {fromTimeOnly(item.startTime)}–{fromTimeOnly(item.endTime)} • {item.coach}. Lịch này đang được giữ; vui lòng chọn một khung giờ trống khác.</p>
      {error && <Alert>{error}</Alert>}
      {loadError && <Alert>{loadError}</Alert>}
      <Field label="Ngày mới"><input type="date" className={inputCls} required value={date} disabled={busy} onChange={(e) => { setDate(e.target.value); setSlots([]); setSelected(''); setError(''); if (!e.target.value) setLoading(false) }} /></Field>
      <Field label="Khung giờ còn trống">
        <select className={inputCls} required value={selected} disabled={busy || loading} onChange={(e) => setSelected(e.target.value)}>
          <option value="">{loading ? 'Đang tải slot…' : 'Chọn slot'}</option>
          {slots.map((s) => <option key={`${s.date}T${s.startTime}`} value={`${s.date}T${s.startTime}`}>{s.date} • {fromTimeOnly(s.startTime)}–{fromTimeOnly(s.endTime)}</option>)}
        </select>
      </Field>
      {!loading && !loadError && !slots.length && <p className="text-secondary">Không có slot còn trống trong ngày đã chọn.</p>}
      <div className="flex justify-between gap-2"><button type="button" className={btnOutline} disabled={loading || busy || !date} onClick={() => setReload((r) => r + 1)}>Tải lại slot</button><div className="flex gap-2"><button type="button" className={btnOutline} disabled={busy} onClick={close}>Đóng</button><button type="submit" className={btnPrimary} disabled={busy || loading || !selected}>{busy ? 'Đang lưu…' : 'Lưu lịch mới'}</button></div></div>
    </form>
  </Modal>
}
