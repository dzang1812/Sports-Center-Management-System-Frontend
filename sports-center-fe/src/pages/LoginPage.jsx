import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ROLE_HOME, useAuth } from '../auth'
import AuthShell, { linkCls } from '../components/AuthShell'
import PasswordInput from '../components/PasswordInput'
import { Alert, Field, Icon, btnPrimary, inputCls } from '../components/ui'

export default function LoginPage() {
  const { auth, login } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from?.pathname
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (auth) return <Navigate to={ROLE_HOME[auth.role]} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const a = await login(form.email, form.password)
      // A temp password must be changed first (AUTH-03); otherwise go where the user was headed, else the role's home.
      navigate(a.mustChangePassword ? '/profile' : from ?? ROLE_HOME[a.role], { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Đăng nhập hệ thống"
      subtitle="Chào mừng bạn quay trở lại! Vui lòng nhập thông tin để truy cập."
      footer={
        <>
          Chưa có tài khoản hội viên?{' '}
          <Link to="/register" className={linkCls}>
            Đăng ký ngay
          </Link>
        </>
      }
    >
      {error && (
        <Alert title="Đăng nhập không thành công" className="mb-6">
          {error}
        </Alert>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Địa chỉ Email">
          <div className="relative">
            <input
              className={`${inputCls} pl-10`}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Icon name="mail" className="absolute left-3 top-2.5 text-outline text-xl pointer-events-none" />
          </div>
        </Field>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-semibold">Mật khẩu</span>
            <Link to="/forgot-password" className={linkCls}>
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" disabled={busy} className={`${btnPrimary} !h-11 w-full mt-1`}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          {!busy && <Icon name="arrow_forward" className="text-lg" />}
        </button>
      </form>
    </AuthShell>
  )
}
