import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { businessDateTimeInput, businessDateTimeToUtc, formatTimestamp } from '../dateUtils'
import { TIER_NAME } from '../components/MemberTier'
import { useClientPaged } from '../usePaged'

export const KIND_NAME = { Course: 'Khóa học', PtSingle: 'PT buổi lẻ', PtPackage: 'Gói PT', Membership: 'Gói tự tập' }
const vnd = (n) => `${Number(n ?? 0).toLocaleString('vi-VN')}đ`
export const discountText = (v) => v.discountType === 'Percent'
  ? `Giảm ${v.discountValue}%${v.maxDiscount ? ` (tối đa ${vnd(v.maxDiscount)})` : ''}` : `Giảm ${vnd(v.discountValue)}`

function status(v) {
  const now = Date.now()
  if (!v.isActive) return ['Đã tắt', 'slate']
  if (new Date(v.startsAt) > now) return ['Sắp diễn ra', 'amber']
  if (new Date(v.endsAt) <= now) return ['Hết hạn', 'red']
  if (v.usageLimit && v.usedCount >= v.usageLimit) return ['Hết lượt', 'red']
  return ['Đang áp dụng', 'green']
}

// Manager: create, edit and switch off vouchers (GET/POST/PUT /vouchers).
export default function ManagerVouchersPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // {} = new
  useEffect(() => { api('/vouchers').then(setItems).catch(err => { setError(err.message); setItems([]) }) }, [])
  const { pageItems, pagination } = useClientPaged(items)
  const saved = v => { setItems(list => list.some(x => x.id === v.id) ? list.map(x => x.id === v.id ? v : x) : [v, ...list]); setEditing(null) }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Voucher</h1>
          <p className="text-secondary mt-2">Mã giảm giá cho khóa học, PT và gói tập thanh toán bằng số dư. Có thể giới hạn theo hạng hội viên. Lễ tân gửi voucher cho hội viên tại trang chi tiết hội viên.</p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => setEditing({})}><Icon name="add" className="text-lg" />Tạo voucher</button>
      </div>
      {error && <Alert>{error}</Alert>}
      {!items && <p role="status" className="py-10 text-center text-secondary">Đang tải…</p>}
      {items && !items.length && <p className="rounded-2xl border border-outline-variant/50 bg-white p-8 text-center text-secondary">Chưa có voucher nào.</p>}
      {items?.length > 0 && <div className="overflow-x-auto rounded-2xl border border-outline-variant/50 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-body-sm">
          <thead className="bg-slate-50 text-left text-secondary"><tr>
            <th className="p-3">Mã</th><th className="p-3">Ưu đãi</th><th className="p-3">Điều kiện</th><th className="p-3">Thời gian</th><th className="p-3 text-right">Đã dùng</th><th className="p-3">Trạng thái</th><th className="p-3" />
          </tr></thead>
          <tbody>{pageItems.map(v => {
            const [label, tone] = status(v)
            return <tr key={v.id} className="border-t border-slate-100 align-top">
              <td className="p-3"><p className="font-mono font-bold">{v.code}</p>{v.description && <p className="mt-1 text-xs text-secondary">{v.description}</p>}</td>
              <td className="p-3">{discountText(v)}</td>
              <td className="p-3 text-xs text-secondary space-y-0.5">
                <p>{v.appliesTo ? KIND_NAME[v.appliesTo] : 'Mọi giao dịch'}</p>
                {v.requiresGrant && <p className="font-semibold text-violet-700">Chỉ hội viên được tặng</p>}
                {v.minOrderAmount > 0 && <p>Đơn từ {vnd(v.minOrderAmount)}</p>}
                {v.minTier !== 'New' && <p>Hạng {TIER_NAME[v.minTier]} trở lên</p>}
                <p>{v.perMemberLimit} lượt/hội viên</p>
              </td>
              <td className="p-3 text-xs">{formatTimestamp(v.startsAt)}<br />→ {formatTimestamp(v.endsAt)}</td>
              <td className="p-3 text-right">{v.usedCount}{v.usageLimit ? ` / ${v.usageLimit}` : ''}</td>
              <td className="p-3"><Badge tone={tone}>{label}</Badge></td>
              <td className="p-3 text-right"><button type="button" className={btnOutline + ' !h-8 !text-xs'} onClick={() => setEditing(v)}>Sửa</button></td>
            </tr>
          })}</tbody>
        </table>
      </div>}
      {pagination}
      {editing && <VoucherForm voucher={editing} onClose={() => setEditing(null)} onSaved={saved} />}
    </div>
  )
}

