import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { useAuth } from '../auth'
import { formatTimestamp } from '../dateUtils'
import { ROLE_LABEL } from '../labels'
import usePaged from '../usePaged'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from './ui'

const STATUS = {
  Open: ['Chờ xử lý', 'amber'],
  InProgress: ['Đang xử lý', 'indigo'],
  WaitingForMember: ['Chờ hội viên phản hồi', 'slate'],
  Resolved: ['Đã giải quyết', 'green'],
  Closed: ['Đã đóng', 'slate'],
}
const CATEGORY = {
  Payment: 'Thanh toán & số dư',
  Membership: 'Gói tập',
  Schedule: 'Lịch học & PT',
  Facility: 'Cơ sở vật chất',
  Account: 'Tài khoản',
  Other: 'Khác',
}
const statusLabel = (s, staff) => (!staff && s === 'WaitingForMember' ? 'Chờ bạn phản hồi' : STATUS[s]?.[0] ?? s)
// Course enrollment support is filed by another flow with a machine subject.
const subjectText = (s) => s.replace(/^Course:\d+:Enrollment:(\d+)$/, 'Hỗ trợ khóa học đã mua (đăng ký #$1)')

function StatusBadge({ status, staff }) {
  return <Badge tone={STATUS[status]?.[1] ?? 'slate'}>{statusLabel(status, staff)}</Badge>
}

function RequestRow({ r, staff, onOpen }) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(r.id)} className="w-full text-left px-4 py-3 hover:bg-surface-container flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{subjectText(r.subject)}</span>
          <StatusBadge status={r.status} staff={staff} />
          <Badge tone="indigo">{CATEGORY[r.category] ?? r.category}</Badge>
        </div>
        <p className="text-body-sm text-secondary line-clamp-1">{r.description}</p>
        <p className="text-body-sm text-secondary">
          {staff && <>{r.memberName} • </>}Cập nhật {formatTimestamp(r.lastActivityAt)}{r.handledByName ? ` • Phụ trách: ${r.handledByName}` : ''}
        </p>
      </button>
    </li>
  )
}

function SupportThread({ id, staff, onChanged }) {
  const { auth } = useAuth()
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => api(`/support-requests/${id}`).then(setDetail).catch((err) => setError(err.message)), [id])
  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const run = async (fn) => {
    setBusy(true); setError('')
    try { setDetail(await fn()); onChanged?.() } catch (err) { setError(err.message) }
    setBusy(false)
  }
  const reply = (e) => {
    e.preventDefault()
    run(async () => {
      const d = await api(`/support-requests/${id}/messages`, { method: 'POST', body: { body: body.trim(), isInternal: staff && internal } })
      setBody(''); setInternal(false)
      return d
    })
  }
  const setStatus = (status) => run(async () => {
    await api(`/support-requests/${id}/status`, { method: 'PATCH', body: { status } })
    return api(`/support-requests/${id}`)
  })

  if (!detail) return error ? <Alert>{error}</Alert> : <p role="status">Đang tải…</p>
  const r = detail.request
  const done = r.status === 'Resolved' || r.status === 'Closed'
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={r.status} staff={staff} />
        <Badge tone="indigo">{CATEGORY[r.category] ?? r.category}</Badge>
        <span className="text-body-sm text-secondary">#{r.id} • Tạo {formatTimestamp(r.createdAt)}</span>
      </div>
      {staff && (
        <p className="text-body-sm">
          Hội viên: <Link className="underline font-semibold" to={`/reception/members/${r.memberId}`}>{r.memberName}</Link> ({r.memberEmail})
          {r.createdByName && <> • Ghi nhận tại quầy bởi {r.createdByName}</>}
          {r.handledByName && <> • Phụ trách: {r.handledByName}</>}
        </p>
      )}
      {error && <Alert>{error}</Alert>}

      <ol className="flex flex-col gap-3">
        <li className="rounded-lg border border-outline-variant p-3">
          <p className="text-body-sm text-secondary pb-1">{r.memberName}{r.createdByName ? ` (lễ tân ${r.createdByName} ghi nhận)` : ''}</p>
          <p className="whitespace-pre-wrap">{r.description}</p>
        </li>
        {detail.messages.map((m) => {
          const mine = m.authorId === auth.userId
          const fromStaff = m.authorRole !== 'Member'
          return (
            <li key={m.id} className={`rounded-lg p-3 border ${m.isInternal ? 'bg-amber-50 border-amber-300' : fromStaff ? 'bg-primary-container/10 border-primary-container/40' : 'border-outline-variant'} ${mine ? 'ml-6' : 'mr-6'}`}>
              <p className="text-body-sm text-secondary pb-1">
                {m.isInternal && <b className="text-amber-700">Ghi chú nội bộ • </b>}
                {m.authorName}{fromStaff ? ` (${ROLE_LABEL[m.authorRole] ?? m.authorRole})` : ''} • {formatTimestamp(m.createdAt)}
              </p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </li>
          )
        })}
      </ol>

      {r.status === 'Closed' ? (
        <p className="text-secondary text-body-sm">Yêu cầu đã đóng. Mở lại nếu cần trao đổi thêm.</p>
      ) : (
        <form onSubmit={reply} className="flex flex-col gap-2">
          <textarea className={inputCls + ' !h-24 py-2'} required maxLength={2000} placeholder={staff ? 'Trả lời hội viên…' : 'Nhập phản hồi…'} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {staff ? (
              <label className="flex items-center gap-2 text-body-sm"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Ghi chú nội bộ (hội viên không thấy)</label>
            ) : <span />}
            <button type="submit" disabled={busy || !body.trim()} className={btnPrimary + ' !h-9'}><Icon name="send" className="text-base" />{internal ? 'Lưu ghi chú' : 'Gửi'}</button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-outline-variant/40 pt-3">
        {staff && r.status === 'Open' && <button className={btnOutline + ' !h-9'} disabled={busy} onClick={() => setStatus('InProgress')}>Nhận xử lý</button>}
        {staff && !done && <button className={btnPrimary + ' !h-9'} disabled={busy} onClick={() => setStatus('Resolved')}>Đánh dấu đã giải quyết</button>}
        {done && <button className={btnOutline + ' !h-9'} disabled={busy} onClick={() => setStatus(staff ? 'InProgress' : 'Open')}>Mở lại</button>}
        {r.status !== 'Closed' && <button className={btnOutline + ' !h-9'} disabled={busy} onClick={() => setStatus('Closed')}>{staff ? 'Đóng yêu cầu' : 'Đóng yêu cầu (đã xong)'}</button>}
      </div>
    </div>
  )
}

