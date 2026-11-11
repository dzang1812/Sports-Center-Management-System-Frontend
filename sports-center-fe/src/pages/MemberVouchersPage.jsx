import { useEffect, useState } from 'react'
import { api } from '../api'
import { Badge, Icon, btnOutline } from '../components/ui'
import { formatTimestamp } from '../dateUtils'
import { TIER_NAME } from '../components/MemberTier'
import { KIND_NAME, discountText } from './ManagerVouchersPage'

const vnd = (n) => `${Number(n ?? 0).toLocaleString('vi-VN')}đ`

function state(item) {
  const v = item.voucher
  if (item.usable) return null
  if (item.remainingForMe === 0) return 'Đã dùng'
  if (new Date(v.endsAt) <= Date.now()) return 'Hết hạn'
  if (new Date(v.startsAt) > Date.now()) return 'Chưa đến ngày dùng'
  return 'Không còn áp dụng'
}

// Member voucher wallet (GET /me/vouchers): vouchers sent to me by staff, then public ones I can use now.
// The code is entered at checkout.
export default function MemberVouchersPage({ embedded = false }) {
  const Heading = embedded ? 'h2' : 'h1'
  const [items, setItems] = useState(null)
  const [copied, setCopied] = useState('')
  useEffect(() => { api('/me/vouchers').then(setItems).catch(() => setItems([])) }, [])
  const copy = async (code) => { try { await navigator.clipboard.writeText(code); setCopied(code) } catch { setCopied('') } }
  const gifted = items?.filter(x => x.grantedAt) ?? []
  const common = items?.filter(x => !x.grantedAt) ?? []

  const card = (item) => {
    const v = item.voucher
    const off = state(item)
    return <li key={v.id} className={`flex overflow-hidden rounded-xl border bg-white shadow-sm ${off ? 'border-slate-200 opacity-60' : 'border-violet-200'}`}>
      <div className={`flex w-24 shrink-0 flex-col items-center justify-center p-2 text-center text-white bg-gradient-to-b ${off ? 'from-slate-400 to-slate-600' : 'from-violet-600 to-indigo-700'}`}>
        <Icon name={item.grantedAt ? 'redeem' : 'confirmation_number'} className="text-3xl" />
        <span className="mt-1 text-sm font-bold leading-tight">{v.discountType === 'Percent' ? `-${v.discountValue}%` : `-${Math.round(v.discountValue / 1000)}k`}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1 p-3 text-body-sm">
        <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{discountText(v)}</p>{off && <Badge tone="slate">{off}</Badge>}</div>
        {v.description && <p className="text-secondary">{v.description}</p>}
        <p className="text-xs text-secondary">{v.appliesTo ? KIND_NAME[v.appliesTo] : 'Mọi giao dịch'}{v.minOrderAmount > 0 ? ` · đơn từ ${vnd(v.minOrderAmount)}` : ''}{!item.grantedAt && v.minTier !== 'New' ? ` · hạng ${TIER_NAME[v.minTier]}+` : ''}</p>
        <p className="text-xs text-secondary">HSD: {formatTimestamp(v.endsAt)}{!off && ` · còn ${item.remainingForMe} lượt`}</p>
        {item.grantedAt && <p className="text-xs text-secondary">Được tặng {formatTimestamp(item.grantedAt)}{item.grantedBy ? ` bởi ${item.grantedBy}` : ''}</p>}
        <div className="flex items-center gap-2 pt-1">
          <span className="rounded-md border border-dashed border-violet-300 bg-violet-50 px-2 py-1 font-mono font-bold text-violet-700">{v.code}</span>
          {!off && <button type="button" className={btnOutline + ' !h-8 !text-xs'} onClick={() => copy(v.code)}>{copied === v.code ? 'Đã sao chép' : 'Sao chép'}</button>}
        </div>
      </div>
    </li>
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      <div>
        <Heading className={embedded ? 'text-lg font-bold' : 'font-headline-xl text-headline-xl'}>Ưu đãi của tôi</Heading>
        <p className="text-secondary mt-2">Nhập mã ở bước xác nhận thanh toán khi mua khóa học, PT hoặc gói tập bằng số dư.</p>
      </div>
      {!items && <p role="status" className="py-10 text-center text-secondary">Đang tải…</p>}
      {items && <>
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm"><Icon name="redeem" className="text-violet-600" />Voucher được tặng ({gifted.length})</h2>
          {gifted.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{gifted.map(card)}</ul>
            : <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-body-sm text-secondary">Bạn chưa được tặng voucher nào.</p>}
        </section>
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm"><Icon name="confirmation_number" className="text-violet-600" />Voucher dành cho bạn ({common.length})</h2>
          {common.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{common.map(card)}</ul>
            : <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-body-sm text-secondary">Hiện chưa có voucher chung nào. Lên hạng để mở thêm ưu đãi!</p>}
        </section>
      </>}
    </div>
  )
}
