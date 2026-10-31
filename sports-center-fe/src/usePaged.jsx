import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { Pagination } from './components/ui'

// Paged list loader for endpoints returning { items, total }; path may already carry a query string.
export default function usePaged(path) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async (signal) => {
    setLoading(true); setError('')
    try {
      const result = await api(`${path}${path.includes('?') ? '&' : '?'}page=${page}&pageSize=${pageSize}`, { signal })
      if (!signal?.aborted) setData(result)
    } catch (err) { if (!signal?.aborted) setError(err.message) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [path, page, pageSize])
  useEffect(() => {
    const c = new AbortController()
    void Promise.resolve().then(() => load(c.signal))
    return () => c.abort()
  }, [load])
  const pagination = <Pagination page={page} pageSize={pageSize} total={data.total} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1) }} />
  return { data, loading, error, reload: () => load(), pagination, setPage }
}
