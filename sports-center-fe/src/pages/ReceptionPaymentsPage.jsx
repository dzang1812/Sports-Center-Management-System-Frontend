import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Badge, Icon, btnPrimary } from '../components/ui'
import { PAYMENT_METHOD_LABEL } from '../labels'

// Cash/Card orders a Receptionist started at the desk (via "Bán gói") and must confirm once the
// member actually hands over the money — GET /payments/pending + POST /payments/{id}/confirm-at-counter.
export default function ReceptionPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setPayments(await api('/payments/pending'))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const confirm = async (p) => {
    setBusyId(p.id)
    setError('')
    setNotice('')
    try {
      await api(`/payments/${p.id}/confirm-at-counter`, { method: 'POST' })
      setNotice({ id: p.id, text: `Đã xác nhận thanh toán #${p.id} cho ${p.memberName}.` })
      load()
    } catch (err) {
      setError(err.message)
    }
    setBusyId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Xác nhận thanh toán tại quầy</h1>
          <p className="text-secondary">Các đơn tiền mặt/thẻ đã tạo nhưng chưa xác nhận đã nhận tiền.</p>
        </div>
        <Badge tone="amber">{payments.length} đơn đang chờ</Badge>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice.text} <Link className="underline font-semibold" to={`/invoice/${notice.id}`} target="_blank">In hoá đơn</Link></Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">#</th>
              <th className="px-4 py-3">Hội viên</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Phương thức</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Người tạo</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-surface-container">
                <td className="px-4 py-3 text-secondary">#{p.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{p.memberName}</div>
                  <div className="text-secondary text-body-sm">#{p.memberId}</div>
                </td>
                <td className="px-4 py-3 text-secondary">{p.planName ?? '—'}</td>
                <td className="px-4 py-3"><Badge tone="indigo">{PAYMENT_METHOD_LABEL[p.method] ?? p.method}</Badge></td>
                <td className="px-4 py-3 font-semibold">{p.amount.toLocaleString('vi-VN')}đ</td>
                <td className="px-4 py-3 text-secondary">{p.receivedByName ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button className={btnPrimary + ' !h-9'} disabled={busyId === p.id} onClick={() => confirm(p)}>
                    <Icon name="check_circle" className="text-base" />
                    {busyId === p.id ? 'Đang xác nhận…' : 'Đã nhận tiền'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !payments.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Không có đơn nào đang chờ xác nhận.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
