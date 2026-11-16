import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { toDateOnly } from '../dateUtils'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { PAYMENT_STATUS_LABEL, PLAN_TYPE_LABEL, SUBSCRIPTION_STATUS_LABEL } from '../labels'
import { useClientPaged } from '../usePaged'
import { MemberTierCard } from '../components/MemberTier'

const STATUS_TONE = { Pending: 'amber', Active: 'green', Expired: 'slate', Cancelled: 'red' }
const PAYMENT_STATUS_TONE = { Pending: 'amber', Paid: 'green', Failed: 'red', Refunded: 'slate' }

const dayCount = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000) + 1
const cancellationErrorMessage = err => err.status === 405 || err.status === 404 && err.errorCode !== 'SUBSCRIPTION_NOT_FOUND'
  ? 'Backend đang chạy chưa hỗ trợ tự hủy gói. Cần cập nhật Backend để dùng chức năng này.' : err.message

function CancelSubscriptionModal({ sub, onClose, onDone }) {
  const [preview, setPreview] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [key] = useState(() => crypto.randomUUID())
  const pending = useRef(false), active = useRef(false)
  const path = `/me/subscriptions/${sub.id}`
  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    api(`${path}/cancellation`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setPreview(data) })
      .catch(err => { if (!controller.signal.aborted) setError(cancellationErrorMessage(err)) })
    return () => { active.current = false; controller.abort() }
  }, [path])
  const close = () => { if (!pending.current) onClose() }
  const confirm = async () => {
    if (pending.current || !preview?.canCancel) return
    pending.current = true; setBusy(true); setError('')
    try {
      const result = await api(`${path}/cancel`, { method: 'POST',
        body: { confirmed: true, expectedRefundAmount: preview.refundAmount, policyVersion: preview.policyVersion }, idempotencyKey: key })
      if (active.current) onDone(result)
    } catch (err) {
      if (active.current) {
        setError(cancellationErrorMessage(err))
        if (err.errorCode === 'SUBSCRIPTION_CANCELLATION_BLOCKED') setPreview(data => ({ ...data, canCancel: false, unavailableReason: err.message }))
      }
    }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <Modal title="Hủy gói tập" onClose={close} footer={<div className="w-full space-y-3">{error && <Alert>{error}</Alert>}<div className="flex justify-end gap-2"><button type="button" className={btnOutline} disabled={busy} onClick={close}>Giữ gói</button><button type="button" className={btnPrimary + ' !bg-red-600 hover:!bg-red-700'} disabled={busy || !preview?.canCancel} onClick={confirm}>{busy ? 'Đang hủy…' : 'Xác nhận hủy gói'}</button></div></div>}>
    <div className="space-y-4"><div><h3 className="font-semibold">{sub.planName}</h3><p className="mt-1 text-body-sm text-secondary">{sub.startDate} → {sub.endDate}</p></div>
      {!preview && !error && <p role="status" className="text-secondary">Đang kiểm tra gói và các lịch tập liên quan…</p>}
      {preview && <><p className="text-body-sm text-secondary">{preview.policy}</p><div className="flex justify-between gap-3 rounded-lg bg-surface-container p-3"><span>Hoàn vào số dư</span><b>{Number(preview.refundAmount).toLocaleString('vi-VN')}đ</b></div>{preview.unavailableReason && <Alert type="warning">{preview.unavailableReason}</Alert>}{!preview.canCancel && <Link to="/member/schedule" className="inline-block text-primary underline" onClick={close}>Xem lịch tập của tôi</Link>}</>}
    </div>
  </Modal>
}

