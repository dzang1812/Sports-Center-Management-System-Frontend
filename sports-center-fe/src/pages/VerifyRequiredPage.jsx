import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { Logo } from '../components/AuthShell'
import { Alert, Icon, btnOutline, btnPrimary } from '../components/ui'

// Full-screen gate shown by RequireAuth (App.jsx) in place of AppLayout whenever auth.emailVerified
// is false — blocks every other action until the member verifies, same pattern as the mustChangePassword gate.
export default function VerifyRequiredPage() {
  const { auth, updateAuth, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState(null) // { type, text }
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/me').then((me) => setEmail(me.email)).catch(() => {})
  }, [])

  const resend = async () => {
    setBusy(true)
    setNotice(null)
    try {
      await api('/auth/resend-verification', { method: 'POST' })
      setNotice({ type: 'success', text: 'Đã gửi lại email xác thực, vui lòng kiểm tra hộp thư (kể cả mục spam).' })
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    }
    setBusy(false)
  }

  const recheck = async () => {
    setBusy(true)
    setNotice(null)
    try {
      const me = await api('/me')
      if (me.emailVerified) updateAuth({ emailVerified: true })
      else setNotice({ type: 'warning', text: 'Email vẫn chưa được xác thực. Hãy bấm vào link trong email trước, rồi quay lại đây.' })
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    }
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center bg-surface">
      <Logo />
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
        <Icon name="mark_email_unread" className="text-4xl" />
      </div>
      <div className="max-w-md flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Xác thực email để tiếp tục</h1>
        <p className="text-secondary">
          Tài khoản {auth.fullName} {email && <>(<b>{email}</b>)</>} chưa xác thực email. Mở email chúng tôi đã gửi và bấm vào link xác thực, sau đó quay
          lại đây để tiếp tục sử dụng hệ thống.
        </p>
      </div>

      {notice && (
        <Alert type={notice.type} className="max-w-md text-left">
          {notice.text}
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className={btnPrimary} disabled={busy} onClick={recheck}>
          <Icon name="refresh" className="text-lg" />
          Tôi đã xác thực — kiểm tra lại
        </button>
        <button className={btnOutline} disabled={busy} onClick={resend}>
          <Icon name="send" className="text-lg" />
          Gửi lại email xác thực
        </button>
      </div>

      <button onClick={logout} className="text-secondary font-label-md text-label-md hover:text-on-surface underline">
        Đăng xuất
      </button>
    </div>
  )
}
