import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { OpenCheckInCodeButton } from '../components/classCheckIn'
import { toTimeOnly, fromTimeOnly } from '../dateUtils'
import { Alert, Badge, Field, Icon, Modal, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { CLASS_STATUS_LABEL, DAYS_OF_WEEK, DAY_OF_WEEK_LABEL, LEVEL_LABEL, SESSION_STATUS_LABEL } from '../labels'

const CLASS_STATUS_TONE = { Draft: 'slate', Open: 'green', Closed: 'amber', Cancelled: 'red' }
const SESSION_STATUS_TONE = { Scheduled: 'green', Completed: 'slate', Cancelled: 'red' }
const CREATABLE_STATUSES = ['Draft', 'Open', 'Closed']

function useCatalog() {
  const [sports, setSports] = useState([])
  const [rooms, setRooms] = useState([])
  const [coaches, setCoaches] = useState([])
  useEffect(() => {
    api('/sports').then(setSports).catch(() => {})
    api('/rooms').then(setRooms).catch(() => {})
    api(`/users${query({ role: 'Coach', pageSize: 50 })}`).then((r) => setCoaches(r.items)).catch(() => {})
  }, [])
  return { sports, rooms, coaches }
}

function ClassForm({ cls, catalog, onClose, onDone }) {
  const editing = !!cls
  const [form, setForm] = useState({
    name: cls?.name ?? '',
    sportId: cls?.sportId ?? '',
    roomId: cls?.roomId ?? '',
    coachId: cls?.coachId ?? '',
    capacity: cls?.capacity ?? 20,
    level: cls?.level ?? 'Beginner',
    startDate: cls?.startDate ?? '',
    endDate: cls?.endDate ?? '',
    status: cls?.status ?? 'Draft',
    description: cls?.description ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = {
        ...form,
        sportId: Number(form.sportId),
        roomId: Number(form.roomId),
        coachId: form.coachId ? Number(form.coachId) : null,
        capacity: Number(form.capacity),
        description: form.description || null,
      }
      const result = editing ? await api(`/classes/${cls.id}`, { method: 'PUT', body }) : await api('/classes', { method: 'POST', body })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Sửa lớp học' : 'Tạo lớp học'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Tên lớp">
          <input className={inputCls} required minLength={2} maxLength={150} value={form.name} onChange={set('name')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bộ môn">
            <select className={inputCls} required value={form.sportId} onChange={set('sportId')}>
              <option value="">Chọn bộ môn</option>
              {catalog.sports.filter((s) => s.hasClasses).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Phòng">
            <select className={inputCls} required value={form.roomId} onChange={set('roomId')}>
              <option value="">Chọn phòng</option>
              {catalog.rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name} (sức chứa {r.capacity})</option>
              ))}
            </select>
          </Field>
        </div>
        {!editing && (
          <Field label="Huấn luyện viên" hint="Có thể gán sau bằng nút “Gán HLV”">
            <select className={inputCls} value={form.coachId} onChange={set('coachId')}>
              <option value="">Chưa gán</option>
              {catalog.coaches.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName}</option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sức chứa">
            <input className={inputCls} type="number" required min={1} max={10000} value={form.capacity} onChange={set('capacity')} />
          </Field>
          <Field label="Cấp độ">
            <select className={inputCls} value={form.level} onChange={set('level')}>
              {Object.entries(LEVEL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày bắt đầu">
            <input className={inputCls} type="date" required value={form.startDate} onChange={set('startDate')} />
          </Field>
          <Field label="Ngày kết thúc">
            <input className={inputCls} type="date" required value={form.endDate} onChange={set('endDate')} />
          </Field>
        </div>
        <Field label="Trạng thái">
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {CREATABLE_STATUSES.map((v) => (
              <option key={v} value={v}>{CLASS_STATUS_LABEL[v]}</option>
            ))}
          </select>
        </Field>
        <Field label="Mô tả">
          <input className={inputCls} maxLength={1000} value={form.description} onChange={set('description')} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  )
}

function AssignCoachModal({ cls, catalog, onClose, onDone }) {
  const [coachId, setCoachId] = useState(cls.coachId ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await api(`/classes/${cls.id}/coach`, { method: 'PUT', body: { coachId: Number(coachId) } })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={`Gán HLV cho “${cls.name}”`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Huấn luyện viên">
          <select className={inputCls} required value={coachId} onChange={(e) => setCoachId(e.target.value)}>
            <option value="">Chọn HLV</option>
            {catalog.coaches.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Gán'}</button>
        </div>
      </form>
    </Modal>
  )
}

function GenerateSessionsModal({ cls, onClose, onDone }) {
  const [days, setDays] = useState([])
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('19:00')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = { daysOfWeek: days, startTime: toTimeOnly(startTime), endTime: toTimeOnly(endTime) }
      const result = await api(`/classes/${cls.id}/sessions/generate`, { method: 'POST', body })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={`Tạo buổi học cho “${cls.name}”`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Các ngày trong tuần">
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((d) => (
              <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={days.includes(d)} onChange={() => toggleDay(d)} />
                {DAY_OF_WEEK_LABEL[d]}
              </label>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giờ bắt đầu">
            <input className={inputCls} type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </Field>
          <Field label="Giờ kết thúc">
            <input className={inputCls} type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy || !days.length} className={btnPrimary}>{busy ? 'Đang tạo…' : 'Tạo buổi học'}</button>
        </div>
      </form>
    </Modal>
  )
}

function SessionEditForm({ session, catalog, onClose, onDone }) {
  const [form, setForm] = useState({
    date: session.date,
    startTime: fromTimeOnly(session.startTime),
    endTime: fromTimeOnly(session.endTime),
    roomId: session.roomId,
    note: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = {
        date: form.date,
        startTime: toTimeOnly(form.startTime),
        endTime: toTimeOnly(form.endTime),
        roomId: Number(form.roomId),
        note: form.note || null,
      }
      const result = await api(`/sessions/${session.id}`, { method: 'PUT', body })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={`Sửa buổi học — ${session.className}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Ngày">
          <input className={inputCls} type="date" required value={form.date} onChange={set('date')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giờ bắt đầu">
            <input className={inputCls} type="time" required value={form.startTime} onChange={set('startTime')} />
          </Field>
          <Field label="Giờ kết thúc">
            <input className={inputCls} type="time" required value={form.endTime} onChange={set('endTime')} />
          </Field>
        </div>
        <Field label="Phòng">
          <select className={inputCls} required value={form.roomId} onChange={set('roomId')}>
            {catalog.rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Ghi chú">
          <input className={inputCls} maxLength={500} value={form.note} onChange={set('note')} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  )
}

function CancelSessionModal({ session, onClose, onConfirm, busy, error }) {
  const [reason, setReason] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onConfirm(reason)
  }

  return (
    <Modal title="Huỷ buổi học" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <p className="text-on-surface">
          Huỷ buổi <b>"{session.className}"</b> ngày {session.date} lúc {fromTimeOnly(session.startTime)}? Hội viên đã đặt sẽ được thông báo.
        </p>
        <Field label="Lý do huỷ">
          <input className={inputCls} required minLength={2} maxLength={500} autoFocus value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Đóng</button>
          <button type="submit" disabled={busy} className={btnPrimary + ' !bg-error !text-white hover:!opacity-90'}>
            {busy ? 'Đang huỷ…' : 'Huỷ buổi học'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ClassesTab({ catalog }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api(`/classes${query({ page, pageSize })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const done = (result) => {
    const wasGenerate = modal?.type === 'generate'
    setModal(null)
    setNotice(wasGenerate ? `Đã tạo ${result.created} buổi học mới (${result.existing} buổi đã tồn tại từ trước).` : '')
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button className={btnPrimary} onClick={() => setModal({ type: 'form' })}>
          <Icon name="add" className="text-lg" />
          Tạo lớp học
        </button>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Lớp học</th>
              <th className="px-4 py-3">Bộ môn / Phòng</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {data.items.map((c) => (
              <tr key={c.id} className="border-t border-surface-container">
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-secondary text-body-sm">Sức chứa {c.capacity} • {LEVEL_LABEL[c.level]}</div>
                </td>
                <td className="px-4 py-3">{c.sport} / {c.room}</td>
                <td className="px-4 py-3">{c.coach ?? <span className="text-secondary">Chưa gán</span>}</td>
                <td className="px-4 py-3 text-body-sm">{c.startDate} → {c.endDate}</td>
                <td className="px-4 py-3">
                  <Badge tone={CLASS_STATUS_TONE[c.status]}>{CLASS_STATUS_LABEL[c.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className={btnOutline + ' !h-8 !px-2'} title="Sửa" onClick={() => setModal({ type: 'form', cls: c })}>
                      <Icon name="edit" className="text-base" />
                    </button>
                    <button className={btnOutline + ' !h-8 !px-2'} title="Gán HLV" onClick={() => setModal({ type: 'assign', cls: c })}>
                      <Icon name="person" className="text-base" />
                    </button>
                    <button className={btnOutline + ' !h-8 !px-2'} title="Tạo buổi học" onClick={() => setModal({ type: 'generate', cls: c })}>
                      <Icon name="event_repeat" className="text-base" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !data.items.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Chưa có lớp học nào.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={data.total} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      </div>

      {modal?.type === 'form' && <ClassForm cls={modal.cls} catalog={catalog} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'assign' && <AssignCoachModal cls={modal.cls} catalog={catalog} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'generate' && <GenerateSessionsModal cls={modal.cls} onClose={() => setModal(null)} onDone={done} />}
    </div>
  )
}

function SessionsTab({ catalog }) {
  const [filters, setFilters] = useState({ sportId: '', coachId: '', level: '', from: '', to: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api(`/sessions${query({ ...filters, page, pageSize })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filters, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.value })
    setPage(1)
  }

  const confirmCancelSession = async (reason) => {
    setCancelBusy(true)
    setCancelError('')
    try {
      await api(`/sessions/${cancelling.id}/cancel`, { method: 'PATCH', body: { reason } })
      setCancelling(null)
      load()
    } catch (err) {
      setCancelError(err.message)
    }
    setCancelBusy(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Field label="Bộ môn">
            <select className={inputCls} value={filters.sportId} onChange={setFilter('sportId')}>
              <option value="">— Tất cả —</option>
              {catalog.sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="HLV">
            <select className={inputCls} value={filters.coachId} onChange={setFilter('coachId')}>
              <option value="">— Tất cả —</option>
              {catalog.coaches.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </Field>
          <Field label="Cấp độ">
            <select className={inputCls} value={filters.level} onChange={setFilter('level')}>
              <option value="">— Tất cả —</option>
              {Object.entries(LEVEL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Từ ngày">
            <input className={inputCls} type="date" value={filters.from} onChange={setFilter('from')} />
          </Field>
          <Field label="Đến ngày">
            <input className={inputCls} type="date" value={filters.to} onChange={setFilter('to')} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            className={btnOutline}
            onClick={() => {
              setFilters({ sportId: '', coachId: '', level: '', from: '', to: '' })
              setPage(1)
            }}
          >
            Đặt lại
          </button>
          <button type="button" className={btnPrimary} onClick={load}>Tìm kiếm</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Buổi học</th>
              <th className="px-4 py-3">Ngày / Giờ</th>
              <th className="px-4 py-3">Phòng</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Chỗ trống</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {data.items.map((s) => (
              <tr key={s.id} className="border-t border-surface-container">
                <td className="px-4 py-3 font-semibold">{s.className}</td>
                <td className="px-4 py-3 text-body-sm">{s.date} • {fromTimeOnly(s.startTime)}-{fromTimeOnly(s.endTime)}</td>
                <td className="px-4 py-3">{s.room}</td>
                <td className="px-4 py-3">{s.coach ?? '—'}</td>
                <td className="px-4 py-3">{s.remainingSeats}/{s.capacity}</td>
                <td className="px-4 py-3">
                  <Badge tone={SESSION_STATUS_TONE[s.status]}>{SESSION_STATUS_LABEL[s.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {s.status === 'Scheduled' && (
                      <>
                        <button className={btnOutline + ' !h-8 !px-2'} title="Sửa" onClick={() => setEditing(s)}>
                          <Icon name="edit" className="text-base" />
                        </button>
                        <OpenCheckInCodeButton sessionId={s.id} />
                        <button className={btnOutline + ' !h-8 !px-2'} title="Huỷ buổi học" onClick={() => setCancelling(s)}>
                          <Icon name="event_busy" className="text-base" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !data.items.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Không có buổi học phù hợp.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={data.total} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
      </div>

      {editing && (
        <SessionEditForm
          session={editing}
          catalog={catalog}
          onClose={() => setEditing(null)}
          onDone={() => { setEditing(null); load() }}
        />
      )}
      {cancelling && (
        <CancelSessionModal
          session={cancelling}
          busy={cancelBusy}
          error={cancelError}
          onClose={() => {
            setCancelling(null)
            setCancelError('')
          }}
          onConfirm={confirmCancelSession}
        />
      )}
    </div>
  )
}

export default function ManagerClassesPage() {
  const [tab, setTab] = useState('classes')
  const catalog = useCatalog()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Lịch & lớp học</h1>
        <p className="text-secondary">Tạo lớp, phân bổ HLV, sinh buổi học theo chu kỳ và quản lý từng buổi.</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {[['classes', 'Lớp học'], ['sessions', 'Buổi học']].map(([v, l]) => (
          <button
            key={v}
            className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === v ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'classes' ? <ClassesTab catalog={catalog} /> : <SessionsTab catalog={catalog} />}
    </div>
  )
}
