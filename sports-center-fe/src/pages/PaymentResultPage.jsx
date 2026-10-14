import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Alert, Icon, btnOutline, btnPrimary } from '../components/ui'
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from '../labels'

const STATUS_VISUAL = {
  Pending: { icon: 'hourglass_top', tone: 'warning', title: 'Đang chờ xác nhận thanh toán' },
  Paid: { icon: 'check_circle', tone: 'success', title: 'Thanh toán thành công' },
  Failed: { icon: 'cancel', tone: 'error', title: 'Thanh toán thất bại' },
  Refunded: { icon: 'undo', tone: 'info', title: 'Đã hoàn tiền' },
}

// Mounted at /payment/success, /payment/cancel (the two URLs PayOS actually redirects to —
// hardcoded in SubscriptionService.CreatePayOsLinkAsync) and /checkout/result as an alias.
// Polls GET /api/payments/{id} a few times while Pending, since the PayOS webhook that flips
// it to Paid/Failed can land a second or two after the browser redirect back.
export default function PaymentResultPage() {
  const { auth } = useAuth()
  const [params] = useSearchParams()
  const paymentId = params.get('paymentId')
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const [tries, setTries] = useState(0)

  const load = useCallback(async () => {
    if (!paymentId) return
    try {
      setPayment(await api(`/payments/${paymentId}`))
    } catch (err) {
      setError(err.message)
    }
  }, [paymentId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (payment?.status !== 'Pending' || tries >= 5) return
    const t = setTimeout(() => {
      load()
      setTries((n) => n + 1)
    }, 3000)
    return () => clearTimeout(t)
  }, [payment, tries, load])

  if (!paymentId) {
    return (
      <div className="max-w-xl mx-auto py-16">
        <Alert>Thiếu mã giao dịch (paymentId) trên đường dẫn.</Alert>
      </div>
    )
  }

  const visual = payment && STATUS_VISUAL[payment.status]

  return (
    <div className="max-w-xl mx-auto py-16 flex flex-col items-center text-center gap-5">
      {error && <Alert>{error}</Alert>}
      {!payment && !error && <p className="text-secondary">Đang tải thông tin giao dịch…</p>}

      {payment && (
        <>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${payment.status === 'Paid' ? 'bg-green-100 text-green-700' : payment.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            <Icon name={visual.icon} className="text-4xl" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{visual.title}</h1>
          {payment.status === 'Pending' && <p className="text-secondary">Hệ thống sẽ tự cập nhật khi nhận được xác nhận từ ngân hàng (thường trong vài giây).</p>}

          <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-5 text-left flex flex-col gap-2">
            <Row label="Gói tập" value={payment.planName ?? '—'} />
            <Row label="Số tiền" value={`${payment.amount.toLocaleString('vi-VN')}đ`} />
            <Row label="Trạng thái" value={PAYMENT_STATUS_LABEL[payment.status]} />
            <Row label="Phương thức" value={PAYMENT_METHOD_LABEL[payment.method]} />
            {payment.invoiceNumber && <Row label="Số hoá đơn" value={payment.invoiceNumber} />}
          </div>

          <div className="flex gap-3">
            {auth?.role === 'Member' && <Link to="/member/subscription" className={btnPrimary}>Xem gói của tôi</Link>}
            <Link to="/" className={btnOutline}>Về trang chủ</Link>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-surface-container py-1.5 last:border-0">
      <span className="text-secondary">{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  )
}