function MemberPicker({ value, onChange }) {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  useEffect(() => {
    if (value || !q.trim()) return
    const c = new AbortController()
    const t = setTimeout(() => api(`/members${query({ q: q.trim(), pageSize: 10 })}`, { signal: c.signal }).then((r) => setItems(r.items)).catch(() => {}), 300)
    return () => { clearTimeout(t); c.abort() }
  }, [q, value])
  if (value) return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant px-3 py-2">
      <span><b>{value.fullName}</b> #{value.id} • {value.email}</span>
      <button type="button" className={btnOutline + ' !h-8'} onClick={() => onChange(null)}>Đổi</button>
    </div>
  )
  return (
    <div className="flex flex-col gap-1">
      <input className={inputCls} placeholder="Tìm theo mã, tên, email, SĐT…" value={q} onChange={(e) => setQ(e.target.value)} />
      {q.trim() && (
        <ul className="rounded-lg border border-outline-variant max-h-48 overflow-y-auto">
          {items.map((m) => (
            <li key={m.id}><button type="button" className="w-full text-left px-3 py-2 hover:bg-surface-container" onClick={() => onChange(m)}>{m.fullName} #{m.id} • {m.email}</button></li>
          ))}
          {!items.length && <li className="px-3 py-2 text-secondary text-body-sm">Không tìm thấy.</li>}
        </ul>
      )}
    </div>
  )
}

