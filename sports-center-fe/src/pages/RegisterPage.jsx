import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PASSWORD_HINT, PASSWORD_RULE } from '../labels'
import { ROLE_HOME, useAuth } from '../auth'
import AuthShell, { linkCls } from '../components/AuthShell'
import PasswordInput from '../components/PasswordInput'
import { Alert, Field, btnPrimary, inputCls } from '../components/ui'

export default function RegisterPage() {
  const { auth, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (auth) return <Navigate to={ROLE_HOME[auth.role]} replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Họ tên là bắt buộc'
    if (!PASSWORD_RULE.test(form.password)) errs.password = PASSWORD_HINT
    if (form.confirm !== form.password) errs.confirm = 'Mật khẩu nhập lại không khớp'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setError('')
    setBusy(true)
    try {
      const { confirm: _confirm, ...body } = form
      const a = await register({ ...body, phone: body.phone || null })
      navigate(ROLE_HOME[a.role], { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Đăng ký hội viên"
      subtitle="Tạo tài khoản để đặt lớp và theo dõi tiến độ tập luyện."
      icon="person_add"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className={linkCls}>
            Đăng nhập
          </Link>
        </>
      }
    >
      {error && <Alert className="mb-6">{error}</Alert>}
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Họ và tên" error={errors.fullName}>
          <input className={inputCls} autoComplete="name" value={form.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Địa chỉ Email">
          <input className={inputCls} type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Số điện thoại (không bắt buộc)">
          <input className={inputCls} type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Mật khẩu" error={errors.password} hint={PASSWORD_HINT}>
          <PasswordInput autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Nhập lại mật khẩu" error={errors.confirm}>
          <PasswordInput autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </Field>
        <button type="submit" disabled={busy} className={`${btnPrimary} !h-11 w-full mt-1`}>
          {busy ? 'Đang tạo tài khoản…' : 'Đăng ký'}
        </button>
      </form>
    </AuthShell>
  )
}
