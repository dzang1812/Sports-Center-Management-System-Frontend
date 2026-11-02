import { useEffect, useState } from 'react'
import { api, query } from '../api'
import { formatTimestamp } from '../dateUtils'
import { Alert, Badge, Icon, Pagination, btnOutline, inputCls } from './ui'

const vnd = value => `${Number(value).toLocaleString('vi-VN')}đ`
const methodLabel = { Cash: 'Tiền mặt', BankTransfer: 'Chuyển khoản', Card: 'Thẻ' }

export default function ManagerWalletReceipts({ range, refresh }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ search: '', page: 1, pageSize: 20 })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const valid = range.from && range.to && range.from <= range.to
    void Promise.resolve().then(async () => {
      if (controller.signal.aborted) return
      setLoading(true); setError(''); setReport(null)
      if (!valid) { setError('Vui lòng chọn khoảng ngày hợp lệ.'); setLoading(false); return }
      try {
        const result = await api(`/reports/wallet-receipts${query({ ...range, ...filter })}`, { signal: controller.signal })
        if (!controller.signal.aborted) setReport(result)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.status === 404
          ? 'Backend đang chạy chưa có báo cáo biên nhận. Cần cập nhật Backend để dùng mục này.' : err.message)
      } finally { if (!controller.signal.aborted) setLoading(false) }
    })
    return () => controller.abort()
  }, [range, filter, refresh])
  return <section className="space-y-4">
    <div className="rounded-xl bg-surface-container p-4 text-body-sm text-secondary">
      Tiền nạp ví được theo dõi riêng. Doanh thu được ghi khi hội viên mua khóa học hoặc PT, tránh cộng hai lần.
    </div>
    <form className="flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); setFilter({ ...filter, search: search.trim(), page: 1 }) }}>
      <input className={inputCls + ' !w-full sm:!w-96'} aria-label="Tìm biên nhận" placeholder="Mã biên nhận, hội viên hoặc người thu…" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} />
      <button type="submit" className={btnOutline}><Icon name="search" />Tìm biên nhận</button>
    </form>
    {error && <Alert>{error}</Alert>}
    {loading && <p role="status" className="text-body-sm text-secondary">Đang tải biên nhận…</p>}
    {report && <>
      <div className="grid sm:grid-cols-3 gap-3">
        {[[`Tổng tiền nạp · ${report.total} biên nhận`, report.totalAmount], ['Tiền mặt', report.cashAmount], ['Chuyển khoản', report.bankTransferAmount]].map(([label, amount]) =>
          <div key={label} className="rounded-xl bg-white p-4 border border-outline-variant/40"><p className="text-body-sm text-secondary">{label}</p><p className="text-headline-md font-semibold mt-1">{vnd(amount)}</p></div>)}
      </div>
      <div className="rounded-xl border border-outline-variant/40 overflow-hidden bg-white">
        <div className="overflow-x-auto"><table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-secondary"><tr>{['Biên nhận', 'Hội viên', 'Số tiền', 'Hình thức', 'Thời gian', 'Người thu'].map(label => <th key={label} className="px-4 py-3 font-semibold whitespace-nowrap">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-outline-variant/30">{report.items.map(receipt => <tr key={receipt.paymentId}>
            <td className="px-4 py-4 font-semibold whitespace-nowrap">{receipt.invoiceNumber ?? `Giao dịch #${receipt.paymentId}`}</td>
            <td className="px-4 py-4"><b>{receipt.memberName}</b><p className="text-secondary">Hội viên #{receipt.memberId}</p></td>
            <td className="px-4 py-4 font-semibold whitespace-nowrap">{vnd(receipt.amount)}</td>
            <td className="px-4 py-4 whitespace-nowrap"><Badge tone={receipt.method === 'Cash' ? 'green' : 'blue'}>{methodLabel[receipt.method] ?? receipt.method}</Badge></td>
            <td className="px-4 py-4 whitespace-nowrap">{formatTimestamp(receipt.paidAt)}</td>
            <td className="px-4 py-4">{receipt.receivedByName ?? (receipt.receivedById ? `Nhân viên #${receipt.receivedById}` : 'Hội viên nạp online')}</td>
          </tr>)}{!report.items.length && <tr><td colSpan={6} className="p-8 text-center text-secondary">Không có biên nhận trong khoảng thời gian này.</td></tr>}</tbody>
        </table></div>
        <Pagination page={report.page} pageSize={report.pageSize} total={report.total} onPage={page => setFilter({ ...filter, page })} onPageSize={pageSize => setFilter({ ...filter, pageSize, page: 1 })} />
      </div>
    </>}
  </section>
}
