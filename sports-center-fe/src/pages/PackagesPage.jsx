import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { useNavigate } from 'react-router-dom'
import PublicShell from '../components/PublicShell'
import { PaymentPendingPanel } from '../components/payment'
import { Alert, Icon, Modal, btnOutline, btnPrimary } from '../components/ui'
import { PLAN_TYPE_LABEL } from '../labels'

const formatVnd = (n) => `${n.toLocaleString('vi-VN')}đ`

const CARD_BANNERS = ['/images/banner-home-1.jpg', '/images/banner-home-2.jpg', '/images/banner-home-3.jpg', '/images/banner-home-4.jpg']

export function SubscribeModal({ plan, onClose }) {
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const active = useRef(false)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const close = () => { if (!pending.current) onClose() }

  const subscribe = async () => {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const result = await api('/subscriptions', { method: 'POST', body: { planId: plan.id, memberId: null } })
      if (active.current) setPayment(result)
    } catch (err) {
      if (active.current) setError(err.message)
    }
    pending.current = false
    if (active.current) setBusy(false)
  }

  return (
    <Modal title={payment ? 'Quét mã để thanh toán' : `Đăng ký "${plan.name}"`} onClose={close}>
      {!payment ? (
        <div className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <p className="text-secondary">
            Bạn sẽ đăng ký gói <b>{plan.name}</b> — <b>{formatVnd(plan.price)}</b> / {plan.durationMonths > 0 ? `${plan.durationMonths} tháng` : `${plan.durationDays} ngày`}. Sau khi xác nhận, hệ thống sẽ tạo link
            thanh toán PayOS kèm mã QR.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnOutline} disabled={busy} onClick={close}>Huỷ</button>
            <button className={btnPrimary} disabled={busy} onClick={subscribe}>{busy ? 'Đang tạo đơn…' : 'Xác nhận đăng ký'}</button>
          </div>
        </div>
      ) : (
        <PaymentPendingPanel payment={payment} />
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
    if (plan.ptSessionCredits > 0 && !plan.includesClasses && !plan.includesGymAccess) return navigate('/member/classes?type=pt')
    setModalPlan(plan)
  }

  return (
    <PublicShell banner="/images/banner-packages.jpg" bannerMobile="/images/banner-packages-m.jpg" eyebrow="Bảng giá" title="Chọn gói tập phù hợp với bạn" subtitle="Đăng ký trực tuyến và thanh toán qua QR trong vài giây — nâng cấp hoặc đổi gói bất cứ lúc nào.">
      <div className="flex flex-col gap-10">
        {error && <Alert>{error}</Alert>}

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${loading ? 'opacity-50' : ''}`}>
          {plans.map((p, i) => (
            <div key={p.id} className="relative rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden aspect-[3/4] group">
              <img src={p.imageUrl || CARD_BANNERS[i % CARD_BANNERS.length]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/75 to-inverse-surface/20" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">
                {PLAN_TYPE_LABEL[p.planType] ?? p.planType}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-headline-md text-headline-md mb-1">{p.name}</h3>
                <p className="text-body-sm text-white/80">{p.sportName ?? 'Áp dụng mọi bộ môn'}</p>
                {p.description && <p className="text-body-sm text-white/80 mt-1">{p.description}</p>}
                <div className="mb-3 mt-3">
                  <span className="font-display-lg text-display-lg">{formatVnd(p.price)}</span>
                  <span className="text-body-sm text-white/80"> / {p.durationDays} ngày</span>
                </div>
                <ul className="space-y-1.5 text-body-sm text-white/90 mb-4">
                  {p.includesClasses && (
                    <li className="flex items-center gap-2"><Icon name="check_circle" className="text-sm text-tertiary-fixed" />Tham gia lớp học nhóm</li>
                  )}
                  {p.ptSessionCredits > 0 && (
                    <li className="flex items-center gap-2"><Icon name="check_circle" className="text-sm text-tertiary-fixed" />{p.ptSessionCredits} buổi PT 1:1</li>
                  )}
                  {!p.includesClasses && !p.ptSessionCredits && (
                    <li className="flex items-center gap-2"><Icon name="check_circle" className="text-sm text-tertiary-fixed" />Sử dụng tiện ích phòng tập</li>
                  )}
                </ul>
                <button className="w-full py-2.5 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:opacity-90 transition-opacity" onClick={() => onPick(p)}>
                  Đăng ký gói này
                </button>
              </div>
            </div>
          ))}
          {!loading && !plans.length && <p className="text-secondary col-span-full text-center py-10">Hiện chưa có gói tập nào đang mở bán.</p>}
        </div>
      </div>

      {modalPlan && <SubscribeModal plan={modalPlan} onClose={() => setModalPlan(null)} />}
    </PublicShell>
  )
}
