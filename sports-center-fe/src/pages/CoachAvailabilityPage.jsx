import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Icon, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { fromTimeOnly, toTimeOnly } from '../dateUtils'
import { DAY_OF_WEEK_LABEL, DAYS_OF_WEEK } from '../labels'

export default function CoachAvailabilityPage() {
  const [sports, setSports] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [items, allSports] = await Promise.all([api('/coach/availability'), api('/sports')])
      setRows(items.map((i) => ({ sportId: i.sportId, dayOfWeek: i.dayOfWeek, startTime: fromTimeOnly(i.startTime), endTime: fromTimeOnly(i.endTime) })))
      setSports(allSports.filter((s) => s.hasPt))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addRow = () => setRows((r) => [...r, { sportId: sports[0]?.id ?? '', dayOfWeek: 'Monday', startTime: '06:00', endTime: '07:00' }])
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx))
  const updateRow = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)))

  const save = async () => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const body = { items: rows.map((r) => ({ sportId: Number(r.sportId), dayOfWeek: r.dayOfWeek, startTime: toTimeOnly(r.startTime), endTime: toTimeOnly(r.endTime) })) }
      await api('/coach/availability', { method: 'PUT', body })
      setNotice('Đã lưu khung giờ rảnh.')
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Khung giờ nhận PT</h1>
        <p className="text-secondary">Các khung giờ hội viên có thể đặt lịch PT với bạn (tối đa 50 khung).</p>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className={`flex flex-col gap-3 ${loading ? 'opacity-50' : ''}`}>
        {rows.map((r, idx) => (
          <div key={idx} className="flex flex-wrap items-end gap-3 bg-surface-container-lowest rounded-xl p-3 shadow-sm">
            <select className={`${inputCls} !h-10 !w-auto`} value={r.sportId} onChange={(e) => updateRow(idx, { sportId: e.target.value })}>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className={`${inputCls} !h-10 !w-auto`} value={r.dayOfWeek} onChange={(e) => updateRow(idx, { dayOfWeek: e.target.value })}>
              {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{DAY_OF_WEEK_LABEL[d]}</option>)}
            </select>
            <input className={`${inputCls} !h-10 !w-auto`} type="time" value={r.startTime} onChange={(e) => updateRow(idx, { startTime: e.target.value })} />
            <input className={`${inputCls} !h-10 !w-auto`} type="time" value={r.endTime} onChange={(e) => updateRow(idx, { endTime: e.target.value })} />
            <button className={btnOutline + ' !h-10 !px-2'} onClick={() => removeRow(idx)} title="Xoá">
              <Icon name="delete" className="text-base" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className={btnOutline} onClick={addRow} disabled={rows.length >= 50 || !sports.length}>
          <Icon name="add" className="text-lg" />
          Thêm khung giờ
        </button>
        <button className={btnPrimary} onClick={save} disabled={busy}>
          {busy ? 'Đang lưu…' : 'Lưu tất cả'}
        </button>
      </div>
    </div>
  )
}
