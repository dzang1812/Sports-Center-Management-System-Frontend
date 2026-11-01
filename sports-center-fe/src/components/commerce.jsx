import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, query } from '../api'
import { useAuth } from '../auth'
import { businessDateTimeInput, businessDateTimeToUtc, formatDate, formatTimestamp, fromTimeOnly } from '../dateUtils'
import { Alert, Badge, Field, Icon, Modal, Pagination, btnOutline, btnPrimary, inputCls } from './ui'
import { PaymentPendingPanel } from './payment'
import CourseScheduleCalendar from './CourseScheduleCalendar'
import { groupCourseRefunds } from './walletHistory'
import { CLASS_STATUS_LABEL, LEVEL_LABEL } from '../labels'
import { createCashReceipt, readCashReceipt, saveCashReceipt } from './cashReceipt'
import CourseCover from './CourseCover'
import { courseAppearance } from './courseAppearance'
import CoachProfileButton from './CoachProfile'

const vnd = (amount) => `${Number(amount ?? 0).toLocaleString('vi-VN')}đ`

async function loadWalletHistory(memberId, signal) {
  const readPage = page => api(`/wallet/ledger${query({ memberId, page })}`, { signal })
  const first = await readPage(1)
  const entries = [...first.items]
  // Collect before grouping/pagination so a full refund cannot be split over API pages.
  const pages = Math.ceil(first.total / first.pageSize)
  for (let page = 2; page <= pages; page += 4) {
    const batch = await Promise.all(Array.from({ length: Math.min(4, pages - page + 1) }, (_, i) => readPage(page + i)))
    entries.push(...batch.flatMap(result => result.items))
  }
  return entries
}