function CurrentPlanHero({ sub, onCancel }) {
  if (!sub) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-dashed border-outline-variant text-center flex flex-col items-center gap-3">
        <Icon name="card_membership" className="text-4xl text-outline" />
        <p className="text-on-surface font-semibold">Bạn chưa có gói nào đang hoạt động</p>
        <p className="text-secondary text-body-sm">Bạn có thể đăng ký khóa nhiều tuần hoặc đặt PT riêng.</p>
        <Link to="/member/classes" className={btnPrimary}>
          <Icon name="add" className="text-lg" />
          Khám phá khóa học & PT
        </Link>
      </div>
    )
  }
  const total = dayCount(sub.startDate, sub.endDate)
  const pct = Math.max(0, Math.min(100, Math.round((sub.remainingDays / total) * 100)))
  const ptPct = sub.totalPtSessions > 0 ? Math.round((sub.remainingPtSessions / sub.totalPtSessions) * 100) : null
  const upcoming = sub.startDate > toDateOnly()

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5 border border-outline-variant/50 border-l-4 border-l-primary-container shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wide text-primary font-semibold">{upcoming ? `Sắp bắt đầu · từ ${sub.startDate}` : 'Gói đang sử dụng'}</span>
        <Badge tone="green">{PLAN_TYPE_LABEL[sub.planType] ?? sub.planType}</Badge>
      </div>
      <h2 className="text-xl font-bold text-on-surface mb-3">{sub.planName}</h2>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center justify-between text-body-sm mb-1">
            <span className="text-secondary">Thời hạn còn lại</span>
            <span className="font-semibold text-on-surface">{sub.remainingDays} / {total} ngày</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-container-high overflow-hidden">
            <div className="h-full rounded-full bg-primary-container transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-secondary text-body-sm mt-1">{sub.startDate} → {sub.endDate}</div>
        </div>

        {ptPct !== null ? (
          <div>
            <div className="flex items-center justify-between text-body-sm mb-1">
              <span className="text-secondary">Buổi PT còn lại</span>
              <span className="font-semibold text-on-surface">{sub.remainingPtSessions} / {sub.totalPtSessions} buổi</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full rounded-full bg-tertiary-container transition-all" style={{ width: `${ptPct}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center text-body-sm text-secondary">
            <span className="flex items-center gap-1.5"><Icon name="groups" className="text-base text-primary" />{sub.includesClasses ? 'Bao gồm lớp học nhóm' : 'Không bao gồm lớp học nhóm'}</span>
            <span className="flex items-center gap-1.5 mt-1"><Icon name="sports" className="text-base text-primary" />{sub.sportName ?? 'Áp dụng mọi bộ môn'}</span>
          </div>
        )}
      </div>

      {(sub.sportName || sub.includesClasses) && (
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-outline-variant/30">
          {sub.sportName && <Badge tone="indigo">{sub.sportName}</Badge>}
          {sub.includesClasses && <Badge tone="indigo">Lớp học nhóm</Badge>}
        </div>
      )}
      <div className="mt-4 flex justify-end"><button type="button" aria-label={`Hủy gói ${sub.planName}`} className={btnOutline + ' !h-9 !text-red-700'} onClick={() => onCancel(sub)}><Icon name="cancel" className="text-base" />Hủy gói</button></div>
    </div>
  )
}


