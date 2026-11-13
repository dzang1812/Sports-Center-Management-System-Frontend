import { Fragment, useEffect, useState } from 'react'
import { api, query } from '../api'
import { formatTimestamp } from '../dateUtils'
import { ROLE_LABEL } from '../labels'
import { Alert, Badge, Icon, Pagination, btnOutline, inputCls } from './ui'

const vnd = (value) => `${Number(value).toLocaleString('vi-VN')}đ`
const signed = (value) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${vnd(Math.abs(value))}`

// Three groups the manager tracks: money into the wallet (top-ups), out of it (purchases), back into it (refunds).
const TYPE = {
  CashTopUp: { label: 'Nạp tiền mặt', tone: 'green' },
  OnlineTopUp: { label: 'Nạp online', tone: 'green' },
  Purchase: { label: 'Mua', tone: 'indigo' },
  Refund: { label: 'Hoàn tiền', tone: 'amber' },
}
const STATUS = { Paid: { label: 'Thành công', tone: 'green' }, Pending: { label: 'Đang chờ', tone: 'amber' }, Failed: { label: 'Thất bại', tone: 'red' } }
const METHOD = { Cash: 'Tiền mặt', BankTransfer: 'Chuyển khoản', Card: 'Thẻ', Wallet: 'Ví' }

// Refunds share the amber of "pending"; top-ups that never reached the wallet are struck through.
const amountCls = (item) =>
  item.status !== 'Paid' ? 'text-secondary line-through'
    : item.type === 'Refund' ? 'text-amber-700'
      : item.amount > 0 ? 'text-green-700' : 'text-on-surface'

const actorLabel = (item) => item.actorName ?? (item.type === 'OnlineTopUp' ? 'PayOS' : '—')
const roleLabel = (item) => (item.actorRole ? ROLE_LABEL[item.actorRole] ?? item.actorRole : item.actorName ? '' : 'Hệ thống')

function Detail({ item }) {
  const voucher = item.voucherCode
    ? `${item.voucherCode} · giảm ${vnd(item.discountAmount ?? 0)}${item.listPrice != null ? ` (giá gốc ${vnd(item.listPrice)})` : ''}`
    : 'Không dùng'
  const facts = [
    ['Phương thức', METHOD[item.method] ?? item.method],
    ['Trạng thái', STATUS[item.status]?.label ?? item.status],
    ['Mã tham chiếu', <code key="ref" className="text-[12px] break-all">{item.reference}</code>],
    ['Voucher', voucher],
    item.invoiceNumber && ['Hoá đơn', item.invoiceNumber],
    item.orderId && ['Đơn hàng', `#${item.orderId}`],
  ].filter(Boolean)
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3 text-body-sm">
      {facts.map(([label, value]) => <div key={label}><dt className="text-secondary">{label}</dt><dd>{value}</dd></div>)}
    </dl>
  )
}

