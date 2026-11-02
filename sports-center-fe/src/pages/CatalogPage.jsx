import { useCallback, useEffect, useState } from 'react'
import { api, apiUpload } from '../api'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { ROOM_STATUS_LABEL, SPORT_STATUS_LABEL } from '../labels'

const SPORT_STATUS_TONE = { Active: 'green', Inactive: 'slate' }
const ROOM_STATUS_TONE = { Active: 'green', Maintenance: 'amber', Inactive: 'slate' }

function SportForm({ sport, onClose, onDone }) {
  const editing = !!sport
  const [form, setForm] = useState({
    name: sport?.name ?? '',
    description: sport?.description ?? '',
    hasClasses: sport?.hasClasses ?? false,
    hasPt: sport?.hasPt ?? false,
    status: sport?.status ?? 'Active',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (k) => () => setForm({ ...form, [k]: !form[k] })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = { ...form, description: form.description || null }
      const result = editing ? await api(`/sports/${sport.id}`, { method: 'PUT', body }) : await api('/sports', { method: 'POST', body })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Sửa bộ môn' : 'Thêm bộ môn'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Tên bộ môn">
          <input className={inputCls} required minLength={2} maxLength={100} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Mô tả" hint="Tối đa 500 ký tự">
          <input className={inputCls} maxLength={500} value={form.description} onChange={set('description')} />
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.hasClasses} onChange={toggle('hasClasses')} />
            Có lớp học
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.hasPt} onChange={toggle('hasPt')} />
            Có PT
          </label>
        </div>
        <Field label="Trạng thái">
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {Object.entries(SPORT_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  )
}

function RoomForm({ room, onClose, onDone }) {
  const editing = !!room
  const [form, setForm] = useState({
    name: room?.name ?? '',
    capacity: room?.capacity ?? 10,
    status: room?.status ?? 'Active',
    imageUrls: room?.imageUrls ?? [],
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setError('')
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((f) => apiUpload(f).then((r) => r.url)))
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }))
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
    e.target.value = ''
  }
  const removeImage = (url) => setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = { ...form, capacity: Number(form.capacity) }
      const result = editing ? await api(`/rooms/${room.id}`, { method: 'PUT', body }) : await api('/rooms', { method: 'POST', body })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Sửa phòng tập' : 'Thêm phòng tập'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Tên phòng">
          <input className={inputCls} required minLength={2} maxLength={100} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Hình ảnh phòng" hint="Ảnh đầu tiên là ảnh chính, các ảnh sau là ảnh chi tiết — dùng làm banner cho các lớp học trong phòng này">
          <div className="flex flex-wrap gap-3">
            {form.imageUrls.map((url, i) => (
              <div key={url} className="relative w-20 h-20 shrink-0">
                <img src={url} alt="" className="w-full h-full rounded-lg object-cover border border-outline-variant" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary-container text-on-primary text-[10px] font-semibold leading-none">Chính</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-on-error flex items-center justify-center shadow"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              </div>
            ))}
            <label className={`${btnOutline} cursor-pointer !w-20 !h-20 flex-col gap-1 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              <Icon name="add_photo_alternate" className="text-xl" />
              <span className="text-label-sm">{uploading ? 'Đang tải…' : 'Thêm ảnh'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={uploadImages} />
            </label>
          </div>
        </Field>
        <Field label="Sức chứa">
          <input className={inputCls} type="number" required min={1} max={10000} value={form.capacity} onChange={set('capacity')} />
        </Field>
        <Field label="Trạng thái">
          <select className={inputCls} value={form.status} onChange={set('status')}>
            {Object.entries(ROOM_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function CatalogPage({ embedded = false }) {
  const [sports, setSports] = useState([])
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { type: 'sport'|'room', item? }
  const [sportSearch, setSportSearch] = useState('')
  const [sportStatus, setSportStatus] = useState('all')
  const [roomSearch, setRoomSearch] = useState('')
  const [roomStatus, setRoomStatus] = useState('all')

  const filteredSports = sports
    .filter((s) => sportStatus === 'all' || s.status === sportStatus)
    .filter((s) => !sportSearch.trim() || s.name.toLowerCase().includes(sportSearch.trim().toLowerCase()))
  const filteredRooms = rooms
    .filter((r) => roomStatus === 'all' || r.status === roomStatus)
    .filter((r) => !roomSearch.trim() || r.name.toLowerCase().includes(roomSearch.trim().toLowerCase()))

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [s, r] = await Promise.all([api('/sports'), api('/rooms')])
      setSports(s)
      setRooms(r)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const done = () => {
    setModal(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {embedded ? <h2 className="font-headline-md text-headline-md">Bộ môn & phòng tập</h2> : <h1 className="font-headline-xl text-headline-xl">Danh mục trung tâm</h1>}
        <p className="text-secondary">Bộ môn và phòng tập dùng để xếp lớp, đặt lịch PT.</p>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-container">
          <h2 className="font-headline-md text-headline-md">Bộ môn</h2>
          <div className="flex items-center gap-2">
            <input className={inputCls + ' !w-48'} placeholder="Tìm theo tên…" value={sportSearch} onChange={(e) => setSportSearch(e.target.value)} />
            <select className={inputCls + ' !w-40'} value={sportStatus} onChange={(e) => setSportStatus(e.target.value)}>
              <option value="all">— Tất cả —</option>
              {Object.entries(SPORT_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button className={btnPrimary} onClick={() => setModal({ type: 'sport' })}>
              <Icon name="add" className="text-lg" />
              Thêm bộ môn
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Lớp học</th>
              <th className="px-4 py-3">PT</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {filteredSports.map((s) => (
              <tr key={s.id} className="border-t border-surface-container">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-secondary">{s.description ?? '—'}</td>
                <td className="px-4 py-3">{s.hasClasses ? 'Có' : '—'}</td>
                <td className="px-4 py-3">{s.hasPt ? 'Có' : '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={SPORT_STATUS_TONE[s.status]}>{SPORT_STATUS_LABEL[s.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className={btnOutline + ' !h-8 !px-2'} title="Sửa" onClick={() => setModal({ type: 'sport', item: s })}>
                    <Icon name="edit" className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !sports.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Chưa có bộ môn nào.</td></tr>
            )}
            {!loading && sports.length > 0 && !filteredSports.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Không có bộ môn khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-container">
          <h2 className="font-headline-md text-headline-md">Phòng tập</h2>
          <div className="flex items-center gap-2">
            <input className={inputCls + ' !w-48'} placeholder="Tìm theo tên…" value={roomSearch} onChange={(e) => setRoomSearch(e.target.value)} />
            <select className={inputCls + ' !w-40'} value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)}>
              <option value="all">— Tất cả —</option>
              {Object.entries(ROOM_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button className={btnPrimary} onClick={() => setModal({ type: 'room' })}>
              <Icon name="add" className="text-lg" />
              Thêm phòng
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Sức chứa</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {filteredRooms.map((r) => (
              <tr key={r.id} className="border-t border-surface-container">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.imageUrls?.[0] ? (
                      <img src={r.imageUrls[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-outline-variant" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                        <Icon name="image" className="text-outline text-lg" />
                      </div>
                    )}
                    <span className="font-semibold">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{r.capacity}</td>
                <td className="px-4 py-3">
                  <Badge tone={ROOM_STATUS_TONE[r.status]}>{ROOM_STATUS_LABEL[r.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className={btnOutline + ' !h-8 !px-2'} title="Sửa" onClick={() => setModal({ type: 'room', item: r })}>
                    <Icon name="edit" className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !rooms.length && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-secondary">Chưa có phòng tập nào.</td></tr>
            )}
            {!loading && rooms.length > 0 && !filteredRooms.length && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-secondary">Không có phòng khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal?.type === 'sport' && <SportForm sport={modal.item} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'room' && <RoomForm room={modal.item} onClose={() => setModal(null)} onDone={done} />}
    </div>
  )
}