export default function MemberSubscriptionPage({ embedded = false }) {
  const [subs, setSubs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cancelling, setCancelling] = useState(null), [notice, setNotice] = useState(''), [reload, setReload] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const historyId = useId()

  useEffect(() => {
    const controller = new AbortController()
    api('/me/subscriptions', { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { setSubs(data); setError('') } })
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])

  const cancelled = result => {
    setSubs(current => current.map(sub => sub.id === result.subscriptionId ? { ...sub, status: 'Cancelled', remainingDays: 0 } : sub))
    setCancelling(null); setNotice(result.message ?? 'Đã hủy gói. Bạn có thể xem lại trong Lịch sử đăng ký.'); setReload(value => value + 1)
  }

  // Every not-yet-expired plan (the API reports past-end ones as Expired), the one in force first.
  const current = useMemo(
    () => subs.filter((s) => s.status === 'Active').sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate)),
    [subs],
  )

  const filtered = useMemo(
    () =>
      subs
        .filter((s) => statusFilter === 'all' || s.status === statusFilter)
        .filter((s) => typeFilter === 'all' || s.planType === typeFilter)
        .filter((s) => !search.trim() || s.planName.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
    [subs, statusFilter, typeFilter, search],
  )
  const { pageItems, pagination, offset } = useClientPaged(filtered)

  return (
    <div className="flex flex-col gap-6">
      {!embedded && <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Gói tập của tôi</h1>
          <p className="text-secondary">Tra cứu quyền lợi và lịch sử các gói tập đã mua.</p>
        </div>
        <Link to="/member/classes?type=packages" className={btnPrimary}>
          <Icon name="add" className="text-lg" />
          Đăng ký gói tập
        </Link>
      </div>}

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      {current.length ? (
        <div className="flex flex-col gap-4">
          <h3 className="font-headline-sm text-headline-sm">Gói còn hạn ({current.length})</h3>
          <div className="grid xl:grid-cols-2 gap-4">{current.map((s) => <CurrentPlanHero key={s.id} sub={s} onCancel={setCancelling} />)}</div>
        </div>
      ) : (
        <CurrentPlanHero sub={null} />
      )}

      <details className="rounded-xl border border-outline-variant/40 bg-white p-4">
        <summary className="cursor-pointer font-semibold text-body-sm">Hạng hội viên & quyền lợi</summary>
        <div className="pt-3"><MemberTierCard /></div>
      </details>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/40 bg-white p-4">
          <div><h3 className="font-headline-sm text-headline-sm">Lịch sử đăng ký</h3>
            {!loading && !error && <p className="mt-1 text-body-sm text-secondary">{subs.length} đăng ký</p>}
          </div>
          <button type="button" className={btnOutline} aria-expanded={showHistory} aria-controls={historyId} onClick={() => setShowHistory(value => !value)}>
            {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}<Icon name={showHistory ? 'expand_less' : 'expand_more'} className="text-lg" />
          </button>
        </div>

        <div id={historyId} hidden={!showHistory} className="space-y-4">
        <div className="bg-surface-container rounded-xl shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Từ khoá">
              <input className={inputCls} placeholder="Tìm theo tên gói…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Field>
            <Field label="Trạng thái">
              <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">— Tất cả —</option>
                {Object.entries(SUBSCRIPTION_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Loại gói">
              <select className={inputCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">— Tất cả —</option>
                {Object.entries(PLAN_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className={btnOutline}
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setTypeFilter('all')
              }}
            >
              Đặt lại
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
                <th className="px-4 py-3 w-14">STT</th>
                <th className="px-4 py-3">Tên gói</th>
                <th className="px-4 py-3">Thời hạn</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-50' : ''}>
              {pageItems.map((s, i) => (
                <tr key={s.id} className="border-t border-surface-container">
                  <td className="px-4 py-3 text-secondary">{offset + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{s.planName}</div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <Badge tone="indigo">{PLAN_TYPE_LABEL[s.planType] ?? s.planType}</Badge>
                      {s.sportName && <Badge tone="indigo">{s.sportName}</Badge>}
                      {s.includesClasses && <Badge tone="indigo">Lớp học nhóm</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary">
                    {s.startDate} → {s.endDate}
                    {s.status === 'Active' && <div>Còn {s.remainingDays} ngày</div>}
                    {s.totalPtSessions > 0 && <div>PT: {s.remainingPtSessions}/{s.totalPtSessions} buổi</div>}
                  </td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[s.status]}>{SUBSCRIPTION_STATUS_LABEL[s.status]}</Badge></td>
                  <td className="px-4 py-3">
                    {s.status === 'Pending' && s.paymentStatus ? (
                      <Badge tone={PAYMENT_STATUS_TONE[s.paymentStatus]}>{PAYMENT_STATUS_LABEL[s.paymentStatus]}</Badge>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status === 'Active' && <button type="button" aria-label={`Hủy gói ${s.planName}`} className={btnOutline + ' !h-8 !text-red-700'} onClick={() => setCancelling(s)}>Hủy gói</button>}
                    {s.status === 'Cancelled' && (
                      <Link className={btnOutline + ' !h-8'} to="/member/classes?type=packages">
                        <Icon name="refresh" className="text-base" />
                        Đăng ký lại
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && !subs.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Chưa có gói tập nào. Hãy xem bảng giá để đăng ký.</td></tr>
              )}
              {!loading && subs.length > 0 && !filtered.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Không có gói nào khớp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
          {pagination}
        </div>
        </div>
      </div>

      <p className="text-secondary text-body-sm">Khóa học nhiều tuần nằm trong <Link className="text-primary underline" to="/member/schedule?tab=courses">Khóa đã đăng ký</Link>. Xem các khoản thu và hoàn tiền trong <Link className="text-primary underline" to="/member/wallet">Số dư</Link>.</p>

      {cancelling && <CancelSubscriptionModal key={cancelling.id} sub={cancelling} onClose={() => setCancelling(null)} onDone={cancelled} />}
    </div>
  )
}