// GET /reports/money-log: wallet top-ups, purchases paid from the wallet and refunds back to it (Manager).
export default function ManagerMoneyLog({ range, refresh }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ type: '', status: '', search: '', page: 1, pageSize: 20 })
  const [report, setReport] = useState(null)
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted) return
      setLoading(true); setError(''); setOpen(null)
      if (!range.from || !range.to || range.from > range.to) { setReport(null); setError('Vui lòng chọn khoảng ngày hợp lệ.'); setLoading(false); return }
      try {
        const result = await api(`/reports/money-log${query({ ...range, ...filter })}`, { signal: controller.signal })
        if (!controller.signal.aborted) setReport(result)
      } catch (err) {
        if (!controller.signal.aborted) {
          setReport(null)
          setError(err.status === 404 ? 'Backend đang chạy chưa có nhật ký dòng tiền. Cần cập nhật Backend để dùng mục này.' : err.message)
        }
      } finally { if (!controller.signal.aborted) setLoading(false) }
    })
    return () => controller.abort()
  }, [range, filter, refresh])

  const set = (patch) => setFilter((f) => ({ ...f, ...patch, page: 1 }))
  const s = report?.summary

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-body-sm text-secondary">Loại
          <select className={inputCls + ' !w-48'} value={filter.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">Tất cả</option>
            <optgroup label="Tiền vào ví"><option value="CashTopUp">Nạp tiền mặt</option><option value="OnlineTopUp">Nạp online</option></optgroup>
            <optgroup label="Tiền ra khỏi ví"><option value="Purchase">Mua dịch vụ</option></optgroup>
            <optgroup label="Hoàn tiền về ví"><option value="Refund">Hoàn tiền</option></optgroup>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-secondary">Trạng thái
          <select className={inputCls + ' !w-40'} value={filter.status} onChange={(e) => set({ status: e.target.value })}>
            <option value="">Tất cả</option>
            {Object.entries(STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); set({ search: search.trim() }) }}>
          <input className={inputCls + ' !w-full sm:!w-80'} aria-label="Tìm giao dịch" placeholder="Hội viên, người thực hiện, mã tham chiếu…" maxLength={100} value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className={btnOutline}><Icon name="search" />Tìm</button>
        </form>
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && <p role="status" className="text-body-sm text-secondary">Đang tải nhật ký…</p>}

      {s && <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${loading ? 'opacity-50' : ''}`}>
        {[
          ['Tiền vào ví', signed(s.topUpAmount), `${s.topUpCount} lần nạp thành công`, 'text-green-700'],
          ['Tiền ra khỏi ví', signed(-s.spentAmount), `${s.purchaseCount} đơn${s.discountAmount ? ` · giảm ${vnd(s.discountAmount)}` : ''}`, 'text-on-surface'],
          ['Hoàn về ví', signed(s.refundAmount), `${s.refundCount} khoản hoàn`, 'text-amber-700'],
          ['Nạp chờ / thất bại', `${s.pendingCount} / ${s.failedCount}`, 'Chưa vào ví', 'text-red-700'],
        ].map(([label, value, note, color]) => (
          <div key={label} className="rounded-xl bg-white p-4 border border-outline-variant/40">
            <p className="text-body-sm text-secondary">{label}</p>
            <p className={`text-headline-md font-semibold mt-1 ${color}`}>{value}</p>
            <p className="text-[12px] text-secondary">{note}</p>
          </div>
        ))}
      </div>}

      {report && <div className={`rounded-xl border border-outline-variant/40 overflow-hidden bg-white ${loading ? 'opacity-50' : ''}`}>
        <div className="overflow-x-auto"><table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-secondary"><tr>
            {['Thời gian', 'Loại', 'Hội viên · nội dung', 'Người thực hiện'].map((label) => <th key={label} className="px-4 py-3 font-semibold whitespace-nowrap">{label}</th>)}
            <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Số tiền</th>
            <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Số dư sau</th>
            <th className="w-10"><span className="sr-only">Chi tiết</span></th>
          </tr></thead>
          <tbody className="divide-y divide-outline-variant/30">
            {report.items.map((item) => {
              const key = `${item.source}:${item.sourceId}`
              const expanded = open === key
              const toggle = () => setOpen(expanded ? null : key)
              return <Fragment key={key}>
                <tr className="cursor-pointer hover:bg-surface-container-low" onClick={toggle}>
                  <td className="px-4 py-3 whitespace-nowrap text-secondary">{formatTimestamp(item.at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge tone={TYPE[item.type]?.tone}>{TYPE[item.type]?.label ?? item.type}</Badge>
                    {item.status !== 'Paid' && <div className={`text-[12px] mt-1 ${item.status === 'Failed' ? 'text-red-700' : 'text-amber-700'}`}>{STATUS[item.status]?.label ?? item.status}</div>}
                  </td>
                  <td className="px-4 py-3"><b>{item.memberName}</b> <span className="text-secondary">#{item.memberId}</span><p className="text-secondary">{item.description}</p></td>
                  <td className="px-4 py-3">{actorLabel(item)}<p className="text-[12px] text-secondary">{roleLabel(item)}</p></td>
                  <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${amountCls(item)}`}>{signed(item.amount)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-secondary">{item.balanceAfter == null ? '—' : vnd(item.balanceAfter)}</td>
                  <td className="pr-3 text-right">
                    <button type="button" aria-expanded={expanded} aria-label={expanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'} className="text-secondary"
                      onClick={(e) => { e.stopPropagation(); toggle() }}><Icon name={expanded ? 'expand_less' : 'expand_more'} /></button>
                  </td>
                </tr>
                {expanded && <tr className="bg-surface-container-low"><td colSpan={7} className="px-4 py-3"><Detail item={item} /></td></tr>}
              </Fragment>
            })}
            {!report.items.length && <tr><td colSpan={7} className="p-8 text-center text-secondary">Không có giao dịch trong khoảng thời gian này.</td></tr>}
          </tbody>
        </table></div>
        <Pagination page={report.page} pageSize={report.pageSize} total={report.total}
          onPage={(page) => setFilter((f) => ({ ...f, page }))} onPageSize={(pageSize) => setFilter((f) => ({ ...f, pageSize, page: 1 }))} />
      </div>}
    </section>
  )
}
