import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api, getAuth, query } from '../api'
import { formatTimestamp } from '../dateUtils'
import { CLASS_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from '../labels'
import { Alert, Badge, Field, Icon, Modal, Pagination, btnOutline, btnPrimary, inputCls } from './ui'

const vnd = (n) => `${Number(n ?? 0).toLocaleString('vi-VN')}đ`

const SUPPORT_STATUS_LABEL ={ Open: 'Chờ xử lý', InProgress: 'Đang xử lý', Resolved: 'Đã giải quyết' }
const SUPPORT_TONE = { Open: 'amber', InProgress: 'indigo', Resolved: 'green' }
const PAYMENT_TONE = { Pending: 'amber', Paid: 'green', Failed: 'red', Refunded: 'slate' }
const PAYMENT_PURPOSE_LABEL = { WalletTopUp: 'Nạp số dư', LegacySubscription: 'Gói tập' }
const paymentItem = (p) => p.planName ?? PAYMENT_PURPOSE_LABEL[p.purpose] ?? 'Thanh toán'

function usePaged(path) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async (signal) => {
    setLoading(true); setError('')
    try {
      const result = await api(`${path}${path.includes('?') ? '&' : '?'}page=${page}&pageSize=${pageSize}`, { signal })
      if (!signal?.aborted) setData(result)
    } catch (err) { if (!signal?.aborted) setError(err.message) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [path, page, pageSize])
  useEffect(() => {
    const c = new AbortController()
    void Promise.resolve().then(() => load(c.signal))
    return () => c.abort()
  }, [load])
  const pagination = <Pagination page={page} pageSize={pageSize} total={data.total} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
  return { data, loading, error, reload: () => load(), pagination, setPage }
}

// Receptionist signs a member up at the desk; the temp password is shown once and must be changed on first login.
export function NewMemberModal({ onClose, onDone }) {
  const [form, setForm] = useState({ email: '', fullName: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      setCreated(await api('/members', { method: 'POST', body: { email: form.email.trim(), fullName: form.fullName.trim(), phone: form.phone.trim() || null } }))
    } catch (err) { setError(err.message) }
    setBusy(false)
  }
  if (created) return (
    <Modal title="Đã tạo tài khoản hội viên" onClose={() => onDone(created.user)}>
      <div className="flex flex-col gap-4">
        <Alert type="success">Đã tạo tài khoản cho <b>{created.user.fullName}</b> ({created.user.email}).</Alert>
        <p>Mật khẩu tạm (chỉ hiển thị một lần, hội viên phải đổi khi đăng nhập lần đầu):</p>
        <p className="font-mono text-headline-md text-center bg-surface-container rounded-lg py-3 select-all">{created.tempPassword}</p>
        <div className="flex justify-end"><button className={btnPrimary} onClick={() => onDone(created.user)}>Mở hồ sơ hội viên</button></div>
      </div>
    </Modal>
  )
  return (
    <Modal title="Đăng ký hội viên mới" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Họ tên"><input className={inputCls} required maxLength={100} value={form.fullName} onChange={set('fullName')} /></Field>
        <Field label="Email"><input className={inputCls} required type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Số điện thoại"><input className={inputCls} type="tel" value={form.phone} onChange={set('phone')} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang tạo…' : 'Tạo tài khoản'}</button>
        </div>
      </form>
    </Modal>
  )
}

export function PaymentHistory({ memberId }) {
  const { data, loading, error, pagination } = usePaged(`/payments/history${query({ memberId })}`)
  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
      <h2 className="font-headline-md text-headline-md px-4 py-3 border-b border-surface-container">Lịch sử thanh toán & hoá đơn</h2>
      {error && <div className="p-4"><Alert>{error}</Alert></div>}
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
            <th className="px-4 py-3">Hoá đơn</th>
            <th className="px-4 py-3">Nội dung</th>
            <th className="px-4 py-3">Thời gian</th>
            <th className="px-4 py-3">Phương thức</th>
            <th className="px-4 py-3 text-right">Số tiền</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className={loading ? 'opacity-50' : ''}>
          {data.items.map((p) => (
            <tr key={p.id} className="border-t border-surface-container">
              <td className="px-4 py-3 text-secondary">{p.invoiceNumber ?? `#${p.id}`}</td>
              <td className="px-4 py-3 font-semibold">{paymentItem(p)}</td>
              <td className="px-4 py-3 text-secondary">{p.status === 'Paid' ? formatTimestamp(p.paidAt) : '—'}</td>
              <td className="px-4 py-3 text-secondary">{PAYMENT_METHOD_LABEL[p.method] ?? p.method}</td>
              <td className="px-4 py-3 text-right font-semibold">{vnd(p.amount)}</td>
              <td className="px-4 py-3"><Badge tone={PAYMENT_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status] ?? p.status}</Badge></td>
              <td className="px-4 py-3 text-right">
                {p.status === 'Paid' && <Link to={`/invoice/${p.id}`} target="_blank" className={btnOutline + ' !h-8'}><Icon name="print" className="text-base" />In hoá đơn</Link>}
              </td>
            </tr>
          ))}
          {!loading && !data.items.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Chưa có giao dịch.</td></tr>}
        </tbody>
      </table>
      {pagination}
    </section>
  )
}

