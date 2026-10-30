import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api, query } from '../api'
import { useAuth } from '../auth'
import { businessDateTimeInput, businessDateTimeToUtc, formatTimestamp, fromTimeOnly } from '../dateUtils'
import { Alert, Badge, Field, Modal, Pagination, btnOutline, btnPrimary, inputCls } from './ui'
import { PaymentPendingPanel } from './payment'

const vnd = (amount) => `${Number(amount ?? 0).toLocaleString('vi-VN')}đ`

// Each confirmed intent owns one replay key. Retrying an error cannot create a second debit.
export function CommerceConfirm({ intent, onClose, onDone }) {
  const [key] = useState(() => crypto.randomUUID())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const close = () => { if (!pending.current) onClose() }
  const submit = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      const result = await api(intent.path, { method: intent.method ?? 'POST', body: intent.body, idempotencyKey: key })
      if (active.current) onDone(result)
    } catch (err) { if (active.current) setError(err.message) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <Modal title={intent.title} onClose={close}>
    <div className="space-y-4">
      <p>{intent.description}</p>
      {intent.price != null && <p>Thanh toán: <b>{vnd(intent.price)}</b><br />Số dư hiện tại: {vnd(intent.balance)}<br />Dự kiến sau mua: {vnd(intent.balance - intent.price)}. Backend kiểm tra lại khi xác nhận.</p>}
      <p className="text-secondary whitespace-pre-line">{intent.policy}</p>
      {intent.sessions && <div className="max-h-60 overflow-auto space-y-1"><h3 className="font-semibold">Lịch toàn khóa trước khi thanh toán</h3>{intent.sessions.map(s => <p key={s.id}>{s.date} {fromTimeOnly(s.startTime)}–{fromTimeOnly(s.endTime)} • {s.coach} • {s.room}</p>)}</div>}
      {error && <Alert>{error}</Alert>}
      <div className="flex justify-end gap-2"><button className={btnOutline} disabled={busy} onClick={close}>Quay lại</button><button className={btnPrimary} disabled={busy} onClick={submit}>{busy ? 'Đang xác nhận…' : 'Xác nhận'}</button></div>
    </div>
  </Modal>
}