// Member files their own; staff log one on behalf of a member (e.g. a question asked at the desk).
export function CreateSupportModal({ staff, member = null, onClose, onDone }) {
  const [form, setForm] = useState({ category: 'Other', subject: '', description: '' })
  const [target, setTarget] = useState(member)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    if (staff && !target) { setError('Chọn hội viên trước.'); return }
    setBusy(true); setError('')
    try {
      const created = await api('/support-requests', { method: 'POST', body: { ...form, subject: form.subject.trim(), description: form.description.trim(), memberId: staff ? target.id : null } })
      onDone(created)
    } catch (err) { setError(err.message); setBusy(false) }
  }
  return (
    <Modal title={staff ? 'Ghi nhận yêu cầu cho hội viên' : 'Gửi yêu cầu hỗ trợ'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        {staff && <Field label="Hội viên"><MemberPicker value={target} onChange={setTarget} /></Field>}
        <Field label="Loại yêu cầu">
          <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {Object.entries(CATEGORY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Tiêu đề"><input className={inputCls} required minLength={2} maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
        <Field label="Nội dung"><textarea className={inputCls + ' !h-28 py-2'} required minLength={2} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang gửi…' : staff ? 'Ghi nhận' : 'Gửi yêu cầu'}</button>
        </div>
      </form>
    </Modal>
  )
}

export function MemberSupportPage() {
  const { data, loading, error, reload, pagination, setPage } = usePaged('/support-requests/mine')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState(null)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Hỗ trợ</h1>
          <p className="text-secondary">Gửi câu hỏi hoặc vấn đề cho trung tâm và trao đổi trực tiếp với lễ tân. Bạn sẽ nhận thông báo khi có phản hồi.</p>
        </div>
        <button className={btnPrimary} onClick={() => setCreating(true)}><Icon name="add" className="text-lg" />Gửi yêu cầu mới</button>
      </div>
      {error && <Alert>{error}</Alert>}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm">
        <ul className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
          {data.items.map((r) => <RequestRow key={r.id} r={r} staff={false} onOpen={setOpenId} />)}
          {!loading && !data.items.length && <li className="px-4 py-10 text-center text-secondary">Bạn chưa gửi yêu cầu nào.</li>}
        </ul>
        {pagination}
      </section>
      {creating && <CreateSupportModal staff={false} onClose={() => setCreating(false)} onDone={(r) => { setCreating(false); setPage(1); reload(); setOpenId(r.id) }} />}
      {openId && <Modal title="Yêu cầu hỗ trợ" onClose={() => setOpenId(null)}><SupportThread id={openId} staff={false} onChanged={reload} /></Modal>}
    </div>
  )
}

export function SupportDeskPage() {
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const { data, loading, error, reload, pagination, setPage } = usePaged(`/support-requests${query({ status, category, q: search })}`)
  const [summary, setSummary] = useState(null)
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState(null)
  const loadSummary = useCallback(() => api('/support-requests/summary').then(setSummary).catch(() => {}), [])
  useEffect(() => { void Promise.resolve().then(loadSummary) }, [loadSummary])
  useEffect(() => { const t = setTimeout(() => { setSearch(q.trim()); setPage(1) }, 300); return () => clearTimeout(t) }, [q, setPage])
  const changed = () => { reload(); loadSummary() }
  const chip = (key, label, count) => (
    <button key={key} type="button" onClick={() => { setStatus(status === key ? '' : key); setPage(1) }}
      className={`rounded-xl px-4 py-3 text-left border ${status === key ? 'border-primary bg-primary-container/10' : 'border-outline-variant/40 bg-surface-container-lowest'}`}>
      <span className="block text-body-sm text-secondary">{label}</span>
      <span className="font-headline-md text-headline-md">{count ?? '—'}</span>
    </button>
  )
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Yêu cầu hỗ trợ</h1>
          <p className="text-secondary">Trả lời, ghi chú nội bộ và cập nhật trạng thái. Hội viên được thông báo khi có phản hồi.</p>
        </div>
        <button className={btnPrimary} onClick={() => setCreating(true)}><Icon name="add" className="text-lg" />Ghi nhận yêu cầu tại quầy</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {chip('Open', 'Chờ xử lý', summary?.open)}
        {chip('InProgress', 'Đang xử lý', summary?.inProgress)}
        {chip('WaitingForMember', 'Chờ hội viên phản hồi', summary?.waitingForMember)}
      </div>
      <div className="bg-surface-container rounded-xl shadow-sm p-5 grid sm:grid-cols-3 gap-4">
        <Field label="Trạng thái">
          <select className={inputCls} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">Tất cả</option>
            {Object.entries(STATUS).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Loại">
          <select className={inputCls} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
            <option value="">Tất cả</option>
            {Object.entries(CATEGORY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Tìm kiếm"><input className={inputCls} placeholder="Tiêu đề, tên hoặc email hội viên…" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
      </div>
      {error && <Alert>{error}</Alert>}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm">
        <ul className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
          {data.items.map((r) => <RequestRow key={r.id} r={r} staff onOpen={setOpenId} />)}
          {!loading && !data.items.length && <li className="px-4 py-10 text-center text-secondary">Không có yêu cầu nào.</li>}
        </ul>
        {pagination}
      </section>
      {creating && <CreateSupportModal staff onClose={() => setCreating(false)} onDone={(r) => { setCreating(false); changed(); setOpenId(r.id) }} />}
      {openId && <Modal title="Yêu cầu hỗ trợ" onClose={() => setOpenId(null)}><SupportThread id={openId} staff onChanged={changed} /></Modal>}
    </div>
  )
}

// Sidebar counter: requests nobody has finished yet (new + in progress).
export function SupportBadge() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const load = () => api('/support-requests/summary').then((s) => setCount(s.open + s.inProgress)).catch(() => {})
    void Promise.resolve().then(load)
    const timer = setInterval(load, 60000)
    window.addEventListener('sc:api-mutated', load)
    window.addEventListener('focus', load)
    return () => { clearInterval(timer); window.removeEventListener('sc:api-mutated', load); window.removeEventListener('focus', load) }
  }, [])
  if (!count) return null
  return <span className="ml-auto bg-error text-white rounded-full px-1.5 text-xs" aria-label={`${count} yêu cầu cần xử lý`}>{count > 99 ? '99+' : count}</span>
}
