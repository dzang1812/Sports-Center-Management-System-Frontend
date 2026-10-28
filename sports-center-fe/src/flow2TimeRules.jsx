import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from './api'
import { useAuth } from './auth'
import { Alert, Icon, Toast } from './components/ui'

const Flow2TimeRulesContext = createContext(null)
export const useFlow2TimeRules = () => useContext(Flow2TimeRulesContext)
const endpoint = '/dev/flow2-time-rules'

export function Flow2TimeRulesProvider({ children }) {
  const { auth } = useAuth()
  const { pathname } = useLocation()
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  // Ignore an older GET that completes after a PUT or a newer refresh.
  const revision = useRef(0)

  const refresh = useCallback(async () => {
    if (!import.meta.env.DEV) return null
    const current = ++revision.current
    try {
      const result = await api(endpoint)
      if (revision.current === current) setStatus(result)
      return result
    } catch {
      // A failed availability check must never enable bypass on the frontend.
      if (revision.current === current) setStatus(null)
      return null
    }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(refresh)
  }, [refresh, pathname])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const sync = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const timer = setInterval(sync, 3000)
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    // Read again when another role starts interacting with an already-open page.
    document.addEventListener('focusin', sync)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', sync)
      document.removeEventListener('focusin', sync)
    }
  }, [refresh])

  const update = async () => {
    if (busy || auth.role !== 'Manager' || !status?.available || !status.canManage) return
    const enforceTimeRules = !status.enforceTimeRules
    setBusy(true)
    setNotice(null)
    revision.current++
    try {
      const result = await api(endpoint, { method: 'PUT', body: { enforceTimeRules } })
      revision.current++
      setStatus(result)
      setNotice({ type: 'success', text: result.enforceTimeRules
        ? 'Đã bật ràng buộc thời gian Flow 2 cho tất cả vai trò.'
        : 'Đã tắt ràng buộc thời gian Flow 2 cho tất cả vai trò.' })
    } catch (err) {
      setNotice({ type: 'error', text: err.status === 403
        ? 'Backend từ chối thay đổi ràng buộc thời gian. Tính năng chỉ dành cho Manager trong môi trường kiểm thử được cho phép.'
        : err.message })
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const available = import.meta.env.DEV && status?.available === true && status.scope === 'global'
  const enforceTimeRules = !(available && status.enforceTimeRules === false)
  const canManage = available && auth.role === 'Manager' && status.canManage === true

  return (
    <Flow2TimeRulesContext.Provider value={{ enforceTimeRules, canManage, busy, refresh, update }}>
      {children}
      {available && !enforceTimeRules && (
        <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm" role="status">
          <Alert type="warning">Ràng buộc thời gian Flow 2: OFF — đang bỏ qua giới hạn thời gian cho tất cả vai trò. Chỉ dùng để kiểm thử.</Alert>
        </div>
      )}
      {notice && <Toast type={notice.type} onClose={() => setNotice(null)}>{notice.text}</Toast>}
    </Flow2TimeRulesContext.Provider>
  )
}

export function Flow2TimeRulesSwitch() {
  const { enforceTimeRules, canManage, busy, update } = useFlow2TimeRules()
  if (!canManage) return null
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enforceTimeRules}
      aria-label="Ràng buộc thời gian Flow 2"
      disabled={busy}
      onClick={update}
      title={enforceTimeRules ? 'ON: áp dụng thời gian bình thường cho tất cả vai trò' : 'OFF: bỏ qua giới hạn thời gian Flow 2 cho tất cả vai trò'}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm font-semibold disabled:opacity-60 ${enforceTimeRules
        ? 'bg-surface-container text-on-surface border border-outline-variant'
        : 'bg-orange-100 text-orange-900 border border-orange-400'}`}
    >
      <Icon name="science" className="text-xl shrink-0" />
      <span className="text-left leading-tight">Ràng buộc thời gian Flow 2 <span className="whitespace-nowrap">{busy ? '…' : enforceTimeRules ? 'ON' : 'OFF'}</span></span>
      <Icon name={enforceTimeRules ? 'toggle_on' : 'toggle_off'} className="text-2xl shrink-0" />
    </button>
  )
}
