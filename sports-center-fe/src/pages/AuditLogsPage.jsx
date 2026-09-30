import { useCallback, useEffect, useState } from 'react'
import { api, query } from '../api'
import { Alert, Badge, Pagination, inputCls } from '../components/ui'
import { AUDIT_ACTIONS } from '../labels'

const fmt = (iso) => new Date(iso).toLocaleString('vi-VN', { hour12: false })

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({ from: '', to: '', user: '', action: '' })
  const [user, setUser] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.user === user ? f : { ...f, user }))
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [user])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api(`/audit-logs${query({ ...filters, page, pageSize })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filters, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.value })
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-headline-xl text-headline-xl">Nhật ký thao tác</h1>
        <p className="text-secondary">Lịch sử các thao tác quan trọng, chỉ đọc.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input type="date" className={`${inputCls} !h-10 !w-auto`} value={filters.from} onChange={setFilter('from')} aria-label="Từ ngày" />
        <span className="text-secondary">→</span>
        <input type="date" className={`${inputCls} !h-10 !w-auto`} value={filters.to} onChange={setFilter('to')} aria-label="Đến ngày" />
        <input className={`${inputCls} !h-10 !w-auto min-w-[220px]`} placeholder="Người thực hiện (tên, email)" value={user} onChange={(e) => setUser(e.target.value)} />
        <select className={`${inputCls} !h-10 !w-auto`} value={filters.action} onChange={setFilter('action')}>
          <option value="">Mọi thao tác</option>
          {Object.entries(AUDIT_ACTIONS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người thực hiện</th>
              <th className="px-4 py-3">Thao tác</th>
              <th className="px-4 py-3">Đối tượng</th>
              <th className="px-4 py-3">Chi tiết</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {data.items.map((l) => (
              <tr key={l.id} className="border-t border-surface-container align-top">
                <td className="px-4 py-3 whitespace-nowrap">{fmt(l.createdAt)}</td>
                <td className="px-4 py-3">{l.userName ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone="indigo">{AUDIT_ACTIONS[l.action] ?? l.action}</Badge>
                </td>
                <td className="px-4 py-3">
                  {l.entityName} #{l.entityId}
                </td>
                <td className="px-4 py-3 font-mono text-body-sm text-secondary break-all">{l.details}</td>
              </tr>
            ))}
            {!loading && !data.items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-secondary">
                  Chưa có nhật ký nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPage={setPage}
          onPageSize={(n) => {
            setPageSize(n)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}