export function MemberCommerce({ memberId = null }) {
  const { auth } = useAuth()
  const staff = auth.role === 'Receptionist'
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [intent, setIntent] = useState(null)
  const [detail, setDetail] = useState(null)
  const [amount, setAmount] = useState('')
  const [receipt, setReceipt] = useState('')
  const [supportReason, setSupportReason] = useState('')
  const [payment, setPayment] = useState(null)
  const request = useRef(null)
  const detailRequest = useRef(null)
  const load = useCallback(async () => {
    request.current?.abort()
    const c = new AbortController(); request.current = c
    setLoading(true); setError('')
    try {
      const suffix = query({ memberId, page })
      const [wallet, ledger, courses, enrollments, subs, plans] = await Promise.all([
        api(`/wallet${query({ memberId })}`, { signal: c.signal }), api(`/wallet/ledger${suffix}`, { signal: c.signal }),
        api('/courses', { signal: c.signal }), api(`/courses/enrollments${query({ memberId })}`, { signal: c.signal }),
        api(memberId ? `/members/${memberId}/subscriptions` : '/me/subscriptions', { signal: c.signal }), api('/membership-plans', { signal: c.signal }),
      ])
      if (!c.signal.aborted) setData({ wallet, ledger, courses, enrollments, subs, plans })
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }, [memberId, page])
  useEffect(() => {
    let active = true
    const refresh = () => { if (active) load() }
    void Promise.resolve().then(refresh)
    window.addEventListener('sc:api-mutated', refresh)
    window.addEventListener('focus', refresh)
    return () => { active = false; request.current?.abort(); detailRequest.current?.abort(); window.removeEventListener('sc:api-mutated', refresh); window.removeEventListener('focus', refresh) }
  }, [load])
  const view = async (id) => {
    detailRequest.current?.abort(); const c = new AbortController(); detailRequest.current = c
    setDetail(null); setError('')
    try { const result = await api(`/courses/${id}`, { signal: c.signal }); if (!c.signal.aborted) setDetail(result) }
    catch (err) { if (!c.signal.aborted) setError(err.message) }
  }
  const target = { memberId: memberId ? Number(memberId) : null }
  const enroll = async course => {
    detailRequest.current?.abort(); const c = new AbortController(); detailRequest.current = c
    setError(''); setLoading(true)
    try {
      const d = await api(`/courses/${course.id}`, { signal: c.signal })
      if (!c.signal.aborted) setIntent({ title: 'Đăng ký toàn khóa', description: `${d.name}: toàn bộ ${d.expectedSessions} buổi${memberId ? ` cho hội viên #${memberId}` : ''}.`,
        price: d.courseFee, balance: data.wallet.balance, sessions: d.sessions.filter(s => s.status !== 'Cancelled'),
        policy: 'Trừ ví một lần cho toàn khóa, không thu lại từng buổi. Hệ thống kiểm tra lại hạn đăng ký, khai giảng, sức chứa, trùng lịch và số dư khi xác nhận. Chính sách hủy/hoàn theo khóa đã mua.',
        path: `/courses/${course.id}/enrollments`, body: { ...target, expectedPrice: d.courseFee } })
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }
  const done = (result) => { const online = intent?.path === '/wallet/online-top-ups'; setIntent(null); setNotice(online ? 'Yêu cầu nạp đã tạo. Số dư chỉ tăng sau khi Backend xác minh thanh toán.' : 'Backend đã xác nhận giao dịch. Đang tải lại dữ liệu.'); if (online) setPayment(result); load() }
  return <section className="space-y-5">
    <h2 className="font-headline-lg text-headline-lg">Số dư & đăng ký dịch vụ{memberId ? ` — hội viên #${memberId}` : ''}</h2>
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}{loading && <p role="status">Đang tải số dư và quyền lợi…</p>}
    {data && <>
      <div className="rounded-xl bg-surface-container p-5 space-y-3">
        <p>Số dư trả trước: <b className="text-headline-md">{vnd(data.wallet.balance)}</b></p>
        {data.wallet.balance !== data.wallet.ledgerBalance && <Alert>Cần đối chiếu số dư; liên hệ trung tâm trước khi giao dịch.</Alert>}
        <p className="text-secondary">Số dư nội bộ VND. Không hỗ trợ chuyển tiền hoặc rút tiền.</p>
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <Field label="Số tiền nạp (VND)"><input className={inputCls} type="number" min="1" max="1000000000" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          {staff && <Field label="Mã biên nhận đã thu tiền"><input className={inputCls} value={receipt} maxLength={100} onChange={(e) => setReceipt(e.target.value)} /></Field>}
          <button className={btnPrimary} disabled={loading || !Number.isInteger(Number(amount)) || Number(amount) <= 0 || (staff && !receipt.trim())} onClick={() => setIntent({
            title: staff ? 'Xác nhận đã thu tiền tại quầy' : 'Tạo yêu cầu nạp online', description: `${staff ? `Đã nhận ${vnd(amount)} cho hội viên #${memberId}, biên nhận ${receipt.trim()}.` : `Nạp ${vnd(amount)} qua PayOS.`}`,
            policy: staff ? 'Chỉ xác nhận sau khi đã nhận đủ tiền. Mã biên nhận không được dùng hai lần.' : 'Trang success không cộng tiền. Chỉ webhook được xác minh mới ghi có số dư.',
            path: staff ? '/wallet/cash-top-ups' : '/wallet/online-top-ups', body: staff ? { memberId: Number(memberId), amount: Number(amount), receiptReference: receipt.trim() } : { amount: Number(amount) },
          })}>{staff ? 'Nạp tại quầy' : 'Nạp online'}</button>
        </div>
      </div>
      {payment && <PaymentPendingPanel payment={payment} />}
      <div className="rounded-xl bg-surface-container-lowest p-4 space-y-3"><h3 className="font-semibold">Lịch sử nạp / chi / hoàn</h3>
        {data.ledger.items.map((e) => <div className="border-b border-outline-variant py-2" key={e.id}><b>{e.kind}: {vnd(e.amount)}</b> — còn {vnd(e.balanceAfter)}<p className="text-secondary">{formatTimestamp(e.createdAt)} • {e.reference}</p></div>)}
        {!data.ledger.items.length && <p>Chưa có giao dịch.</p>}
        <Pagination page={page} pageSize={20} total={data.ledger.total} onPage={setPage} onPageSize={() => {}} />
      </div>
      <h3 className="font-headline-md text-headline-md">Khóa nhóm nhiều tuần</h3>
      <div className="grid lg:grid-cols-2 gap-4">{data.courses.map(({ course: c, canEnroll }) => <article key={c.id} className="rounded-xl border border-outline-variant p-4 space-y-2">
        <h4 className="font-semibold">{c.name} • {vnd(c.courseFee)}</h4><p>{c.description}</p><p>{c.sport} • {c.level} • HLV {c.coach} • {c.room}</p><p>{c.firstSessionDate ?? c.startDate} → {c.lastSessionDate ?? c.endDate} • {c.durationWeeks} tuần / {c.expectedSessions} buổi • còn {Math.max(0, c.capacity - c.enrolled)} chỗ</p><p>{c.sessionPrice != null ? `${vnd(c.sessionPrice)}/buổi • thanh toán toàn khóa một lần` : 'Giá và phân bổ từng buổi theo quyền lợi toàn khóa.'}</p>
        <p>Đóng đăng ký: {formatTimestamp(c.enrollmentClosesAt)} • {c.status}</p>
        <div className="flex flex-wrap gap-2"><button className={btnOutline} onClick={() => view(c.id)}>Xem toàn bộ lịch & chính sách</button><button className={btnPrimary} disabled={loading || !canEnroll || data.enrollments.some(e => e.classId === c.id && e.status === 'Confirmed')} onClick={() => enroll(c)}>{data.enrollments.some(e => e.classId === c.id && e.status === 'Confirmed') ? 'Đã mua khóa' : canEnroll ? `Đăng ký toàn khóa — ${vnd(c.courseFee)}` : 'Đã đóng / hết chỗ'}</button></div>
      </article>)}</div>{!data.courses.length && <p>Chưa có khóa được công bố.</p>}
      <h3 className="font-headline-md text-headline-md">Khóa đã đăng ký</h3>
      {data.enrollments.map(e => <div key={e.id} className="rounded-xl bg-surface-container p-4 flex flex-wrap gap-3 justify-between"><div>{e.course} • <Badge>{e.status}</Badge><p>Đã trả {vnd(e.paidAmount)} • đã hoàn {vnd(e.refundedAmount)}</p></div>{e.status === 'Confirmed' && <button className={btnOutline} disabled={loading} onClick={() => setIntent({ title: 'Hủy toàn bộ enrollment', description: e.course, policy: 'Backend chỉ cho phép trước khai giảng; hoàn phần thực trả chưa hoàn, hủy toàn bộ quyền tham gia. Sau khai giảng cần hỗ trợ.', path: `/courses/enrollments/${e.id}/cancel`, body: { reason: 'Hội viên xác nhận hủy toàn khóa' } })}>Yêu cầu hủy toàn khóa</button>}</div>)}
      <Field label="Nội dung cần hỗ trợ về khóa đã mua"><textarea className={inputCls} maxLength={500} value={supportReason} onChange={e => setSupportReason(e.target.value)} /></Field>
      <div className="flex flex-wrap gap-2">{data.enrollments.map(e => <button key={e.id} className={btnOutline} disabled={loading || supportReason.trim().length < 2} onClick={() => setIntent({ title: 'Gửi yêu cầu hỗ trợ khóa', description: e.course, policy: 'Tạo yêu cầu cho trung tâm; không tự hủy quyền lợi hoặc hoàn tiền.', path: '/courses/enrollments/' + e.id + '/support', body: { reason: supportReason.trim() } })}>Gửi hỗ trợ: {e.course}</button>)}</div>
      <h3 className="font-headline-md text-headline-md">Mua gói PT bằng số dư</h3><p className="text-secondary">Hiệu lực từ ngày kích hoạt theo giờ Việt Nam. Gói credit không tự giữ lịch; chọn slot sau khi mua.</p>
      <div className="grid lg:grid-cols-2 gap-3">{data.plans.filter(p => p.isActive && p.ptSessionCredits > 0 && !p.includesClasses && !p.includesGymAccess).map(p => <article className="rounded-xl border p-4 space-y-2" key={p.id}><h4 className="font-semibold">{p.name} • {vnd(p.price)}</h4><p>{p.ptSessionCredits} credit / {p.durationDays > 0 ? `${p.durationDays} ngày` : `${p.durationMonths} tháng`} • {p.sportName ?? 'Các bộ môn PT'}</p><button className={btnPrimary} disabled={loading} onClick={() => setIntent({ title: 'Mua gói PT', description: `${p.name}${memberId ? ` cho hội viên #${memberId}` : ''}`, price: p.price, balance: data.wallet.balance, policy: 'Trừ số dư một lần; đặt slot chỉ dùng credit. Chỉ tự hoàn toàn bộ nếu chưa từng sử dụng/giữ credit. Thời hạn tính từ ngày thanh toán thành công.', path: `/pt/packages/${p.id}/purchase`, body: { ...target, expectedPrice: p.price } })}>Mua gói bằng số dư</button></article>)}</div>
      <h3 className="font-semibold">Gói PT hiện có</h3>{data.subs.filter(s => s.totalPtSessions > 0).map(s => <article className="rounded-xl bg-surface-container p-4 space-y-2" key={s.id}><p>{s.planName}: <b>{s.remainingPtSessions}/{s.totalPtSessions}</b> credit • {s.startDate} → {s.endDate} • {s.status}</p>{s.purchaseOrderId && s.status !== 'Cancelled' && <button className={btnOutline} disabled={loading} onClick={() => setIntent({ title: 'Yêu cầu hoàn gói chưa sử dụng', description: s.planName, policy: 'Backend kiểm tra chưa từng dùng credit và chưa có booking. Gói đã sử dụng cần hỗ trợ, không tự hoàn một phần.', path: `/pt/packages/subscriptions/${s.id}/refund` })}>Hoàn gói chưa sử dụng</button>}</article>)}
      <Link className={btnOutline} to={staff ? '/reception/pt' : '/member/pt'}>Chọn slot PT — dùng gói hoặc trả buổi lẻ</Link>
    </>}
    {detail && <Modal title={detail.name} onClose={() => setDetail(null)}><p>{detail.policy}</p><p className="py-2">{detail.expectedSessions} buổi • {vnd(detail.courseFee)} • đóng {formatTimestamp(detail.enrollmentClosesAt)}</p><div className="space-y-2">{detail.sessions.map(s => <p key={s.id}>{s.date} • {fromTimeOnly(s.startTime)}–{fromTimeOnly(s.endTime)} • {s.room} • {s.coach} • {s.status}{s.replacesSessionId ? ' (Buổi bù)' : ''}</p>)}</div></Modal>}
    {intent && <CommerceConfirm intent={intent} onClose={() => setIntent(null)} onDone={done} />}
  </section>
}

export function CourseManagement() {
  const location = useLocation()
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState(location.state?.createdCourseId ?? null)
  const [detail, setDetail] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [supportRequests, setSupportRequests] = useState([])
  const [prices, setPrices] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [intent, setIntent] = useState(null)
  const [form, setForm] = useState({ fee: '', expectedSessions: '', cutoff: '' })
  const [cancel, setCancel] = useState({ reason: '', sessionId: '', refundWithoutMakeup: false, date: '', startTime: '', endTime: '', roomId: '' })
  const [rooms, setRooms] = useState([])
  const [price, setPrice] = useState({ sportId: '', value: '' })
  const [loading, setLoading] = useState(true)
  const request = useRef(null)
  const formFor = useRef(null)
  const load = useCallback(async () => {
    request.current?.abort(); const c = new AbortController(); request.current = c
    setLoading(true); setError('')
    try {
      const [list, rates, roomList] = await Promise.all([api('/courses', { signal: c.signal }), api('/pt/prices', { signal: c.signal }), api('/rooms', { signal: c.signal })])
      if (c.signal.aborted) return
      setCourses(list); setPrices(rates); setRooms(roomList)
      if (selected) {
        const [d, es, support] = await Promise.all([api(`/courses/${selected}`, { signal: c.signal }), api(`/courses/enrollments${query({ courseId: selected })}`, { signal: c.signal }), api('/courses/' + selected + '/support-requests', { signal: c.signal })])
        if (!c.signal.aborted) { setDetail(d); setEnrollments(es); setSupportRequests(support); if (formFor.current !== selected) { formFor.current = selected; setForm({ fee: d.courseFee || '', expectedSessions: d.expectedSessions || '', cutoff: d.enrollmentClosesAt ? businessDateTimeInput(d.enrollmentClosesAt) : '' }) } }
      }
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }, [selected])
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (active) load() }); return () => { active = false; request.current?.abort() } }, [load])
  const select = (c) => { if (selected === c.id) { load(); return } setSelected(c.id); setDetail(null); setEnrollments([]); setSupportRequests([]); setForm({ fee: c.courseFee || '', expectedSessions: c.expectedSessions || '', cutoff: c.enrollmentClosesAt ? businessDateTimeInput(c.enrollmentClosesAt) : '' }); setCancel({ reason: '', sessionId: '', refundWithoutMakeup: false, date: '', startTime: '', endTime: '', roomId: '' }) }
  const done = () => { setIntent(null); setNotice('Backend đã xác nhận. Đang tải lại khóa/giá/enrollment.'); load() }
  return <div className="space-y-5"><h1 className="font-headline-xl text-headline-xl">Khóa nhóm & học phí</h1><p>Tạo khóa học, lịch lặp và học phí trong một thao tác. Các nháp cũ vẫn có thể hoàn thiện từng phần bên dưới.</p><div className="flex gap-3"><Link className={btnPrimary} to="/manager/courses/new">Tạo khóa học</Link><Link className={btnOutline} to="/manager/classes">Quản lý từng buổi / lớp legacy</Link></div>
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}{loading && <p>Đang tải…</p>}
    <div className="flex flex-wrap gap-2">{courses.map(({ course: c }) => <button className={selected === c.id ? btnPrimary : btnOutline} key={c.id} onClick={() => select(c)}>{c.name} ({c.status})</button>)}</div>
    {detail && <div className="bg-surface-container-lowest rounded-xl p-5 space-y-4"><h2 className="font-semibold">{detail.name}: {detail.expectedSessions} buổi • {vnd(detail.courseFee)} • {detail.status}</h2><p>Đóng đăng ký: {formatTimestamp(detail.enrollmentClosesAt)} • Đã có {detail.sessions.filter(s => s.status !== 'Cancelled').length}/{detail.expectedSessions} buổi trong lịch</p>
      {!!detail.validationIssues?.length && <Alert><p>Khóa chưa đủ điều kiện mở đăng ký:</p>{detail.validationIssues.map(i => <p key={i.errorCode}>{i.message}</p>)}<Link className={btnOutline} to="/manager/classes">Hoàn thiện lịch / từng buổi</Link></Alert>}
      <form className="grid sm:grid-cols-3 gap-3" onSubmit={e => { e.preventDefault(); setIntent({ title: 'Cập nhật điều khoản khóa', description: detail.name, policy: 'Không sửa điều khoản khóa đã bán; không mở lại cutoff đã qua. Cập nhật đưa khóa về Draft để kiểm tra trước khi publish.', path: `/courses/${selected}/terms`, method: 'PUT', body: { fee: Number(form.fee), expectedSessions: Number(form.expectedSessions), enrollmentClosesAt: businessDateTimeToUtc(form.cutoff) } }) }}>
        <Field label="Học phí nguyên khóa (VND)"><input className={inputCls} type="number" min="1" step="1" required value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} /></Field><Field label="Số buổi công bố"><input className={inputCls} type="number" min="1" max="366" required value={form.expectedSessions} onChange={e => setForm({ ...form, expectedSessions: e.target.value })} /></Field><Field label="Hạn đăng ký (giờ Việt Nam)"><input className={inputCls} type="datetime-local" required value={form.cutoff} onChange={e => setForm({ ...form, cutoff: e.target.value })} /></Field><button className={btnOutline} disabled={loading}>Lưu điều khoản</button><button type="button" className={btnOutline} disabled={loading || !form.cutoff} onClick={() => setIntent({ title: 'Điều chỉnh riêng hạn đăng ký', description: detail.name, policy: 'Chỉ khi hạn cũ chưa qua. Không đổi giá/số buổi đã bán; không mở lại khóa đã đóng theo thời gian.', path: `/courses/${selected}/enrollment-cutoff`, method: 'PUT', body: { enrollmentClosesAt: businessDateTimeToUtc(form.cutoff) } })}>Lưu riêng hạn đăng ký</button>
      </form>
      <div className="flex gap-2">{[true, false].map(open => <button key={String(open)} className={btnPrimary} disabled={loading} onClick={() => setIntent({ title: open ? 'Mở đăng ký khóa' : 'Đóng đăng ký khóa', description: detail.name, policy: 'Backend kiểm tra lịch đủ buổi, tài nguyên, giá và cutoff. Đóng/mở không gia hạn mốc đã lưu.', path: `/courses/${selected}/publish`, method: 'PUT', body: { open } })}>{open ? 'Publish / Mở đăng ký' : 'Đóng đăng ký'}</button>)}</div>
      <h3 className="font-semibold">Lịch cụ thể</h3>{detail.sessions.map(s => <p key={s.id}>{s.date} {fromTimeOnly(s.startTime)}–{fromTimeOnly(s.endTime)} • {s.room} • {s.coach} • {s.status}{s.replacesSessionId ? ' (Buổi bù)' : ''}</p>)}
      <h3 className="font-semibold">Enrollment / học viên</h3>{enrollments.map(e => <p key={e.id}>{e.member} • {e.status} • đã trả {vnd(e.paidAmount)} • đã hoàn {vnd(e.refundedAmount)}</p>)}{!enrollments.length && <p>Chưa có enrollment.</p>}
      <h3 className="font-semibold">Yêu cầu hỗ trợ khóa</h3>{supportRequests.map(r => <p key={r.id}>{r.member} • {r.status} • {r.description} • {formatTimestamp(r.createdAt)}</p>)}
      <Field label="Lý do hủy"><textarea className={inputCls} maxLength={500} value={cancel.reason} onChange={e => setCancel({ ...cancel, reason: e.target.value })} /></Field>
      <button className={btnOutline} disabled={loading || cancel.reason.trim().length < 2 || detail.status === 'Cancelled'} onClick={() => setIntent({ title: 'Trung tâm hủy toàn khóa', description: detail.name, policy: 'Trước khai giảng hoàn phần chưa hoàn. Sau khai giảng chỉ hoàn buổi chưa cung cấp theo phân bổ snapshot. Giữ lịch sử buổi đã diễn ra.', path: `/courses/${selected}/cancel`, body: { reason: cancel.reason.trim() } })}>Hủy toàn khóa theo policy trung tâm</button>
      <div className="border-t pt-3 space-y-3"><Field label="Chọn buổi cần hủy"><select className={inputCls} value={cancel.sessionId} onChange={e => setCancel({ ...cancel, sessionId: e.target.value })}><option value="">Chọn từ lịch khóa</option>{detail.sessions.filter(s => s.status === 'Scheduled').map(s => <option key={s.id} value={s.id}>{s.date} {fromTimeOnly(s.startTime)} • {s.room}</option>)}</select></Field>
        <label className="flex gap-2"><input type="checkbox" checked={cancel.refundWithoutMakeup} onChange={e => setCancel({ ...cancel, refundWithoutMakeup: e.target.checked })} />Xác nhận không có buổi bù — hoàn phần học phí buổi này</label>
        {!cancel.refundWithoutMakeup && <div className="grid sm:grid-cols-2 gap-3"><Field label="Ngày bù"><input className={inputCls} type="date" value={cancel.date} onChange={e => setCancel({ ...cancel, date: e.target.value })} /></Field><Field label="Phòng bù"><select className={inputCls} value={cancel.roomId} onChange={e => setCancel({ ...cancel, roomId: e.target.value })}><option value="">Chọn phòng</option>{rooms.filter(r => r.status === 'Active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field><Field label="Bắt đầu"><input className={inputCls} type="time" value={cancel.startTime} onChange={e => setCancel({ ...cancel, startTime: e.target.value })} /></Field><Field label="Kết thúc"><input className={inputCls} type="time" value={cancel.endTime} onChange={e => setCancel({ ...cancel, endTime: e.target.value })} /></Field></div>}
        <button className={btnOutline} disabled={loading || !cancel.sessionId || cancel.reason.trim().length < 2 || (!cancel.refundWithoutMakeup && (!cancel.date || !cancel.startTime || !cancel.endTime || !cancel.roomId))} onClick={() => setIntent({ title: 'Hủy một buổi khóa', description: detail.name, policy: cancel.refundWithoutMakeup ? 'Hoàn đúng phân bổ của buổi chưa cung cấp, không hoàn lặp khi hủy cả khóa.' : 'Tạo buổi bù liên kết, chuyển quyền tham gia; không thu thêm hoặc hoàn tiền.', path: `/courses/${selected}/sessions/${cancel.sessionId}/cancel`, body: { reason: cancel.reason.trim(), refundWithoutMakeup: cancel.refundWithoutMakeup, date: cancel.date || null, startTime: cancel.startTime ? cancel.startTime + ':00' : null, endTime: cancel.endTime ? cancel.endTime + ':00' : null, roomId: cancel.roomId ? Number(cancel.roomId) : null } })}>Xác nhận phương án hủy buổi</button>
      </div>
    </div>}
    <section className="bg-surface-container p-5 rounded-xl space-y-3"><h2 className="font-semibold">Giá PT buổi lẻ (60 phút / bộ môn)</h2>{prices.map(p => <p key={p.id}>{p.name}: {p.ptSinglePrice == null ? 'Chưa cấu hình' : vnd(p.ptSinglePrice)}</p>)}<form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); setIntent({ title: 'Cập nhật giá PT lẻ', description: prices.find(p => String(p.id) === price.sportId)?.name, policy: 'Chỉ áp dụng đơn mới; giá đơn đã mua giữ snapshot.', path: `/pt/prices/${price.sportId}`, method: 'PUT', body: { price: Number(price.value) } }) }}><select className={inputCls + ' !w-auto'} required value={price.sportId} onChange={e => setPrice({ ...price, sportId: e.target.value })}><option value="">Chọn bộ môn</option>{prices.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input className={inputCls + ' !w-auto'} required type="number" min="1" step="1" value={price.value} onChange={e => setPrice({ ...price, value: e.target.value })} /><button className={btnPrimary} disabled={loading}>Lưu giá PT lẻ</button></form></section>
    {intent && <CommerceConfirm intent={intent} onClose={() => setIntent(null)} onDone={done} />}
  </div>
}

