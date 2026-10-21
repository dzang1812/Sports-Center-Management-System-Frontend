import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Badge, Field, Icon, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { PAYMENT_STATUS_LABEL, PLAN_TYPE_LABEL, SUBSCRIPTION_STATUS_LABEL } from '../labels'

const STATUS_TONE = { Pending: 'amber', Active: 'green', Expired: 'slate', Cancelled: 'red' }
const PAYMENT_STATUS_TONE = { Pending: 'amber', Paid: 'green', Failed: 'red', Refunded: 'slate' }

const dayCount = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000) + 1

function CurrentPlanHero({ sub }) {
  if (!sub) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-dashed border-outline-variant text-center flex flex-col items-center gap-3">
        <Icon name="card_membership" className="text-4xl text-outline" />
        <p className="text-on-surface font-semibold">Bạn chưa có gói nào đang hoạt động</p>
        <p className="text-secondary text-body-sm">Đăng ký một gói để bắt đầu tập luyện và đặt lớp/PT.</p>
        <Link to="/packages" className={btnPrimary}>
          <Icon name="add" className="text-lg" />
          Xem bảng giá
        </Link>
      </div>
    )
  }
  const total = dayCount(sub.startDate, sub.endDate)
  const pct = Math.max(0, Math.min(100, Math.round((sub.remainingDays / total) * 100)))
  const ptPct = sub.totalPtSessions > 0 ? Math.round((sub.remainingPtSessions / sub.totalPtSessions) * 100) : null

  return (
    <div className="bg-gradient-to-br from-primary-container/15 via-surface-container-lowest to-tertiary-container/10 rounded-xl p-6 shadow-md border border-primary-container/30">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wide text-primary font-semibold">Gói đang sử dụng</span>
        <Badge tone="green">{PLAN_TYPE_LABEL[sub.planType] ?? sub.planType}</Badge>
      </div>
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">{sub.planName}</h2>

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

      <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-outline-variant/30">
        {sub.sportName && <Badge tone="indigo">{sub.sportName}</Badge>}
        {sub.includesClasses && <Badge tone="indigo">Lớp học nhóm</Badge>}
        <Link to="/packages" className={btnOutline + ' !h-8 ml-auto'}>Đăng ký thêm gói khác</Link>
      </div>
    </div>
  )
}


export default function MemberSubscriptionPage() {
  const [subs, setSubs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api('/me/subscriptions')
      .then(setSubs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const current = useMemo(() => subs.find((s) => s.status === 'Active') ?? null, [subs])

  const filtered = useMemo(
    () =>
      subs
        .filter((s) => statusFilter === 'all' || s.status === statusFilter)
        .filter((s) => typeFilter === 'all' || s.planType === typeFilter)
        .filter((s) => !search.trim() || s.planName.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
    [subs, statusFilter, typeFilter, search],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Gói của tôi</h1>
          <p className="text-secondary">Các gói tập đã đăng ký và trạng thái sử dụng.</p>
        </div>
        <Link to="/packages" className={btnPrimary}>
          <Icon name="add" className="text-lg" />
          Mua gói mới
        </Link>
      </div>

      {error && <Alert>{error}</Alert>}

      <CurrentPlanHero sub={current} />

      <div className="flex flex-col gap-4">
        <h3 className="font-headline-sm text-headline-sm">Lịch sử đăng ký</h3>

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
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-50' : ''}>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-t border-surface-container">
                  <td className="px-4 py-3 text-secondary">{i + 1}</td>
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
                </tr>
              ))}
              {!loading && !subs.length && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-secondary">Chưa có gói tập nào. Hãy xem bảng giá để đăng ký.</td></tr>
              )}
              {!loading && subs.length > 0 && !filtered.length && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-secondary">Không có gói nào khớp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Alert type="info">
        Lịch sử thanh toán chi tiết theo từng giao dịch hiện chỉ xem được ngay sau khi thanh toán (trang kết quả thanh toán) — hệ thống backend chưa có API
        liệt kê toàn bộ hoá đơn theo hội viên.
      </Alert>
    </div>
  )
}
