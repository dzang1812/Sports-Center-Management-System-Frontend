import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import AuthShell, { linkCls } from '../components/AuthShell'
import { Alert } from '../components/ui'

export default function VerifyEmailPage() {
  const token = useSearchParams()[0].get('token')
  const { auth, updateAuth } = useAuth()
  const [state, setState] = useState(token ? { status: 'loading' } : { status: 'error', message: 'Link xác thực không hợp lệ' })

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api('/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => {
        if (cancelled) return
        setState({ status: 'ok' })
        if (auth) updateAuth({ emailVerified: true })
      })
      .catch((err) => !cancelled && setState({ status: 'error', message: err.message }))
    return () => {
      cancelled = true
    }
    // run once per token
    // eslint-disable-next-line
  }, [token])

  return (
    <AuthShell
      title="Xác thực email"
      icon="mark_email_read"
      footer={
        <Link to={auth ? '/profile' : '/login'} className={linkCls}>
          {auth ? 'Về hồ sơ của tôi' : 'Đăng nhập'}
        </Link>
      }
    >
      {state.status === 'loading' && <p className="text-secondary">Đang xác thực…</p>}
      {state.status === 'ok' && (
        <Alert type="success" title="Xác thực thành công">
          Email của bạn đã được xác thực.
        </Alert>
      )}
      {state.status === 'error' && <Alert title="Không xác thực được">{state.message}</Alert>}
    </AuthShell>
  )
}
