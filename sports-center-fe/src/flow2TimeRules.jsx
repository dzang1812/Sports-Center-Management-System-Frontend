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
        ? 'Đã TẮT bỏ qua thời gian: tất cả vai trò áp dụng thời gian bình thường.'
        : 'Đã BẬT bỏ qua thời gian đặt/hủy lịch và check-in cho tất cả vai trò.' })
    } catch (err) {
      setNotice({ type: 'error', text: err.status === 403
        ? 'Backend từ chối thay đổi. Chỉ Manager đang hoạt động được bật/tắt khi cấu hình máy chủ cho phép.'
        : err.message })
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const available = status?.available === true && status.scope === 'global'
  const enforceTimeRules = !(available && status.enforceTimeRules === false)
  const canManage = available && auth.role === 'Manager' && status.canManage === true

  return (
    <Flow2TimeRulesContext.Provider value={{ available, enforceTimeRules, canManage, busy, refresh, update }}>
      {children}
      {available && !enforceTimeRules && (
        <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm" role="status">
          <Alert type="warning">Bỏ qua thời gian đang BẬT cho tất cả vai trò trên máy chủ này: đặt/hủy lịch và check-in. Hạn mua khóa, hạn gói đã mua và các quy tắc tiền vẫn áp dụng.</Alert>
        </div>
      )}
      {notice && <Toast type={notice.type} onClose={() => setNotice(null)}>{notice.text}</Toast>}
    </Flow2TimeRulesContext.Provider>
  )
}

export function Flow2TimeRulesSwitch() {
  const { auth } = useAuth()
  const { available, enforceTimeRules, canManage, busy, update } = useFlow2TimeRules()
  if (auth.role !== 'Manager') return null
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!enforceTimeRules}
      aria-label="Bỏ qua giới hạn thời gian Flow 2 cho tất cả vai trò"
      disabled={busy || !canManage}
      onClick={update}
      title={!available ? 'Backend chưa hỗ trợ hoặc chưa cho phép công tắc này. Cần triển khai Backend mới và bật Flow2TimeRules:AllowGlobalSwitch.' : `${enforceTimeRules ? 'Bật bỏ qua thời gian đặt/hủy lịch và check-in cho tất cả vai trò.' : 'Tắt bỏ qua để áp dụng thời gian bình thường cho tất cả vai trò.'} Trạng thái dùng chung trên máy chủ, trở về cấu hình mặc định khi Backend khởi động lại.`}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-label-sm font-semibold disabled:opacity-60 ${enforceTimeRules
        ? 'bg-surface-container text-on-surface border border-outline-variant'
        : 'bg-orange-100 text-orange-900 border border-orange-400'}`}
    >
      <Icon name="science" className="text-xl shrink-0" />
      <span className="text-left leading-tight">Bỏ qua thời gian <span className="whitespace-nowrap">{busy ? '…' : !available ? 'Chưa sẵn sàng' : enforceTimeRules ? 'TẮT' : 'BẬT'}</span></span>
      <Icon name={enforceTimeRules ? 'toggle_off' : 'toggle_on'} className="text-2xl shrink-0" />
    </button>
  )
}
