import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import AuthShell, { linkCls } from '../components/AuthShell'
import { Alert, Field, btnPrimary, inputCls } from '../components/ui'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/forgot', { method: 'POST', body: { email } })
      setSent(true)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu."
      icon="lock_reset"
      footer={
        <Link to="/login" className={linkCls}>
          Quay lại đăng nhập
        </Link>
      }
    >
      {sent ? (
        <Alert type="success" title="Đã gửi yêu cầu">
          Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu (hết hạn sau 15 phút).
        </Alert>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Địa chỉ Email">
            <input className={inputCls} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <button type="submit" disabled={busy} className={`${btnPrimary} !h-11 w-full`}>
            {busy ? 'Đang gửi…' : 'Gửi link đặt lại'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