// Each confirmed intent owns one replay key. Retrying an error cannot create a second debit.
export function CommerceConfirm({ intent, onClose, onDone }) {
  const [key] = useState(() => intent.idempotencyKey ?? crypto.randomUUID())
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
      intent.onAttempt?.()
      const result = await api(intent.path, { method: intent.method ?? 'POST', body: intent.body, idempotencyKey: key })
      if (active.current) onDone(result)
    } catch (err) { intent.onFailure?.(err); if (active.current) setError(err.message) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <Modal title={intent.title} onClose={close} footer={
    <div className="w-full space-y-3">
      {error && <div className="max-h-24 overflow-y-auto"><Alert>{error}</Alert></div>}
      <div className="flex justify-end gap-2">
        <button type="button" className={btnOutline} disabled={busy} onClick={close}>Quay lại</button>
        <button type="button" className={btnPrimary} disabled={busy} onClick={submit}>{busy ? 'Đang xác nhận…' : intent.confirmLabel ?? (intent.sessions ? 'Xác nhận thanh toán' : 'Xác nhận')}</button>
      </div>
    </div>
  }>
    <div className="space-y-4">
      <p>{intent.description}</p>
      {intent.price != null && <div className="rounded-xl bg-surface-container p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2"><span>Thanh toán</span><b className="text-headline-md">{vnd(intent.price)}</b></div>
        <div className="flex flex-wrap justify-between gap-2 text-body-sm text-secondary"><span>Số dư hiện tại</span><span>{vnd(intent.balance)}</span></div>
        <div className="flex flex-wrap justify-between gap-2 text-body-sm text-secondary"><span>Dự kiến sau thanh toán</span><span>{vnd(intent.balance - intent.price)}</span></div>
      </div>}
      <p className="text-body-sm text-secondary whitespace-pre-line">{intent.policy}</p>
      {intent.sessions && <details className="rounded-lg border border-outline-variant">
        <summary className="cursor-pointer p-3 font-semibold">Xem lịch học ({intent.sessions.length} buổi)</summary>
        <div className="max-h-48 overflow-y-auto border-t border-outline-variant/40">
          <ol className="divide-y divide-outline-variant/40 text-body-sm">
            {intent.sessions.map((session, index) => <li key={session.id ?? `${session.date}:${session.startTime}:${index}`} className="px-3 py-2">
              <div className="flex flex-wrap justify-between gap-x-3"><span>{formatDate(session.date, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span><span>{fromTimeOnly(session.startTime)}–{fromTimeOnly(session.endTime)}</span></div>
              {(session.room || session.coach) && <p className="text-secondary">{[session.room, session.coach].filter(Boolean).join(' • ')}</p>}
            </li>)}
          </ol>
        </div>
      </details>}
    </div>
  </Modal>
}

export function MemberCommerce({ memberId = null, coursesOnly = false, viewMode = 'all', embedded = false, focusCourseId = null }) {
  const { auth } = useAuth()
  const staff = auth.role === 'Receptionist'
  const showCatalog = viewMode === 'all' || viewMode === 'catalog'
  const showEnrollments = viewMode === 'all' || viewMode === 'enrollments'
  const showWallet = viewMode === 'all' || viewMode === 'wallet'
  const showLedger = showWallet && !coursesOnly
  const historyId = useId()
  const [showHistory, setShowHistory] = useState(false)
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [intent, setIntent] = useState(null)
  const [detail, setDetail] = useState(null)
  const [amount, setAmount] = useState('')
  const cashStorageKey = `sc_cash_receipt:${auth.userId}:${memberId}`
  const [cashDraft, setCashDraft] = useState(() => staff ? readCashReceipt(cashStorageKey, memberId) : null)
  const [supportReason, setSupportReason] = useState('')
  const [payment, setPayment] = useState(null)
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState('all')
  const [supportFor, setSupportFor] = useState(null)
  const request = useRef(null)
  const detailRequest = useRef(null)
  const receiptRequest = useRef(null)
  const load = useCallback(async () => {
    request.current?.abort()
    const c = new AbortController(); request.current = c
    setLoading(true); setError('')
    try {
      const [wallet, ledger, courses, enrollments] = await Promise.all([
        viewMode === 'enrollments' ? null : api(`/wallet${query({ memberId })}`, { signal: c.signal }), showLedger ? loadWalletHistory(memberId, c.signal) : null,
        showCatalog ? api('/courses', { signal: c.signal }) : [], api(`/courses/enrollments${query({ memberId })}`, { signal: c.signal }),
      ])
      if (!c.signal.aborted) {
        const history = showLedger ? groupCourseRefunds(ledger, enrollments) : null
        setData({ wallet, ledger: history && { items: history, total: history.length }, courses, enrollments })
      }
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }, [memberId, viewMode, showCatalog, showLedger])
  useEffect(() => {
    let active = true
    const refresh = () => { if (active) load() }
    void Promise.resolve().then(refresh)
    window.addEventListener('sc:api-mutated', refresh)
    window.addEventListener('focus', refresh)
    return () => { active = false; request.current?.abort(); detailRequest.current?.abort(); receiptRequest.current?.abort(); window.removeEventListener('sc:api-mutated', refresh); window.removeEventListener('focus', refresh) }
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
        price: d.courseFee, balance: data.wallet.balance, courseName: d.name, sessions: d.sessions.filter(s => s.status !== 'Cancelled'),
        policy: 'Trừ ví một lần cho toàn khóa, không thu lại từng buổi. Hệ thống kiểm tra lại hạn đăng ký, khai giảng, sức chứa, trùng lịch và số dư khi xác nhận. Chính sách hủy/hoàn theo khóa đã mua.',
        path: `/courses/${course.id}/enrollments`, body: { ...target, expectedPrice: d.courseFee } })
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }
  const closeIntent = () => {
    if (intent?.path === '/wallet/cash-top-ups' && !cashDraft?.attempted) {
      try { saveCashReceipt(cashStorageKey, null) } catch { /* No request has been sent. */ }
      setCashDraft(null)
    }
    setIntent(null)
  }
  const startCash = () => {
    try {
      const draft = cashDraft ?? createCashReceipt(memberId, amount)
      saveCashReceipt(cashStorageKey, draft); setCashDraft(draft)
      setIntent({ title: 'Xác nhận đã thu tiền mặt', confirmLabel: 'Đã nhận đủ tiền — nạp vào ví',
        description: `Nạp ${vnd(draft.amount)} cho hội viên #${memberId}.`,
        policy: 'Chỉ xác nhận khi đã nhận đủ tiền mặt. Hệ thống tự tạo mã biên nhận và ghi nhận người thu tiền.',
        path: '/wallet/cash-top-ups', body: { memberId: draft.memberId, amount: draft.amount, receiptReference: draft.receiptReference },
        idempotencyKey: draft.idempotencyKey,
        onAttempt: () => { draft.attempted = true; saveCashReceipt(cashStorageKey, draft) },
        // Explicit validation/authorization failures did not commit. Ambiguous failures retain the same request.
        onFailure: err => { if ([400, 403, 404].includes(err.status) || ['WALLET_LIMIT', 'MEMBER_INACTIVE'].includes(err.errorCode)) { draft.attempted = false; try { saveCashReceipt(cashStorageKey, draft) } catch { /* No transaction committed. */ } } },
      })
    } catch { setError('Không lưu được biên nhận trên trình duyệt. Vui lòng bật lưu trữ rồi thử lại; chưa gửi yêu cầu nạp tiền.') }
  }
  const done = (result) => {
    const online = intent?.path === '/wallet/online-top-ups'
    const cash = intent?.path === '/wallet/cash-top-ups'
    setIntent(null); setSupportFor(null); setSupportReason('')
    if (cash) {
      try { saveCashReceipt(cashStorageKey, null) } catch { /* Replaying a retained request still cannot credit twice. */ }
      setCashDraft(null); setAmount('')
      setNotice('Đã nạp tiền mặt thành công. Đang tải mã biên nhận…')
      receiptRequest.current?.abort(); const controller = new AbortController(); receiptRequest.current = controller
      api(`/payments/${result.paymentId}`, { signal: controller.signal }).then(receipt => { if (!controller.signal.aborted) setNotice(`Đã nạp ${vnd(receipt.amount)}. Biên nhận: ${receipt.invoiceNumber ?? `Giao dịch #${receipt.id}`}.`) })
        .catch(() => { if (!controller.signal.aborted) setNotice(`Đã nạp tiền thành công. Giao dịch #${result.paymentId}; có thể tra cứu biên nhận trong báo cáo Manager.`) })
    } else setNotice(online ? 'Yêu cầu nạp tiền đã tạo. Số dư cập nhật sau khi thanh toán được xác nhận.' : 'Yêu cầu đã được xác nhận. Dữ liệu đang được cập nhật.')
    if (online) setPayment(result)
    load()
  }
  const historyPage = Math.min(page, Math.max(1, Math.ceil((data?.ledger?.total ?? 0) / 20)))
  const courses = (data?.courses ?? []).filter(({ course }) => (!focusCourseId || course.id === focusCourseId) && (sport === 'all' || course.sport === sport)
    && (!search.trim() || `${course.name} ${course.sport} ${course.coach ?? ''}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN'))))
  const registered = (data?.enrollments ?? []).filter(enrollment => enrollment.status === 'Confirmed')
  const previous = (data?.enrollments ?? []).filter(enrollment => enrollment.status !== 'Confirmed')
  const renderEnrollment = e => <article key={e.id} className="rounded-xl border border-outline-variant/50 bg-white p-4 sm:p-5 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-lg">{e.course}</h3><Badge tone={e.status === 'Confirmed' ? 'green' : 'slate'}>{e.status === 'Confirmed' ? 'Đã đăng ký' : e.status === 'Cancelled' ? 'Đã hủy' : e.status}</Badge></div>
    <p className="text-secondary text-body-sm">Đã thanh toán {vnd(e.paidAmount)}{e.refundedAmount > 0 ? ` • Đã hoàn ${vnd(e.refundedAmount)}` : ''}</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={btnOutline} onClick={() => view(e.classId)}><Icon name="calendar_month" className="text-lg" />Xem lịch khóa</button>
      <button type="button" className={btnOutline} onClick={() => { setSupportFor(supportFor === e.id ? null : e.id); setSupportReason('') }}>Liên hệ hỗ trợ</button>
      {e.status === 'Confirmed' && <button type="button" className="px-3 py-2 text-body-sm text-secondary hover:text-error" disabled={loading} onClick={() => setIntent({ title: 'Hủy đăng ký toàn khóa', description: e.course, policy: 'Chỉ có thể hủy trước khai giảng; hoàn phần thực trả chưa hoàn và hủy toàn bộ quyền lợi của khóa. Sau khai giảng, vui lòng liên hệ hỗ trợ.', path: `/courses/enrollments/${e.id}/cancel`, body: { reason: 'Hội viên xác nhận hủy toàn khóa' } })}>Hủy đăng ký</button>}
    </div>
    {supportFor === e.id && <div className="space-y-3 border-t border-outline-variant/40 pt-3">
      <Field label="Bạn cần hỗ trợ điều gì?"><textarea className={inputCls + ' !h-24 py-2'} value={supportReason} maxLength={500} onChange={event => setSupportReason(event.target.value)} placeholder="Nhập nội dung cần trung tâm hỗ trợ…" /></Field>
      <button type="button" className={btnPrimary} disabled={loading || supportReason.trim().length < 2} onClick={() => setIntent({ title: 'Gửi yêu cầu hỗ trợ', description: e.course, policy: 'Trung tâm sẽ tiếp nhận yêu cầu. Gửi hỗ trợ không tự hủy khóa hoặc hoàn tiền.', path: `/courses/enrollments/${e.id}/support`, body: { reason: supportReason.trim() } })}>Gửi yêu cầu</button>
    </div>}
  </article>
  return <section className={viewMode === 'catalog' ? 'space-y-3' : 'space-y-5'}>
    {!embedded && <div><h1 className="font-headline-xl text-headline-xl">{viewMode === 'wallet' ? 'Số dư của tôi' : coursesOnly ? 'Đăng ký nguyên khóa' : 'Số dư & đăng ký dịch vụ'}{memberId ? ` — hội viên #${memberId}` : ''}</h1>{viewMode === 'wallet' && <p className="text-secondary mt-2">Nạp tiền và theo dõi các khoản thanh toán, hoàn tiền của bạn.</p>}</div>}
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}{showCatalog && !staff && <Link className="block font-semibold underline mt-2" to="/member/schedule?tab=courses">Xem khóa đã đăng ký</Link>}</Alert>}{loading && <p role="status" className="text-secondary">Đang cập nhật…</p>}
    {data && <>
      {data.wallet && !showWallet && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-body-sm"><p className="text-emerald-900">Số dư có thể dùng: <b className="font-bold">{vnd(data.wallet.balance)}</b></p><Link to={staff ? `/reception/members/${memberId}?tab=wallet` : '/member/wallet'} className="text-emerald-800 font-semibold inline-flex items-center gap-1">Nạp tiền<Icon name="arrow_forward" className="text-base" /></Link></div>}
      {showWallet && <div className="rounded-2xl bg-surface-container p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3"><span className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary"><Icon name="account_balance_wallet" /></span><div><p className="text-body-sm text-secondary">Số dư trả trước</p><p className="font-semibold text-headline-lg">{vnd(data.wallet.balance)}</p></div></div>
        {data.wallet.balance !== data.wallet.ledgerBalance && <Alert>Cần đối chiếu số dư; liên hệ trung tâm trước khi giao dịch.</Alert>}
        <p className="text-secondary text-body-sm">Dùng để đăng ký khóa học và thanh toán PT. Không hỗ trợ chuyển hoặc rút tiền.</p>
        {coursesOnly ? <Link className={btnOutline} to={`/reception/members/${memberId}`}>Xem số dư / nạp tiền cho hội viên</Link> : <div className="space-y-2 max-w-xl">
          <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <Field label="Số tiền nạp (VND)"><input className={inputCls} type="number" min="1" max="1000000000" step="1" value={staff && cashDraft ? cashDraft.amount : amount} disabled={staff && !!cashDraft} onChange={(e) => setAmount(e.target.value)} /></Field>
            <button className={btnPrimary} disabled={loading || (!cashDraft && (!Number.isInteger(Number(amount)) || Number(amount) <= 0 || Number(amount) > 1000000000))} onClick={() => staff ? startCash() : setIntent({
              title: 'Tạo yêu cầu nạp online', description: `Nạp ${vnd(amount)} qua PayOS.`,
              policy: 'Quét mã để nạp tiền. Số dư chỉ tăng sau khi thanh toán được xác nhận thành công.',
              path: '/wallet/online-top-ups', body: { amount: Number(amount) },
            })}>{staff ? cashDraft ? 'Tiếp tục xác nhận' : 'Thu tiền mặt & nạp ví' : 'Nạp online'}</button>
          </div>
          {staff && <p className="text-body-sm text-secondary">{cashDraft?.attempted ? 'Có yêu cầu chưa nhận được kết quả. Tiếp tục để kiểm tra lại cùng biên nhận, tránh nạp trùng.' : 'Mã biên nhận được tạo tự động sau khi xác nhận thu tiền.'}</p>}
        </div>}
      </div>}
      {payment && <PaymentPendingPanel payment={payment} />}
      {showLedger && <div className="rounded-xl bg-surface-container-lowest p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-semibold">Lịch sử nạp / chi / hoàn</h3><p className="text-body-sm text-secondary">{data.ledger.total} giao dịch</p></div>
          <button type="button" className={btnOutline} aria-expanded={showHistory} aria-controls={historyId} onClick={() => setShowHistory(value => !value)}>
            {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}<Icon name={showHistory ? 'expand_less' : 'expand_more'} />
          </button>
        </div>
        <div id={historyId} hidden={!showHistory}>
          <div className="max-h-96 overflow-y-auto">
            {data.ledger.items.slice((historyPage - 1) * 20, historyPage * 20).map((e) => <div className="border-b border-outline-variant py-2" key={e.id}>
              <b>{e.kind === 'CourseRefund' ? `Hoàn toàn khóa — ${e.courseName}` : e.kind}: {vnd(e.amount)}</b> — còn {vnd(e.balanceAfter)}
              <p className="text-secondary">{e.kind === 'CourseRefund'
                ? `${formatTimestamp(e.refundStartedAt)}${formatTimestamp(e.refundStartedAt) !== formatTimestamp(e.createdAt) ? ` → ${formatTimestamp(e.createdAt)}` : ''} • ${e.refundUnitCount} buổi • Đơn #${e.orderId}`
                : `${formatTimestamp(e.createdAt)} • ${e.reference}`}</p>
            </div>)}
            {!data.ledger.items.length && <p>Chưa có giao dịch.</p>}
          </div>
          <Pagination page={historyPage} pageSize={20} total={data.ledger.total} onPage={setPage} onPageSize={() => {}} />
        </div>
      </div>}
      {showCatalog && <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-bold text-slate-900">Chọn khóa học phù hợp</h2><span className="text-body-sm font-semibold rounded-full bg-slate-100 text-slate-600 px-2.5 py-1">{courses.length} khóa học</span></div>
        <div className="grid sm:grid-cols-[1fr_220px] gap-3">
          <input aria-label="Tìm khóa học" className={inputCls + ' !h-9'} value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm khóa học hoặc HLV…" />
          <select aria-label="Lọc bộ môn" className={inputCls + ' !h-9'} value={sport} onChange={event => setSport(event.target.value)}><option value="all">Tất cả bộ môn</option>{[...new Set(data.courses.map(item => item.course.sport))].sort().map(name => <option key={name}>{name}</option>)}</select>
        </div>
        <div className="grid lg:grid-cols-2 gap-3">{courses.map(({ course: c, canEnroll, enrollmentUnavailableReason }) => {
          const purchased = data.enrollments.some(e => e.classId === c.id && e.status === 'Confirmed')
          const appearance = courseAppearance(c.sport)
          return <article key={c.id} className={`group flex flex-col rounded-xl border border-slate-200 border-t-[3px] ${appearance.border} bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md`}>
            <div className="flex flex-col sm:flex-row flex-1">
            <CourseCover sport={c.sport} compact />
            <div className="p-3 sm:p-4 space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1.5"><span className={`rounded-md px-2 py-1 text-xs font-bold ${appearance.tag}`}>{c.sport}</span><Badge tone={purchased ? 'indigo' : canEnroll ? 'green' : 'amber'}>{purchased ? 'Đã đăng ký' : canEnroll ? `Còn ${Math.max(0, c.capacity - c.enrolled)} chỗ` : 'Chưa nhận đăng ký'}</Badge></div>
              <div><h3 className="text-lg leading-6 font-bold text-slate-900">{c.name}</h3><p className="text-xs text-slate-500 mt-1 line-clamp-1" title={c.description ?? undefined}>{LEVEL_LABEL[c.level] ?? c.level}{c.description ? ` · ${c.description}` : ''}</p></div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 font-semibold text-slate-800"><Icon name="event_repeat" className="text-base text-slate-400" />{c.durationWeeks} tuần · {c.expectedSessions} buổi</p>
                <p className="flex items-center gap-1.5"><Icon name="calendar_month" className="text-base text-slate-400" />{formatDate(c.firstSessionDate ?? c.startDate, { day: '2-digit', month: '2-digit', year: '2-digit' })} – {formatDate(c.lastSessionDate ?? c.endDate, { day: '2-digit', month: '2-digit', year: '2-digit' })}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1"><p className="flex items-center gap-1.5"><Icon name="person" className="text-base text-slate-400" />{c.coachId ? <CoachProfileButton coachId={c.coachId} coach={{ id: c.coachId, fullName: c.coach }} className="inline-flex items-center gap-1">{c.coach}<Icon name="info" className="text-sm" /></CoachProfileButton> : <span className="font-medium text-slate-700">{c.coach ?? 'Đang cập nhật HLV'}</span>}</p><p className="flex items-center gap-1"><Icon name="location_on" className="text-base text-slate-400" />{c.room}</p></div>
              </div>
              <div className="border-t border-slate-100 pt-2"><div className="flex flex-wrap items-baseline gap-x-2"><p className={`text-2xl font-bold tracking-tight ${appearance.price}`}>{vnd(c.courseFee)}</p><span className="text-xs text-slate-500">/ toàn khóa</span></div><p className="text-[11px] text-slate-500 mt-0.5">{c.sessionPrice != null ? `${vnd(c.sessionPrice)}/buổi · ` : ''}Hạn: {formatTimestamp(c.enrollmentClosesAt)}</p></div>
            </div>
            </div>
            {enrollmentUnavailableReason && <p className="mx-3 mb-2 rounded-md bg-amber-50 px-2 py-1.5 text-amber-900 text-xs" role="status">{enrollmentUnavailableReason}</p>}
            <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3 bg-slate-50/70">
              <button type="button" className={btnOutline + ' flex-1 !h-9 !text-xs bg-white'} onClick={() => view(c.id)}>Xem lịch & chi tiết</button>
              {purchased && !staff ? <Link className={btnPrimary + ' flex-1 !h-9 !text-xs'} to="/member/schedule?tab=courses">Khóa của tôi</Link>
                : <button type="button" className={btnPrimary + ' flex-1 !h-9 !text-xs'} disabled={loading || !canEnroll || purchased} onClick={() => enroll(c)}>{purchased ? 'Đã đăng ký' : canEnroll ? 'Đăng ký khóa' : 'Chưa thể đăng ký'}</button>}
            </div>
          </article>
        })}</div>
        {!courses.length && <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-secondary">{data.courses.length ? 'Không có khóa phù hợp. Hãy thử bộ môn hoặc từ khóa khác.' : 'Chưa có khóa học được công bố.'}</div>}
      </div>}
      {showEnrollments && <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-headline-md text-headline-md">Khóa đã đăng ký</h2><p className="text-secondary text-body-sm mt-1">Xem lịch toàn khóa, yêu cầu hỗ trợ hoặc quản lý đăng ký.</p></div>{!staff && <Link className={btnOutline} to="/member/classes">Tìm khóa mới</Link>}</div>
        <div className="grid lg:grid-cols-2 gap-4">{registered.map(renderEnrollment)}</div>
        {!registered.length && <p className="rounded-xl bg-white border border-dashed border-outline-variant p-6 text-secondary text-center">{staff ? 'Hội viên' : 'Bạn'} chưa có khóa học đang đăng ký.</p>}
        {previous.length > 0 && <details className="rounded-xl bg-white border border-outline-variant/50 p-4"><summary className="cursor-pointer font-semibold">Lịch sử khóa đã hủy ({previous.length})</summary><div className="grid lg:grid-cols-2 gap-4 mt-4">{previous.map(renderEnrollment)}</div></details>}
      </div>}
      {viewMode === 'wallet' && <div className="flex flex-wrap gap-3"><Link className={btnOutline} to={staff ? `/reception/members/${memberId}?view=available` : '/member/classes'}><Icon name="explore" className="text-lg" />{staff ? 'Đăng ký khóa học' : 'Khám phá khóa học & PT'}</Link><Link className={btnOutline} to={staff ? `/reception/members/${memberId}?tab=schedule` : '/member/schedule'}>{staff ? 'Lịch của hội viên' : 'Lịch của tôi'}</Link></div>}
    </>}
    {detail && <Modal size="wide" title={detail.name} onClose={() => setDetail(null)}><p>{detail.policy}</p><p className="py-2">{detail.expectedSessions} buổi • {vnd(detail.courseFee)} • đóng {formatTimestamp(detail.enrollmentClosesAt)}</p><CourseScheduleCalendar key={detail.id} title={detail.name} sessions={detail.sessions} /></Modal>}
    {intent && <CommerceConfirm intent={intent} onClose={closeIntent} onDone={done} />}
  </section>
}

export function CourseManagement({ embedded = false }) {
  const [params, setParams] = useSearchParams()
  const courseId = Number(params.get('courseId'))
  const selected = Number.isInteger(courseId) && courseId > 0 ? courseId : null
  const [courses, setCourses] = useState([])
  const [section, setSection] = useState('schedule')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [detail, setDetail] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [supportRequests, setSupportRequests] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [intent, setIntent] = useState(null)
  const [form, setForm] = useState({ fee: '', expectedSessions: '', cutoff: '' })
  const [cancel, setCancel] = useState({ reason: '', sessionId: '', refundWithoutMakeup: false, date: '', startTime: '', endTime: '', roomId: '' })
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const request = useRef(null)
  const formFor = useRef(null)
  const load = useCallback(async () => {
    request.current?.abort(); const c = new AbortController(); request.current = c
    setLoading(true); setError('')
    try {
      const [list, roomList] = await Promise.all([api('/courses', { signal: c.signal }), selected ? api('/rooms', { signal: c.signal }) : []])
      if (c.signal.aborted) return
      setCourses(list); setRooms(roomList)
      if (selected) {
        const [d, es, support] = await Promise.all([api(`/courses/${selected}`, { signal: c.signal }), api(`/courses/enrollments${query({ courseId: selected })}`, { signal: c.signal }), api('/courses/' + selected + '/support-requests', { signal: c.signal })])
        if (!c.signal.aborted) { setDetail(d); setEnrollments(es); setSupportRequests(support); if (formFor.current !== selected) { formFor.current = selected; setForm({ fee: d.courseFee || '', expectedSessions: d.expectedSessions || '', cutoff: d.enrollmentClosesAt ? businessDateTimeInput(d.enrollmentClosesAt) : '' }) } }
      }
    } catch (err) { if (!c.signal.aborted) setError(err.message) }
    finally { if (!c.signal.aborted) setLoading(false) }
  }, [selected])
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (active) load() }); return () => { active = false; request.current?.abort() } }, [load])
  const select = (c) => { const next = new URLSearchParams(params); next.set('courseId', String(c.id)); setParams(next); setSection('schedule'); setDetail(null); setEnrollments([]); setSupportRequests([]); setForm({ fee: c.courseFee || '', expectedSessions: c.expectedSessions || '', cutoff: c.enrollmentClosesAt ? businessDateTimeInput(c.enrollmentClosesAt) : '' }); setCancel({ reason: '', sessionId: '', refundWithoutMakeup: false, date: '', startTime: '', endTime: '', roomId: '' }) }
  const done = () => { setIntent(null); setNotice('Đã cập nhật thành công.'); load() }
  const shown = courses.filter(({ course }) => (!statusFilter || course.status === statusFilter) && (!search.trim() || `${course.name} ${course.sport}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN'))))
  return <div className="space-y-5">{!embedded && <h1 className="font-headline-xl text-headline-xl">Khóa học & lịch</h1>}
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}{loading && <p>Đang tải…</p>}
    {!selected && <>
      <div className="grid sm:grid-cols-[1fr_220px] gap-3"><input className={inputCls} aria-label="Tìm khóa học" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tên khóa học, bộ môn…" /><select className={inputCls} aria-label="Trạng thái khóa học" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(CLASS_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <p className="text-secondary text-body-sm">{shown.length} khóa học · Chọn một khóa để xem lịch, học viên và học phí.</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{shown.map(({ course: c }) => <button type="button" key={c.id} onClick={() => select(c)} className="rounded-2xl border border-outline-variant/50 bg-white p-5 text-left space-y-4 hover:border-primary-container hover:shadow-sm transition-all">
        <div className="flex items-center justify-between gap-2"><span className="text-body-sm text-primary">{c.sport}</span><Badge tone={c.status === 'Open' ? 'green' : c.status === 'Cancelled' ? 'red' : 'slate'}>{CLASS_STATUS_LABEL[c.status] ?? c.status}</Badge></div>
        <h2 className="font-semibold text-lg">{c.name}</h2><p className="text-body-sm text-secondary">{c.expectedSessions} buổi · {c.enrolled}/{c.capacity} học viên<br />HLV: {c.coach ?? 'Chưa phân công'} · {c.room}</p>
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/40"><b>{vnd(c.courseFee)}</b><span className="text-primary text-body-sm inline-flex items-center gap-1">Quản lý khóa<Icon name="arrow_forward" className="text-base" /></span></div>
      </button>)}</div>
      {!loading && !shown.length && <p className="rounded-xl border border-dashed border-outline-variant bg-white p-8 text-center text-secondary">Không có khóa học phù hợp.</p>}
    </>}
    {selected && <button type="button" className="inline-flex items-center gap-1 text-primary text-body-sm" onClick={() => { const next = new URLSearchParams(params); next.delete('courseId'); setParams(next); setDetail(null); formFor.current = null }}><Icon name="arrow_back" className="text-lg" />Tất cả khóa học</button>}
    {detail?.id === selected && <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-4 sm:p-5 space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-xl">{detail.name}</h2><p className="text-secondary text-body-sm mt-1">{detail.expectedSessions} buổi · {vnd(detail.courseFee)} · Hạn đăng ký {formatTimestamp(detail.enrollmentClosesAt)}</p></div><Badge tone={detail.status === 'Open' ? 'green' : 'slate'}>{CLASS_STATUS_LABEL[detail.status] ?? detail.status}</Badge></div>
      <nav aria-label="Chi tiết khóa học" className="flex flex-wrap gap-1 border-b border-outline-variant/40 pb-3">{[['schedule', 'Lịch học'], ['people', 'Học viên & hỗ trợ'], ['settings', 'Học phí & mở đăng ký'], ['cancel', 'Hủy / bù buổi']].map(([value, label]) => <button type="button" key={value} aria-pressed={section === value} onClick={() => setSection(value)} className={`rounded-lg px-3 py-2 text-body-sm font-semibold ${section === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container-low'}`}>{label}</button>)}</nav>
      {!!detail.validationIssues?.length && <Alert><p>Khóa chưa đủ điều kiện mở đăng ký:</p>{detail.validationIssues.map(i => <p key={i.errorCode}>{i.message}</p>)}<Link className={btnOutline} to="/manager/classes">Hoàn thiện lịch / từng buổi</Link></Alert>}
      {section === 'settings' && <div className="space-y-4"><form className="grid sm:grid-cols-3 gap-3" onSubmit={e => { e.preventDefault(); setIntent({ title: 'Cập nhật điều khoản khóa', description: detail.name, policy: 'Không sửa điều khoản khóa đã bán; không mở lại cutoff đã qua. Cập nhật đưa khóa về Draft để kiểm tra trước khi publish.', path: `/courses/${selected}/terms`, method: 'PUT', body: { fee: Number(form.fee), expectedSessions: Number(form.expectedSessions), enrollmentClosesAt: businessDateTimeToUtc(form.cutoff) } }) }}>
        <Field label="Học phí nguyên khóa (VND)"><input className={inputCls} type="number" min="1" step="1" required value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} /></Field><Field label="Số buổi công bố"><input className={inputCls} type="number" min="1" max="366" required value={form.expectedSessions} onChange={e => setForm({ ...form, expectedSessions: e.target.value })} /></Field><Field label="Hạn đăng ký (giờ Việt Nam)"><input className={inputCls} type="datetime-local" required value={form.cutoff} onChange={e => setForm({ ...form, cutoff: e.target.value })} /></Field><button className={btnOutline} disabled={loading}>Lưu điều khoản</button><button type="button" className={btnOutline} disabled={loading || !form.cutoff} onClick={() => setIntent({ title: 'Điều chỉnh riêng hạn đăng ký', description: detail.name, policy: 'Chỉ khi hạn cũ chưa qua. Không đổi giá/số buổi đã bán; không mở lại khóa đã đóng theo thời gian.', path: `/courses/${selected}/enrollment-cutoff`, method: 'PUT', body: { enrollmentClosesAt: businessDateTimeToUtc(form.cutoff) } })}>Lưu riêng hạn đăng ký</button>
      </form>
      <div className="flex flex-wrap gap-2">{[true, false].map(open => <button key={String(open)} className={open ? btnPrimary : btnOutline} disabled={loading || detail.status === 'Cancelled'} onClick={() => setIntent({ title: open ? 'Mở đăng ký khóa' : 'Đóng đăng ký khóa', description: detail.name, policy: 'Backend kiểm tra lịch đủ buổi, tài nguyên, giá và cutoff. Đóng/mở không gia hạn mốc đã lưu.', path: `/courses/${selected}/publish`, method: 'PUT', body: { open } })}>{open ? 'Mở đăng ký' : 'Đóng đăng ký'}</button>)}</div></div>}
      {section === 'schedule' && <CourseScheduleCalendar key={detail.id} title={detail.name} sessions={detail.sessions} />}
      {section === 'people' && <div className="space-y-4"><h3 className="font-semibold">Học viên ({enrollments.length})</h3>{enrollments.map(e => <div className="rounded-lg bg-surface-container-low p-3" key={e.id}><b>{e.member}</b><p className="text-secondary text-body-sm">{e.status === 'Confirmed' ? 'Đã đăng ký' : 'Đã hủy'} · Đã thanh toán {vnd(e.paidAmount)} · Đã hoàn {vnd(e.refundedAmount)}</p></div>)}{!enrollments.length && <p className="text-secondary text-body-sm">Chưa có học viên đăng ký.</p>}
      <h3 className="font-semibold">Yêu cầu hỗ trợ khóa</h3>{supportRequests.map(r => <p key={r.id}>{r.member} • {r.status} • {r.description} • {formatTimestamp(r.createdAt)}</p>)}
      {!supportRequests.length && <p className="text-body-sm text-secondary">Không có yêu cầu hỗ trợ.</p>}</div>}
      {section === 'cancel' && <div className="space-y-4"><p className="text-body-sm text-secondary">Chọn hủy toàn khóa hoặc xử lý một buổi. Khoản hoàn và quyền lợi được kiểm tra lại khi xác nhận.</p><Field label="Lý do hủy"><textarea className={inputCls} maxLength={500} value={cancel.reason} onChange={e => setCancel({ ...cancel, reason: e.target.value })} /></Field>
      <button className={btnOutline} disabled={loading || cancel.reason.trim().length < 2 || detail.status === 'Cancelled'} onClick={() => setIntent({ title: 'Trung tâm hủy toàn khóa', description: detail.name, policy: 'Trước khai giảng: hoàn phần thực trả chưa hoàn. Sau khai giảng: chỉ hoàn các buổi chưa cung cấp theo học phí phân bổ lúc đăng ký. Giữ lịch sử buổi đã diễn ra.', path: `/courses/${selected}/cancel`, body: { reason: cancel.reason.trim() } })}>Hủy toàn khóa</button>
      <div className="border-t pt-3 space-y-3"><Field label="Chọn buổi cần hủy"><select className={inputCls} value={cancel.sessionId} onChange={e => setCancel({ ...cancel, sessionId: e.target.value })}><option value="">Chọn từ lịch khóa</option>{detail.sessions.filter(s => s.status === 'Scheduled').map(s => <option key={s.id} value={s.id}>{s.date} {fromTimeOnly(s.startTime)} • {s.room}</option>)}</select></Field>
        <label className="flex gap-2"><input type="checkbox" checked={cancel.refundWithoutMakeup} onChange={e => setCancel({ ...cancel, refundWithoutMakeup: e.target.checked })} />Xác nhận không có buổi bù — hoàn phần học phí buổi này</label>
        {!cancel.refundWithoutMakeup && <div className="grid sm:grid-cols-2 gap-3"><Field label="Ngày bù"><input className={inputCls} type="date" value={cancel.date} onChange={e => setCancel({ ...cancel, date: e.target.value })} /></Field><Field label="Phòng bù"><select className={inputCls} value={cancel.roomId} onChange={e => setCancel({ ...cancel, roomId: e.target.value })}><option value="">Chọn phòng</option>{rooms.filter(r => r.status === 'Active').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field><Field label="Bắt đầu"><input className={inputCls} type="time" value={cancel.startTime} onChange={e => setCancel({ ...cancel, startTime: e.target.value })} /></Field><Field label="Kết thúc"><input className={inputCls} type="time" value={cancel.endTime} onChange={e => setCancel({ ...cancel, endTime: e.target.value })} /></Field></div>}
        <button className={btnOutline} disabled={loading || !cancel.sessionId || cancel.reason.trim().length < 2 || (!cancel.refundWithoutMakeup && (!cancel.date || !cancel.startTime || !cancel.endTime || !cancel.roomId))} onClick={() => setIntent({ title: 'Hủy một buổi khóa', description: detail.name, policy: cancel.refundWithoutMakeup ? 'Hoàn đúng phân bổ của buổi chưa cung cấp, không hoàn lặp khi hủy cả khóa.' : 'Tạo buổi bù liên kết, chuyển quyền tham gia; không thu thêm hoặc hoàn tiền.', path: `/courses/${selected}/sessions/${cancel.sessionId}/cancel`, body: { reason: cancel.reason.trim(), refundWithoutMakeup: cancel.refundWithoutMakeup, date: cancel.date || null, startTime: cancel.startTime ? cancel.startTime + ':00' : null, endTime: cancel.endTime ? cancel.endTime + ':00' : null, roomId: cancel.roomId ? Number(cancel.roomId) : null } })}>Xác nhận phương án hủy buổi</button>
      </div></div>}
    </div>}
    {intent && <CommerceConfirm intent={intent} onClose={() => setIntent(null)} onDone={done} />}
  </div>
}

export function PtPricing() {
  const [prices, setPrices] = useState([])
  const [price, setPrice] = useState({ sportId: '', value: '' })
  const [intent, setIntent] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => { setLoading(true); setError(''); try { setPrices(await api('/pt/prices')) } catch (err) { setError(err.message) } finally { setLoading(false) } }, [])
  useEffect(() => { let active = true; void Promise.resolve().then(() => { if (active) load() }); return () => { active = false } }, [load])
  return <section className="rounded-2xl border border-outline-variant/50 bg-white p-5 space-y-4"><div><h2 className="font-semibold text-lg">Giá PT theo bộ môn</h2><p className="text-body-sm text-secondary mt-1">Giá cho một buổi 60 phút. Thay đổi chỉ áp dụng cho đơn mới.</p></div>
    {error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}{loading && <p role="status">Đang tải giá…</p>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{prices.map(item => <div key={item.id} className="rounded-xl bg-surface-container-low p-4"><p className="text-body-sm text-secondary">{item.name}</p><b className="text-lg">{item.ptSinglePrice == null ? 'Chưa cấu hình' : vnd(item.ptSinglePrice)}</b></div>)}</div>
    <form className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end" onSubmit={event => { event.preventDefault(); setIntent({ title: 'Cập nhật giá PT lẻ', description: prices.find(item => String(item.id) === price.sportId)?.name, policy: 'Chỉ áp dụng đơn mới; giá đơn đã mua được giữ nguyên.', path: `/pt/prices/${price.sportId}`, method: 'PUT', body: { price: Number(price.value) } }) }}>
      <Field label="Bộ môn"><select className={inputCls} required value={price.sportId} onChange={event => setPrice({ sportId: event.target.value, value: prices.find(item => String(item.id) === event.target.value)?.ptSinglePrice ?? '' })}><option value="">Chọn bộ môn</option>{prices.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
      <Field label="Giá mỗi buổi (VND)"><input className={inputCls} required type="number" min="1" step="1" value={price.value} onChange={event => setPrice({ ...price, value: event.target.value })} /></Field><button className={btnPrimary} disabled={loading}>Lưu giá PT</button>
    </form>
    {intent && <CommerceConfirm intent={intent} onClose={() => setIntent(null)} onDone={() => { setIntent(null); setNotice('Đã cập nhật giá PT.'); load() }} />}
  </section>
}

