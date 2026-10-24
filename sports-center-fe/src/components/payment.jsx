import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, btnOutline, btnPrimary } from './ui'

const formatVnd = (n) => `${n.toLocaleString('vi-VN')}đ`

// payment.qrCode from PayOS is the raw VietQR payload string, not an image — render it client-side.
export function PaymentQrCode({ data }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(data, { width: 224, margin: 1 }).then((url) => !cancelled && setSrc(url))
    return () => {
      cancelled = true
    }
  }, [data])
  return src ? (
    <img src={src} alt="QR thanh toán" className="w-56 h-56 object-contain rounded-lg border border-outline-variant" />
  ) : (
    <div className="w-56 h-56 rounded-lg border border-outline-variant bg-surface-container-low animate-pulse" />
  )
}

// The "scan to pay" view shown once a PayOS payment has been created — shared by the packages
// subscribe flow and the "pay again" retry flow for a cancelled subscription.
export function PaymentPendingPanel({ payment }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center gap-4">
      {payment.qrCode && <PaymentQrCode data={payment.qrCode} />}
      <p className="text-secondary text-center">
        Số tiền: <b>{formatVnd(payment.amount)}</b>
        <br />
        Quét mã QR bằng app ngân hàng, hoặc mở link thanh toán bên dưới. Trang sẽ tự cập nhật khi hệ thống nhận được xác nhận.
      </p>
      {payment.checkoutUrl && (
        <a href={payment.checkoutUrl} target="_blank" rel="noreferrer" className={btnOutline}>
          <Icon name="open_in_new" className="text-base" />
          Mở link thanh toán
        </a>
      )}
      <button className={btnPrimary} onClick={() => navigate(`/payment/success?paymentId=${payment.id}`)}>
        Tôi đã thanh toán — kiểm tra trạng thái
      </button>
    </div>
  )
}