// Standalone (no app shell) so the browser prints only the invoice.
export function InvoicePage() {
  const { id } = useParams()
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const auth = getAuth()
  useEffect(() => {
    if (auth) api(`/payments/${id}`).then(setPayment).catch((err) => setError(err.message))
  }, [id, auth?.token]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!auth) return <Navigate to="/login" replace />
  return (
    <main className="min-h-screen bg-white text-slate-900 p-6 print:p-0">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex justify-end gap-2 print:hidden">
          <button className={btnOutline} onClick={() => window.close()}>Đóng</button>
          <button className={btnPrimary} disabled={payment?.status !== 'Paid'} onClick={() => window.print()}><Icon name="print" className="text-lg" />In / lưu PDF</button>
        </div>
        {error && <Alert>{error}</Alert>}
        {!payment && !error && <p role="status">Đang tải hoá đơn…</p>}
        {payment && payment.status !== 'Paid' && <Alert>Giao dịch chưa thanh toán nên chưa có hoá đơn.</Alert>}
        {payment?.status === 'Paid' && (
          <article className="border border-slate-300 rounded-xl p-8 print:border-0 flex flex-col gap-6">
            <header className="flex justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-bold">HOÁ ĐƠN THANH TOÁN</h1>
                <p className="text-slate-500">Trung tâm thể thao</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Số: {payment.invoiceNumber ?? `#${payment.id}`}</p>
                <p className="text-slate-500">{formatTimestamp(payment.paidAt)}</p>
              </div>
            </header>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className="text-slate-500">Hội viên</dt><dd className="font-semibold">{payment.memberName} (#{payment.memberId})</dd>
              <dt className="text-slate-500">Phương thức</dt><dd>{PAYMENT_METHOD_LABEL[payment.method] ?? payment.method}</dd>
              {payment.receivedByName && <><dt className="text-slate-500">Thu ngân</dt><dd>{payment.receivedByName}</dd></>}
            </dl>
            <table className="w-full text-left">
              <thead><tr className="border-b border-slate-300"><th className="py-2">Nội dung</th><th className="py-2 text-right">Thành tiền</th></tr></thead>
              <tbody><tr className="border-b border-slate-200"><td className="py-2">{paymentItem(payment)}</td><td className="py-2 text-right">{vnd(payment.amount)}</td></tr></tbody>
              <tfoot><tr><td className="py-3 font-bold">Tổng cộng</td><td className="py-3 text-right font-bold text-lg">{vnd(payment.amount)}</td></tr></tfoot>
            </table>
            <p className="text-center text-slate-500 text-sm">Cảm ơn quý khách!</p>
          </article>
        )}
      </div>
    </main>
  )
}

export function MemberSupportPage() {
  const { data, loading, error, reload, pagination, setPage } = usePaged('/support-requests/mine')
  const [form, setForm] = useState({ subject: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setFormError(''); setNotice('')
    try {
      await api('/support-requests', { method: 'POST', body: { subject: form.subject.trim(), description: form.description.trim() } })
      setForm({ subject: '', description: '' }); setNotice('Đã gửi yêu cầu. Lễ tân sẽ phản hồi qua thông báo.'); setPage(1); reload()
    } catch (err) { setFormError(err.message) }
    setBusy(false)
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Yêu cầu hỗ trợ</h1>
        <p className="text-secondary">Gửi câu hỏi hoặc vấn đề cho trung tâm. Bạn sẽ nhận thông báo khi trạng thái thay đổi.</p>
      </div>
      <form onSubmit={submit} className="bg-surface-container rounded-xl shadow-sm p-5 flex flex-col gap-4">
        {formError && <Alert>{formError}</Alert>}
        {notice && <Alert type="success">{notice}</Alert>}
        <Field label="Tiêu đề"><input className={inputCls} required minLength={2} maxLength={150} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
        <Field label="Nội dung"><textarea className={inputCls + ' !h-28 py-2'} required minLength={2} maxLength={2000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="flex justify-end"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang gửi…' : 'Gửi yêu cầu'}</button></div>
      </form>
      {error && <Alert>{error}</Alert>}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm">
        <h2 className="font-headline-md text-headline-md px-4 py-3 border-b border-surface-container">Yêu cầu đã gửi</h2>
        <ul className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
          {data.items.map((r) => (
            <li key={r.id} className="px-4 py-3 flex flex-col gap-1">
              <div className="flex justify-between gap-3"><span className="font-semibold">{r.subject}</span><Badge tone={SUPPORT_TONE[r.status]}>{SUPPORT_STATUS_LABEL[r.status]}</Badge></div>
              <p className="text-body-sm whitespace-pre-wrap">{r.description}</p>
              <p className="text-body-sm text-secondary">Gửi {formatTimestamp(r.createdAt)}{r.handledByName ? ` • Xử lý bởi ${r.handledByName}` : ''}</p>
            </li>
          ))}
          {!loading && !data.items.length && <li className="px-4 py-10 text-center text-secondary">Bạn chưa gửi yêu cầu nào.</li>}
        </ul>
        {pagination}
      </section>
    </div>
  )
}

export function SupportDeskPage() {
  const [status, setStatus] = useState('Open')
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const { data, loading, error, reload, pagination, setPage } = usePaged(`/support-requests${query({ status: status || undefined, q: search || undefined })}`)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  useEffect(() => { const t = setTimeout(() => { setSearch(q.trim()); setPage(1) }, 300); return () => clearTimeout(t) }, [q, setPage])
  const update = async (r, next) => {
    setBusyId(r.id); setActionError('')
    try { await api(`/support-requests/${r.id}/status`, { method: 'PATCH', body: { status: next } }); reload() }
    catch (err) { setActionError(err.message) }
    setBusyId(null)
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Yêu cầu hỗ trợ</h1>
        <p className="text-secondary">Tiếp nhận và cập nhật xử lý yêu cầu của hội viên. Hội viên được thông báo mỗi khi đổi trạng thái.</p>
      </div>
      <div className="bg-surface-container rounded-xl shadow-sm p-5 grid sm:grid-cols-2 gap-4">
        <Field label="Trạng thái">
          <select className={inputCls} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">Tất cả</option>
            {Object.entries(SUPPORT_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Tìm kiếm"><input className={inputCls} placeholder="Tiêu đề, tên hoặc email hội viên…" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
      </div>
      {(error || actionError) && <Alert>{error || actionError}</Alert>}
      <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm">
        <ul className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
          {data.items.map((r) => (
            <li key={r.id} className="px-4 py-4 flex flex-col sm:flex-row gap-3 sm:items-start sm:justify-between">
              <div className="min-w-0 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{r.subject}</span><Badge tone={SUPPORT_TONE[r.status]}>{SUPPORT_STATUS_LABEL[r.status]}</Badge></div>
                <p className="text-body-sm whitespace-pre-wrap">{r.description}</p>
                <p className="text-body-sm text-secondary">
                  <Link className="underline" to={`/reception/members/${r.memberId}`}>{r.memberName}</Link> • {r.memberEmail} • {formatTimestamp(r.createdAt)}{r.handledByName ? ` • Xử lý: ${r.handledByName}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {r.status === 'Open' && <button className={btnOutline + ' !h-9'} disabled={busyId === r.id} onClick={() => update(r, 'InProgress')}>Nhận xử lý</button>}
                {r.status !== 'Resolved' && <button className={btnPrimary + ' !h-9'} disabled={busyId === r.id} onClick={() => update(r, 'Resolved')}>Đã giải quyết</button>}
                {r.status === 'Resolved' && <button className={btnOutline + ' !h-9'} disabled={busyId === r.id} onClick={() => update(r, 'InProgress')}>Mở lại</button>}
              </div>
            </li>
          ))}
          {!loading && !data.items.length && <li className="px-4 py-10 text-center text-secondary">Không có yêu cầu nào.</li>}
        </ul>
        {pagination}
      </section>
    </div>
  )
}

export function CoachMessageModal({ item, onClose }) {
  const [form, setForm] = useState({ type: 'Homework', wholeClass: false, title: '', body: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const result = await api('/coach/messages', { method: 'POST', body: { sessionId: item.referenceId, wholeClass: form.wholeClass, type: form.type, title: form.title.trim(), body: form.body.trim() } })
      setSent(result.recipients)
    } catch (err) { setError(err.message) }
    setBusy(false)
  }
  return (
    <Modal title={`Gửi thông báo — ${item.title}`} onClose={onClose}>
      {sent != null ? (
        <div className="flex flex-col gap-4">
          <Alert type="success">Đã gửi tới {sent} học viên.</Alert>
          <div className="flex justify-end"><button className={btnPrimary} onClick={onClose}>Đóng</button></div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Loại">
            <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="Homework">Bài tập về nhà</option>
              <option value="General">Thông báo chung</option>
            </select>
          </Field>
          <Field label="Gửi tới">
            <select className={inputCls} value={form.wholeClass ? 'class' : 'session'} onChange={(e) => setForm({ ...form, wholeClass: e.target.value === 'class' })}>
              <option value="session">Học viên của buổi {item.date}</option>
              <option value="class">Toàn bộ học viên của lớp</option>
            </select>
          </Field>
          <Field label="Tiêu đề"><input className={inputCls} required minLength={2} maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Nội dung"><textarea className={inputCls + ' !h-28 py-2'} required minLength={2} maxLength={2000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
            <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang gửi…' : 'Gửi'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export function ReportTrend({ range }) {
  const [groupBy, setGroupBy] = useState('day')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    const c = new AbortController()
    api(`/reports/trend${query({ ...range, groupBy })}`, { signal: c.signal })
      .then((r) => { setRows(r); setError('') })
      .catch((err) => { if (!c.signal.aborted) setError(err.message) })
    return () => c.abort()
  }, [range, groupBy])
  const max = Math.max(1, ...rows.map((r) => Number(r.revenue)))
  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-container">
        <h2 className="font-headline-md text-headline-md">Theo thời gian</h2>
        <select className={inputCls + ' !w-auto'} value={groupBy} onChange={(e) => setGroupBy(e.target.value)} aria-label="Nhóm theo">
          <option value="day">Theo ngày</option>
          <option value="month">Theo tháng</option>
        </select>
      </div>
      {error && <div className="p-4"><Alert>{error}</Alert></div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">{groupBy === 'month' ? 'Tháng' : 'Ngày'}</th>
              <th className="px-4 py-3 w-1/2">Doanh thu</th>
              <th className="px-4 py-3 text-right">Hội viên mới</th>
              <th className="px-4 py-3 text-right">Lượt đặt lớp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.period} className="border-t border-surface-container">
                <td className="px-4 py-2 text-secondary whitespace-nowrap">{r.period}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${(Number(r.revenue) / max) * 100}%`, minWidth: Number(r.revenue) ? 4 : 0 }} />
                    <span className="text-body-sm whitespace-nowrap">{vnd(r.revenue)}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">{r.newMembers}</td>
                <td className="px-4 py-2 text-right">{r.newClassBookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ClassFillReport() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api('/reports/class-fill').then(setRows).catch((err) => setError(err.message)) }, [])
  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm">
      <h2 className="font-headline-md text-headline-md px-4 py-3 border-b border-surface-container">Tình trạng đăng ký lớp</h2>
      {error && <div className="p-4"><Alert>{error}</Alert></div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Lớp</th>
              <th className="px-4 py-3">HLV</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Đăng ký</th>
              <th className="px-4 py-3 w-1/4">Lấp đầy</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((c) => {
              const pct = c.fillRate == null ? null : Math.round(c.fillRate * 100)
              return (
                <tr key={c.classId} className="border-t border-surface-container">
                  <td className="px-4 py-2 font-semibold">{c.name}</td>
                  <td className="px-4 py-2 text-secondary">{c.coach ?? '—'}</td>
                  <td className="px-4 py-2"><Badge>{CLASS_STATUS_LABEL[c.status] ?? c.status}</Badge></td>
                  <td className="px-4 py-2 text-secondary whitespace-nowrap">
                    {c.bookingMode === 'CourseEnrollment' ? `${c.activeEnrollments}/${c.capacity} học viên (khóa)` : `${c.activeBookings} lượt / ${c.sessions} buổi × ${c.capacity} chỗ`}
                  </td>
                  <td className="px-4 py-2">
                    {pct == null ? <span className="text-secondary">—</span> : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full bg-surface-container"><div className="h-2.5 rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                        <span className="text-body-sm w-10 text-right">{pct}%</span>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {rows && !rows.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-secondary">Chưa có lớp nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
