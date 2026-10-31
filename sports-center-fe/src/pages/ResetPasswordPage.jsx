import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { PASSWORD_HINT, PASSWORD_RULE } from '../labels'
import AuthShell, { linkCls } from '../components/AuthShell'
import PasswordInput from '../components/PasswordInput'
import { Alert, Field, btnPrimary } from '../components/ui'

export default function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token')
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!PASSWORD_RULE.test(form.password)) errs.password = PASSWORD_HINT
    if (form.confirm !== form.password) errs.confirm = 'Mật khẩu nhập lại không khớp'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setError('')
    setBusy(true)
    try {
      await api('/auth/reset', { method: 'POST', body: { token, newPassword: form.password } })
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <AuthShell
      title="Đặt lại mật khẩu"
      icon="lock_reset"
      footer={
        <Link to="/login" className={linkCls}>
          {done ? 'Đăng nhập ngay' : 'Quay lại đăng nhập'}
        </Link>
      }
    >
      {!token ? (
        <Alert title="Link không hợp lệ">Vui lòng dùng đúng link trong email, hoặc yêu cầu link mới.</Alert>
      ) : done ? (
        <Alert type="success" title="Thành công">
          Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.
        </Alert>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          {error && (
            <Alert>
              {error}{' '}
              <Link to="/forgot-password" className="underline">
                Yêu cầu link mới
              </Link>
            </Alert>
          )}
          <Field label="Mật khẩu mới" error={errors.password} hint={PASSWORD_HINT}>
            <PasswordInput autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Nhập lại mật khẩu mới" error={errors.confirm}>
            <PasswordInput autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </Field>
          <button type="submit" disabled={busy} className={`${btnPrimary} !h-11 w-full`}>
            {busy ? 'Đang lưu…' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
