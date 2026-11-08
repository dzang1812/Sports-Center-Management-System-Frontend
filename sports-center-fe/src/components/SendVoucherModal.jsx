import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Field, Modal, btnOutline, btnPrimary, inputCls } from './ui'
import { formatTimestamp } from '../dateUtils'
import { discountText } from '../pages/ManagerVouchersPage'

// Receptionist/manager: send one active voucher to this member (POST /vouchers/{id}/grants); the member is notified.
export default function SendVoucherModal({ memberId, memberName, onClose, onSent }) {
  const [vouchers, setVouchers] = useState(null)
  const [sentIds, setSentIds] = useState(new Set())
  const [voucherId, setVoucherId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/vouchers'), api(`/members/${memberId}/vouchers`)])
      .then(([all, mine]) => {
        setVouchers(all.filter(v => v.isActive && new Date(v.endsAt) > Date.now() && !(v.usageLimit && v.usedCount >= v.usageLimit)))
        setSentIds(new Set(mine.filter(x => x.grantedAt).map(x => x.voucher.id)))
      })
      .catch(err => { setError(err.message); setVouchers([]) })
  }, [memberId])

  const selected = vouchers?.find(v => v.id === Number(voucherId))
  const send = async () => {
    setBusy(true); setError('')
    try { await api(`/vouchers/${voucherId}/grants`, { method: 'POST', body: { memberId: Number(memberId) } }); onSent(selected) }
    catch (err) { setError(err.message); setBusy(false) }
  }

  return (
    <Modal title="Gửi voucher cho hội viên" onClose={busy ? () => {} : onClose} footer={<>
      <button type="button" className={btnOutline} disabled={busy} onClick={onClose}>Hủy</button>
      <button type="button" className={btnPrimary} disabled={busy || !selected} onClick={send}>{busy ? 'Đang gửi…' : 'Gửi voucher'}</button>
    </>}>
      <div className="space-y-3">
        <p className="text-body-sm text-secondary">Voucher sẽ được lưu vào mục <b>Ưu đãi</b> của <b>{memberName ?? `hội viên #${memberId}`}</b> và hội viên nhận được thông báo.</p>
        {!vouchers && <p role="status" className="text-secondary">Đang tải voucher…</p>}
        {vouchers && !vouchers.length && !error && <p className="text-secondary">Chưa có voucher nào đang áp dụng. Quản lý cần tạo voucher trước.</p>}
        {vouchers?.length > 0 && <Field label="Chọn voucher">
          <select className={inputCls} value={voucherId} onChange={e => setVoucherId(e.target.value)}>
            <option value="">— Chọn voucher —</option>
            {vouchers.map(v => <option key={v.id} value={v.id} disabled={sentIds.has(v.id)}>{v.code} · {discountText(v)}{sentIds.has(v.id) ? ' (đã gửi)' : ''}</option>)}
          </select>
        </Field>}
        {selected && <div className="rounded-lg bg-surface-container p-3 text-body-sm space-y-1">
          <p className="font-semibold">{discountText(selected)}</p>
          {selected.description && <p className="text-secondary">{selected.description}</p>}
          <p className="text-secondary">Hạn dùng: {formatTimestamp(selected.endsAt)} · {selected.perMemberLimit} lượt/hội viên</p>
        </div>}
        {error && <Alert>{error}</Alert>}
      </div>
    </Modal>
  )
}
