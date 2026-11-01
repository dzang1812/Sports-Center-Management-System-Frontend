import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { PaymentQrCode } from './payment'
import { Alert, Modal, btnOutline, btnPrimary } from './ui'

const vnd = amount => `${Number(amount).toLocaleString('vi-VN')}đ`

// The parent retains this intent (and its replay key) when the modal is closed or the page reloads.
export default function PtCounterCheckout({ intent, onClose, onAttempt, onPayment, onDone, onRelease }) {
  const [payment, setPayment] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [canRelease, setCanRelease] = useState(false)
  const pending = useRef(false)
  const alive = useRef(true)
  const revision = useRef(0)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])

  useEffect(() => {
    if (!intent.paymentId) return
    let stopped = false
    let timer
    const refresh = async () => {
      const current = ++revision.current
      try {
        const result = await api(`/payments/${intent.paymentId}`)
        if (!stopped && current === revision.current) {
          setPayment(result)
          if (result.status === 'Pending') timer = setTimeout(refresh, 3000)
        }
      } catch (err) {
        if (!stopped && current === revision.current) { setError(err.message); timer = setTimeout(refresh, 5000) }
      }
    }
    void refresh()
    return () => { stopped = true; clearTimeout(timer) }
  }, [intent.paymentId])

  const submit = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    onAttempt(true)
    try {
      const result = await api('/pt/counter-checkouts', { method: 'POST', body: intent.body, idempotencyKey: intent.key })
      if (alive.current) {
        if (result.booking) onDone(result.booking)
        else { revision.current++; setPayment(result.payment); onPayment(result.paymentId) }
      }
    } catch (err) {
      if (alive.current) {
        setError(err.message)
        if (intent.body.method === 'Cash' && [400, 409].includes(err.status) && err.errorCode !== 'IDEMPOTENCY_PAYLOAD_MISMATCH') onAttempt(false)
      }
    }
    finally { pending.current = false; if (alive.current) setBusy(false) }
  }
  const complete = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setCanRelease(false)
    try {
      const booking = await api(`/pt/counter-checkouts/${intent.paymentId}/complete`, { method: 'POST' })
      if (alive.current) onDone(booking)
    } catch (err) { if (alive.current) { setError(err.message); setCanRelease(err.status === 409 && err.errorCode !== 'IDEMPOTENCY_PAYLOAD_MISMATCH') } }
    finally { pending.current = false; if (alive.current) setBusy(false) }
  }
  const cash = intent.body.method === 'Cash'
  const footer = <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={btnOutline} disabled={busy} onClick={onClose}>{intent.paymentId ? 'Đóng — tiếp tục sau' : 'Quay lại'}</button>
        {!intent.paymentId && <button type="button" className={btnPrimary} disabled={busy} onClick={submit}>{busy ? 'Đang xử lý…' : cash ? 'Đã nhận tiền mặt — hoàn tất' : 'Tạo mã QR chuyển khoản'}</button>}
        {intent.paymentId && payment?.status === 'Pending' && !payment.qrCode && <button type="button" className={btnOutline} disabled={busy} onClick={submit}>Tải lại mã QR</button>}
        {intent.paymentId && payment && ['Pending', 'Paid'].includes(payment.status) && <button type="button" className={btnPrimary} disabled={busy} onClick={complete}>{busy ? 'Đang kiểm tra…' : 'Hoàn thành'}</button>}
        {payment && (payment.status === 'Failed' || payment.status === 'Paid' && canRelease) && <button type="button" className={btnOutline} disabled={busy} onClick={onRelease}>{payment.status === 'Paid' ? 'Đóng — dùng số dư để đặt lịch khác' : 'Đóng giao dịch thất bại'}</button>}
      </div>
  return <Modal title={cash ? 'Thu tiền mặt và đặt PT' : 'Chuyển khoản và đặt PT'} onClose={() => { if (!pending.current) onClose() }} footer={footer}>
    <div className="space-y-4">
      <p>{intent.description}</p>
      <p>Khách cần thanh toán: <b>{vnd(intent.body.expectedPrice)}</b></p>
      {cash ? <p className="text-secondary">Chỉ bấm xác nhận sau khi đã nhận đủ tiền mặt. Hệ thống ghi nhận thu tiền và tạo booking trong cùng một lần; không trừ số dư sẵn có hoặc credit của khách. Hủy đúng hạn được hoàn vào ví theo chính sách PT.</p>
        : <p className="text-secondary">Khách quét QR để chuyển khoản, sau đó thu ngân bấm Hoàn thành. Booking chỉ được tạo khi Backend đã nhận xác nhận thanh toán từ PayOS. QR không giữ chỗ; nếu lịch bị chiếm, tiền đã chuyển được giữ trong ví khách để đặt lại.</p>}
      {payment && <div className="flex flex-col items-center gap-3">
        <p>Giao dịch #{payment.id} — <b>{payment.status === 'Paid' ? 'Đã thanh toán' : payment.status === 'Pending' ? 'Chờ khách chuyển khoản' : 'Thanh toán thất bại / đã hủy'}</b></p>
        {payment.status === 'Pending' && payment.qrCode && <PaymentQrCode data={payment.qrCode} />}
        {payment.status === 'Pending' && payment.checkoutUrl && <a className={btnOutline} href={payment.checkoutUrl} target="_blank" rel="noreferrer">Mở trang thanh toán cho khách</a>}
        {payment.status === 'Paid' && <Alert type="success">Đã nhận thanh toán. Bấm Hoàn thành để xác nhận lịch PT.</Alert>}
      </div>}
      {intent.paymentId && !payment && <p className="text-secondary">Đang đọc trạng thái thanh toán…</p>}
      {error && <Alert>{error}</Alert>}

    </div>
  </Modal>
}
