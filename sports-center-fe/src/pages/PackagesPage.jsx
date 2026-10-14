import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import PublicShell from '../components/PublicShell'
import { Alert, Icon, Modal, btnOutline, btnPrimary } from '../components/ui'

const formatVnd = (n) => `${n.toLocaleString('vi-VN')}đ`

function SubscribeModal({ plan, onClose }) {
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const subscribe = async () => {
    setBusy(true)
    setError('')
    try {
      setPayment(await api('/subscriptions', { method: 'POST', body: { planId: plan.id, memberId: null } }))
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <Modal title={payment ? 'Quét mã để thanh toán' : `Đăng ký "${plan.name}"`} onClose={onClose}>
      {!payment ? (
        <div className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <p className="text-secondary">
            Bạn sẽ đăng ký gói <b>{plan.name}</b> — <b>{formatVnd(plan.price)}</b> / {plan.durationDays} ngày. Sau khi xác nhận, hệ thống sẽ tạo link
            thanh toán PayOS kèm mã QR.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
            <button className={btnPrimary} disabled={busy} onClick={subscribe}>{busy ? 'Đang tạo đơn…' : 'Xác nhận đăng ký'}</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {payment.qrCode && (
            <img src={`data:image/png;base64,${payment.qrCode}`} alt="QR thanh toán" className="w-56 h-56 object-contain rounded-lg border border-outline-variant" />
          )}
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
      )}
    </Modal>
  )
}

export default function PackagesPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalPlan, setModalPlan] = useState(null)

  useEffect(() => {
    api('/membership-plans')
      .then(setPlans)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const onPick = (plan) => {
    if (!auth) return navigate('/login', { state: { from: { pathname: '/packages' } } })
    if (auth.role !== 'Member') return setError('Chỉ tài khoản hội viên mới tự đăng ký gói ở đây. Lễ tân vui lòng bán gói tại trang quản lý hội viên.')
    setError('')
    setModalPlan(plan)
  }

  return (
    <PublicShell>
      <div className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Bảng giá gói tập</h1>
          <p className="text-secondary mt-2">Chọn gói phù hợp, đăng ký trực tuyến và thanh toán qua QR trong vài giây.</p>
        </div>

        {error && <Alert>{error}</Alert>}

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? 'opacity-50' : ''}`}>
          {plans.map((p) => (
            <div key={p.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{p.name}</h3>
                {p.description && <p className="text-body-sm text-secondary mt-1">{p.description}</p>}
                <div className="my-5">
                  <span className="font-display-lg text-display-lg text-on-surface">{formatVnd(p.price)}</span>
                  <span className="text-body-sm text-on-surface-variant"> / {p.durationDays} ngày</span>
                </div>
                <ul className="space-y-2 text-body-sm text-on-surface-variant mb-6">
                  {p.includesClasses && (
                    <li className="flex items-start gap-2"><Icon name="check" className="text-sm text-primary mt-0.5" />Tham gia lớp học nhóm</li>
                  )}
                  {p.ptSessionCredits > 0 && (
                    <li className="flex items-start gap-2"><Icon name="check" className="text-sm text-primary mt-0.5" />{p.ptSessionCredits} buổi PT 1:1</li>
                  )}
                  {!p.includesClasses && !p.ptSessionCredits && (
                    <li className="flex items-start gap-2"><Icon name="check" className="text-sm text-primary mt-0.5" />Sử dụng tiện ích phòng tập</li>
                  )}
                </ul>
              </div>
              <button className={btnPrimary + ' w-full justify-center'} onClick={() => onPick(p)}>Đăng ký gói này</button>
            </div>
          ))}
          {!loading && !plans.length && <p className="text-secondary col-span-full text-center py-10">Hiện chưa có gói tập nào đang mở bán.</p>}
        </div>
      </div>

      {modalPlan && <SubscribeModal plan={modalPlan} onClose={() => setModalPlan(null)} />}
    </PublicShell>
  )
}
