import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Badge, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { PAYMENT_METHOD_LABEL } from '../labels'

// Cash/Card orders a Receptionist started at the desk (via "Bán gói") and must confirm once the
// member actually hands over the money — GET /payments/pending + POST /payments/{id}/confirm-at-counter.
export default function ReceptionPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState('')
  const [selected, setSelected] = useState(null)
  const pending = useRef(false)
  const active = useRef(true)
  const request = useRef(null)

  const load = useCallback(async () => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await api('/payments/pending', { signal: controller.signal })
      if (!controller.signal.aborted) setPayments(result)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }, [])

  useEffect(() => {
    active.current = true
    void Promise.resolve().then(() => { if (active.current) load() })
    return () => { active.current = false; request.current?.abort() }
  }, [load])

  const confirm = async (p) => {
    if (pending.current) return
    pending.current = true
    setBusyId(p.id)
    setError('')
    setNotice('')
    try {
      await api(`/payments/${p.id}/confirm-at-counter`, { method: 'POST' })
      if (active.current) { setSelected(null); setNotice(`Đã xác nhận thanh toán #${p.id} cho ${p.memberName}.`); load() }
    } catch (err) {
      if (active.current) setError(err.message)
    }
    pending.current = false
    if (active.current) setBusyId(null)
  }
  const close = () => { if (!pending.current) setSelected(null) }
  const filtered = payments.filter(payment => (!method || payment.method === method) && `${payment.id} ${payment.memberId} ${payment.memberName} ${payment.planName ?? ''}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')))
  const description = payment => payment.planName ?? (payment.purpose === 'WalletTopUp' ? 'Nạp số dư' : 'Thanh toán tại quầy')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Thanh toán tại quầy</h1>
          <p className="text-secondary mt-2">Kiểm tra đơn đang chờ và xác nhận sau khi đã nhận đủ tiền.</p>
        </div>
        <div className="flex items-center gap-3"><Badge tone="amber">{payments.length} đơn đang chờ</Badge><button type="button" className={btnOutline} disabled={loading || busyId != null} onClick={load}><Icon name="refresh" className="text-lg" />Làm mới</button></div>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}
      <div className="grid sm:grid-cols-[1fr_220px] gap-3"><input aria-label="Tìm đơn thanh toán" className={inputCls} placeholder="Tìm mã đơn, tên hoặc mã hội viên…" value={search} onChange={event => setSearch(event.target.value)} /><select aria-label="Phương thức thanh toán" className={inputCls} value={method} onChange={event => setMethod(event.target.value)}><option value="">Tất cả phương thức</option>{[...new Set(payments.map(payment => payment.method))].map(value => <option key={value} value={value}>{PAYMENT_METHOD_LABEL[value] ?? value}</option>)}</select></div>

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3 w-14">#</th>
              <th className="px-4 py-3">Hội viên</th>
              <th className="px-4 py-3">Nội dung</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-surface-container">
                <td className="px-4 py-3 text-secondary">#{p.id}</td>
                <td className="px-4 py-3">
                  <Link className="font-semibold text-primary hover:underline" to={`/reception/members/${p.memberId}`}>{p.memberName}</Link>
                  <div className="text-secondary text-body-sm">#{p.memberId}</div>
                </td>
                <td className="px-4 py-3 text-secondary">{description(p)}</td>
                <td className="px-4 py-3"><b className="block mb-1">{p.amount.toLocaleString('vi-VN')}đ</b><Badge tone="indigo">{PAYMENT_METHOD_LABEL[p.method] ?? p.method}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button className={btnPrimary + ' !h-9'} disabled={loading || busyId != null} onClick={() => { setError(''); setSelected(p) }}>
                    <Icon name="check_circle" className="text-base" />
                    {busyId === p.id ? 'Đang xác nhận…' : 'Kiểm tra & xác nhận'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !filtered.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-secondary">{payments.length ? 'Không có đơn khớp bộ lọc.' : 'Không có đơn nào đang chờ xác nhận.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && <Modal title="Xác nhận đã nhận tiền" onClose={close} footer={<><button type="button" className={btnOutline} disabled={busyId != null} onClick={close}>Quay lại</button><button type="button" className={btnPrimary} disabled={busyId != null} onClick={() => confirm(selected)}>{busyId != null ? 'Đang xác nhận…' : 'Xác nhận đã nhận đủ tiền'}</button></>}>
        <div className="space-y-4"><p>Đơn #{selected.id} · <b>{selected.memberName}</b> · Hội viên #{selected.memberId}</p><p>{description(selected)}</p><div className="rounded-xl bg-surface-container p-4"><p className="text-body-sm text-secondary">Số tiền cần nhận</p><b className="text-headline-lg">{selected.amount.toLocaleString('vi-VN')}đ</b><p className="text-body-sm mt-1">{PAYMENT_METHOD_LABEL[selected.method] ?? selected.method}</p></div><p className="text-body-sm text-secondary">Người tạo: {selected.receivedByName ?? '—'}. Chỉ xác nhận khi đã nhận đủ số tiền của đúng hội viên.</p>{error && <Alert>{error}</Alert>}</div>
      </Modal>}
    </div>
  )
}
