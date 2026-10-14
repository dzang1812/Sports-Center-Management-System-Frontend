import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Badge, Icon, btnPrimary } from '../components/ui'
import { SUBSCRIPTION_STATUS_LABEL } from '../labels'

const STATUS_TONE = { Pending: 'amber', Active: 'green', Expired: 'slate', Cancelled: 'red' }

export default function MemberSubscriptionPage() {
  const [subs, setSubs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/me/subscriptions')
      .then(setSubs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
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

      <div className={`flex flex-col gap-3 ${loading ? 'opacity-50' : ''}`}>
        {subs.map((s) => (
          <div key={s.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{s.planName}</span>
                <Badge tone={STATUS_TONE[s.status]}>{SUBSCRIPTION_STATUS_LABEL[s.status]}</Badge>
              </div>
              <div className="text-secondary text-body-sm">
                {s.startDate} → {s.endDate}
                {s.remainingPtSessions > 0 && ` • Còn ${s.remainingPtSessions} buổi PT`}
              </div>
            </div>
          </div>
        ))}
        {!loading && !subs.length && <p className="text-secondary text-center py-10">Chưa có gói tập nào. Hãy xem bảng giá để đăng ký.</p>}
      </div>

      <Alert type="info">
        Lịch sử thanh toán chi tiết theo từng giao dịch hiện chỉ xem được ngay sau khi thanh toán (trang kết quả thanh toán) — hệ thống backend chưa có API
        liệt kê toàn bộ hoá đơn theo hội viên.
      </Alert>
    </div>
  )
}
