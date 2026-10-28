import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Badge, Field, Icon, Modal, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { SUBSCRIPTION_STATUS_LABEL } from '../labels'
import { BookingSchedule } from './MyMemberSchedulePage'

const STATUS_TONE = { Pending: 'amber', Active: 'green', Expired: 'slate', Cancelled: 'red' }

function SellPackageModal({ memberId, onClose, onDone }) {
  const [plans, setPlans] = useState([])
  const [planId, setPlanId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/membership-plans').then(setPlans).catch((err) => setError(err.message))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!planId) return
    setBusy(true)
    setError('')
    try {
      const payment = await api('/subscriptions', { method: 'POST', body: { planId: Number(planId), memberId: Number(memberId) } })
      onDone(payment)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Bán / gia hạn gói tập" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Gói tập">
          <select className={inputCls} required value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">— Chọn gói —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString('vi-VN')}đ / {p.durationDays} ngày</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang tạo đơn…' : 'Tạo đơn thanh toán'}</button>
        </div>
      </form>
    </Modal>
  )
}

// Search-only directory: ID / tên / email / SĐT đều khớp qua cùng 1 ô (GET /members?q=), chọn 1 dòng để xem chi tiết.
function MemberDirectory() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(null)

  const load = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await api(`/members${query({ q, page, pageSize })}`, { signal: controller.signal })
      if (!controller.signal.aborted) setData(result)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }, [q, page, pageSize])
  const stop = useCallback(() => request.current?.abort(), [])

  // Debounce so we don't call the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => { clearTimeout(t); stop() }
  }, [load, stop])

  useEffect(() => {
    setPage(1)
  }, [q])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <Field label="Tìm hội viên">
          <input className={inputCls} placeholder="Mã hội viên, tên, email hoặc số điện thoại…" value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {data.items.map((m) => (
              <tr key={m.id} className="border-t border-surface-container cursor-pointer hover:bg-surface-container" onClick={() => navigate(`/reception/members/${m.id}`)}>
                <td className="px-4 py-3 text-secondary">#{m.id}</td>
                <td className="px-4 py-3 font-semibold">{m.fullName}</td>
                <td className="px-4 py-3 text-secondary">{m.email}</td>
                <td className="px-4 py-3 text-secondary">{m.phone ?? '—'}</td>
                <td className="px-4 py-3"><Badge tone={m.isActive ? 'green' : 'red'}>{m.isActive ? 'Hoạt động' : 'Đã khoá'}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/reception/members/${m.id}`} className={btnOutline + ' !h-8 !px-2'} onClick={(e) => e.stopPropagation()} title="Xem chi tiết">
                    <Icon name="chevron_right" className="text-base" />
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && !data.items.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Không tìm thấy hội viên phù hợp.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPage={setPage}
          onPageSize={(n) => {
            setPageSize(n)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}

function ReceptionMemberContent({ id }) {
  const [subs, setSubs] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [lastPayment, setLastPayment] = useState(null)
  const [member, setMember] = useState(null)
  const request = useRef(null)

  const load = async (memberId) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    setSubs(null)
    try {
      const [subscriptions, people] = await Promise.all([
        api(`/members/${memberId}/subscriptions`, { signal: controller.signal }),
        api(`/members${query({ q: memberId, pageSize: 50 })}`, { signal: controller.signal }),
      ])
      if (!controller.signal.aborted) { setSubs(subscriptions); setMember(people.items.find((m) => String(m.id) === String(memberId)) ?? null) }
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }
  const stop = useCallback(() => request.current?.abort(), [])

  useEffect(() => {
    if (id) load(id)
    return stop
  }, [id, stop])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        {id && (
          <Link to="/reception/members" className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant" title="Quay lại danh sách">
            <Icon name="arrow_back" className="text-xl" />
          </Link>
        )}
        <div>
          <h1 className="font-headline-xl text-headline-xl">{id ? 'Chi tiết thành viên' : 'Danh sách hội viên'}</h1>
          <p className="text-secondary">{id ? `Đang thao tác: ${member?.fullName ?? 'Hội viên'} #${id}${member?.email ? ` • ${member.email}` : ''}` : 'Tìm hội viên theo mã, tên, email hoặc số điện thoại.'}</p>
        </div>
      </div>

      {!id && <MemberDirectory />}

      {error && <Alert>{error}</Alert>}
      {lastPayment && (
        <Alert type="success">
          Đã tạo đơn thanh toán #{lastPayment.id} ({lastPayment.amount.toLocaleString('vi-VN')}đ). Đưa mã QR cho hội viên hoặc xác nhận khi nhận chuyển khoản.
        </Alert>
      )}

      {id && (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
            <h2 className="font-headline-md text-headline-md">Gói của hội viên #{id}</h2>
            <button className={btnPrimary} onClick={() => setModal(true)}>
              <Icon name="sell" className="text-lg" />
              Bán / gia hạn gói
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
                <th className="px-4 py-3">Gói</th>
                <th className="px-4 py-3">Thời hạn</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Buổi PT còn lại</th>
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-50' : ''}>
              {subs?.map((s) => (
                <tr key={s.id} className="border-t border-surface-container">
                  <td className="px-4 py-3 font-semibold">{s.planName}</td>
                  <td className="px-4 py-3 text-secondary">{s.startDate} → {s.endDate}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[s.status]}>{SUBSCRIPTION_STATUS_LABEL[s.status]}</Badge></td>
                  <td className="px-4 py-3">{s.remainingPtSessions}</td>
                </tr>
              ))}
              {!loading && subs && !subs.length && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-secondary">Hội viên chưa có gói tập nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {id && <section className="space-y-4"><h2 className="font-headline-md text-headline-md">Lịch & booking của {member?.fullName ?? `hội viên #${id}`}</h2><div className="flex gap-2"><Link className={btnOutline} to="/reception/classes">Đặt lớp cho hội viên</Link><Link className={btnOutline} to="/reception/pt">Đặt PT cho hội viên</Link></div><BookingSchedule memberId={id} onChanged={() => load(id)} /></section>}
      {modal && (
        <SellPackageModal
          memberId={id}
          onClose={() => setModal(false)}
          onDone={(payment) => {
            setModal(false)
            setLastPayment(payment)
            load(id)
          }}
        />
      )}
    </div>
  )
}

export default function ReceptionMemberPage() {
  const { id } = useParams()
  // Reset subscriptions, selected booking and pending modals immediately when switching members.
  return <ReceptionMemberContent key={id ?? 'directory'} id={id} />
}
