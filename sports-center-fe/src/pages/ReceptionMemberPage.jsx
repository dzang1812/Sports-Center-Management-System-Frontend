import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { SUBSCRIPTION_STATUS_LABEL } from '../labels'

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

export default function ReceptionMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState(id ?? '')
  const [subs, setSubs] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(false)
  const [lastPayment, setLastPayment] = useState(null)

  const load = async (memberId) => {
    setLoading(true)
    setError('')
    setSubs(null)
    try {
      setSubs(await api(`/members/${memberId}/subscriptions`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (id) load(id)
  }, [id])

  const onSearch = (e) => {
    e.preventDefault()
    if (search) navigate(`/reception/members/${search}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Chi tiết thành viên</h1>
        <p className="text-secondary">Tra cứu gói tập theo mã hội viên, bán hoặc gia hạn gói tại quầy.</p>
      </div>

      <Alert type="info">Chưa có tra cứu theo tên/SĐT — hệ thống backend chỉ hỗ trợ tra theo mã hội viên (Member ID).</Alert>

      <form onSubmit={onSearch} className="flex gap-3">
        <input className={`${inputCls} !w-48`} type="number" min={1} placeholder="Mã hội viên" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className={btnOutline} type="submit">
          <Icon name="search" className="text-lg" />
          Tra cứu
        </button>
      </form>

      {error && <Alert>{error}</Alert>}
      {lastPayment && (
        <Alert type="success">
          Đã tạo đơn thanh toán #{lastPayment.id} ({lastPayment.amount.toLocaleString('vi-VN')}đ). Đưa mã QR cho hội viên hoặc xác nhận khi nhận chuyển khoản.
        </Alert>
      )}

      {id && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
            <h2 className="font-headline-md text-headline-md">Gói của hội viên #{id}</h2>
            <button className={btnPrimary} onClick={() => setModal(true)}>
              <Icon name="sell" className="text-lg" />
              Bán / gia hạn gói
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
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