function VoucherForm({ voucher, onClose, onSaved }) {
  const isNew = !voucher.id
  const now = Date.now()
  const [f, setF] = useState(() => ({
    code: voucher.code ?? '', description: voucher.description ?? '', discountType: voucher.discountType ?? 'Percent',
    discountValue: voucher.discountValue ?? '', maxDiscount: voucher.maxDiscount ?? '', minOrderAmount: voucher.minOrderAmount ?? 0,
    appliesTo: voucher.appliesTo ?? '', minTier: voucher.minTier ?? 'New',
    startsAt: businessDateTimeInput(voucher.startsAt ?? now), endsAt: businessDateTimeInput(voucher.endsAt ?? now + 30 * 86400000),
    usageLimit: voucher.usageLimit ?? '', perMemberLimit: voucher.perMemberLimit ?? 1, isActive: voucher.isActive ?? true, requiresGrant: voucher.requiresGrant ?? false,
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const num = (v) => v === '' || v == null ? null : Number(v)
  const submit = async () => {
    setBusy(true); setError('')
    try {
      const body = { ...f, discountValue: num(f.discountValue), maxDiscount: f.discountType === 'Percent' ? num(f.maxDiscount) : null,
        minOrderAmount: num(f.minOrderAmount) ?? 0, appliesTo: f.appliesTo || null, usageLimit: num(f.usageLimit), perMemberLimit: num(f.perMemberLimit),
        startsAt: businessDateTimeToUtc(f.startsAt), endsAt: businessDateTimeToUtc(f.endsAt) }
      onSaved(await api(isNew ? '/vouchers' : `/vouchers/${voucher.id}`, { method: isNew ? 'POST' : 'PUT', body }))
    } catch (err) { setError(err.message); setBusy(false) }
  }
  return (
    <Modal title={isNew ? 'Tạo voucher' : `Sửa voucher ${voucher.code}`} onClose={busy ? () => {} : onClose} footer={<>
      <button type="button" className={btnOutline} disabled={busy} onClick={onClose}>Hủy</button>
      <button type="button" className={btnPrimary} disabled={busy} onClick={submit}>{busy ? 'Đang lưu…' : 'Lưu voucher'}</button>
    </>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Mã voucher" hint={voucher.usedCount ? 'Đã có người dùng, không đổi được mã.' : 'Chữ, số, - hoặc _; tự viết hoa.'}>
          <input className={inputCls + ' uppercase font-mono'} maxLength={30} value={f.code} disabled={voucher.usedCount > 0} onChange={set('code')} />
        </Field>
        <Field label="Mô tả"><input className={inputCls} maxLength={300} value={f.description} onChange={set('description')} placeholder="Ví dụ: Ưu đãi tháng 11" /></Field>
        <Field label="Kiểu giảm">
          <select className={inputCls} value={f.discountType} onChange={set('discountType')}><option value="Percent">Theo phần trăm</option><option value="Amount">Số tiền cố định</option></select>
        </Field>
        <Field label={f.discountType === 'Percent' ? 'Phần trăm giảm (1–100)' : 'Số tiền giảm (đ)'}>
          <input type="number" min={1} max={f.discountType === 'Percent' ? 100 : undefined} className={inputCls} value={f.discountValue} onChange={set('discountValue')} />
        </Field>
        {f.discountType === 'Percent' && <Field label="Giảm tối đa (đ, để trống = không giới hạn)"><input type="number" min={1} className={inputCls} value={f.maxDiscount} onChange={set('maxDiscount')} /></Field>}
        <Field label="Giá trị đơn tối thiểu (đ)"><input type="number" min={0} className={inputCls} value={f.minOrderAmount} onChange={set('minOrderAmount')} /></Field>
        <Field label="Áp dụng cho">
          <select className={inputCls} value={f.appliesTo} onChange={set('appliesTo')}><option value="">Mọi giao dịch</option>{Object.entries(KIND_NAME).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
        </Field>
        <Field label="Hạng tối thiểu">
          <select className={inputCls} value={f.minTier} onChange={set('minTier')}>{Object.entries(TIER_NAME).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
        </Field>
        <Field label="Bắt đầu"><input type="datetime-local" className={inputCls} value={f.startsAt} onChange={set('startsAt')} /></Field>
        <Field label="Kết thúc"><input type="datetime-local" className={inputCls} value={f.endsAt} onChange={set('endsAt')} /></Field>
        <Field label="Tổng lượt dùng (để trống = không giới hạn)"><input type="number" min={1} className={inputCls} value={f.usageLimit} onChange={set('usageLimit')} /></Field>
        <Field label="Số lượt mỗi hội viên"><input type="number" min={1} className={inputCls} value={f.perMemberLimit} onChange={set('perMemberLimit')} /></Field>
        <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} />Đang bật (bỏ chọn để tạm ngừng voucher)</label>
        <label className="flex items-start gap-2 sm:col-span-2"><input type="checkbox" className="mt-1" checked={f.requiresGrant} onChange={set('requiresGrant')} /><span>Chỉ dành cho hội viên được tặng<span className="block text-xs text-secondary">Lễ tân gửi voucher cho từng hội viên; người khác không dùng được mã này.</span></span></label>
      </div>
      {error && <Alert className="mt-3">{error}</Alert>}
    </Modal>
  )
}
