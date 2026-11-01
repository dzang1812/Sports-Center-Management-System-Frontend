import { useEffect, useState } from 'react'
import { api, apiUpload } from '../api'
import { useAuth } from '../auth'
import PasswordInput from '../components/PasswordInput'
import CoachProfileEditor from '../components/CoachProfileEditor'
import { Alert, Avatar, Badge, Field, btnPrimary, inputCls } from '../components/ui'
import { GENDER_LABEL, GOAL_LABEL, LEVEL_LABEL, PASSWORD_HINT, PASSWORD_RULE, PHONE_HINT, PHONE_RULE, ROLE_LABEL } from '../labels'

const MIN_BIRTH_DATE = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().slice(0, 10)

const card = 'bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-6'

const Select = ({ options, ...props }) => (
  <select className={inputCls} {...props}>
    <option value="">— Chưa chọn —</option>
    {Object.entries(options).map(([value, label]) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
)

function ProfileForm({ me, onSaved }) {
  const isMember = me.role === 'Member'
  const [form, setForm] = useState({
    fullName: me.fullName,
    phone: me.phone ?? '',
    dateOfBirth: me.dateOfBirth ?? '',
    gender: me.gender ?? '',
    avatarUrl: me.avatarUrl ?? '',
    heightCm: me.heightCm ?? '',
    weightKg: me.weightKg ?? '',
    goal: me.goal ?? '',
    level: me.level ?? '',
  })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMsg(null)
    setUploading(true)
    try {
      const { url } = await apiUpload(file)
      setForm((f) => ({ ...f, avatarUrl: url }))
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
    setUploading(false)
    e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!form.fullName.trim()) return setMsg({ type: 'error', text: 'Họ và tên là bắt buộc' })
    if (form.phone && !PHONE_RULE.test(form.phone)) return setMsg({ type: 'error', text: PHONE_HINT })

    setBusy(true)
    const num = (v) => (v === '' ? null : Number(v))
    try {
      const saved = await api('/me', {
        method: 'PUT',
        body: {
          fullName: form.fullName.trim(),
          phone: form.phone || null,
          dateOfBirth: form.dateOfBirth || null,
          gender: form.gender || null,
          avatarUrl: form.avatarUrl || null,
          heightCm: num(form.heightCm),
          weightKg: num(form.weightKg),
          goal: form.goal || null,
          level: form.level || null,
        },
      })
      onSaved(saved)
      setMsg({ type: 'success', text: 'Đã lưu hồ sơ.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className={`${card} flex flex-col gap-4`}>
      <h2 className="font-headline-md text-headline-md">Thông tin cá nhân</h2>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Mã hội viên" hint="Dùng khi liên hệ lễ tân hoặc đặt lớp/PT">
          <input className={inputCls} value={`#${me.id}`} disabled />
        </Field>
        <Field label="Email">
          <input className={inputCls} value={me.email} disabled />
        </Field>
        <Field label="Họ và tên">
          <input className={inputCls} required value={form.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Số điện thoại">
          <input className={inputCls} type="tel" placeholder="0912345678" pattern={PHONE_RULE.source} title={PHONE_HINT} value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Ngày sinh">
          <input className={inputCls} type="date" min={MIN_BIRTH_DATE} max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
        </Field>
        <Field label="Giới tính">
          <Select options={GENDER_LABEL} value={form.gender} onChange={set('gender')} />
        </Field>
        <Field label="Ảnh đại diện">
          <div className="flex items-center gap-3">
            <Avatar src={form.avatarUrl} className="w-11 h-11" />
            <label className={`${btnPrimary} cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? 'Đang tải lên…' : 'Chọn ảnh'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </label>
          </div>
        </Field>
      </div>

      {isMember && (
        <>
          <h3 className="font-headline-sm text-headline-sm mt-2">Thể trạng & mục tiêu</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Chiều cao (cm)">
              <input className={inputCls} type="number" min="50" max="250" step="0.1" value={form.heightCm} onChange={set('heightCm')} />
            </Field>
            <Field label="Cân nặng (kg)">
              <input className={inputCls} type="number" min="20" max="300" step="0.1" value={form.weightKg} onChange={set('weightKg')} />
            </Field>
            <Field label="Mục tiêu">
              <Select options={GOAL_LABEL} value={form.goal} onChange={set('goal')} />
            </Field>
            <Field label="Trình độ">
              <Select options={LEVEL_LABEL} value={form.level} onChange={set('level')} />
            </Field>
          </div>
        </>
      )}

      <div>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
}

function PasswordForm() {
  const { updateAuth } = useAuth()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!PASSWORD_RULE.test(form.newPassword)) return setMsg({ type: 'error', text: PASSWORD_HINT })
    if (form.newPassword !== form.confirm) return setMsg({ type: 'error', text: 'Mật khẩu nhập lại không khớp' })

    setMsg(null)
    setBusy(true)
    try {
      await api('/me/password', { method: 'PUT', body: { oldPassword: form.oldPassword, newPassword: form.newPassword } })
      updateAuth({ mustChangePassword: false })
      setForm({ oldPassword: '', newPassword: '', confirm: '' })
      setMsg({ type: 'success', text: 'Đã đổi mật khẩu.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className={`${card} flex flex-col gap-4`} id="password">
      <h2 className="font-headline-md text-headline-md">Đổi mật khẩu</h2>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <Field label="Mật khẩu hiện tại">
        <PasswordInput autoComplete="current-password" required value={form.oldPassword} onChange={set('oldPassword')} />
      </Field>
      <Field label="Mật khẩu mới" hint={PASSWORD_HINT}>
        <PasswordInput autoComplete="new-password" required pattern={PASSWORD_RULE.source} title={PASSWORD_HINT} value={form.newPassword} onChange={set('newPassword')} />
      </Field>
      <Field label="Nhập lại mật khẩu mới">
        <PasswordInput autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} />
      </Field>
      <div>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'Đang đổi…' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const { auth, updateAuth } = useAuth()
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/me').then((m) => {
      setMe(m)
      updateAuth({ avatarUrl: m.avatarUrl })
    }, (err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saved = (m) => {
    setMe(m)
    updateAuth({ fullName: m.fullName, avatarUrl: m.avatarUrl })
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <h1 className="font-headline-xl text-headline-xl">Hồ sơ cá nhân</h1>
        <Badge tone="indigo">{ROLE_LABEL[auth.role]}</Badge>
      </div>
      {auth.mustChangePassword && (
        <Alert type="warning" title="Bạn đang dùng mật khẩu tạm">
          Vui lòng đổi mật khẩu trước khi sử dụng các chức năng khác.
        </Alert>
      )}
      {error && <Alert>{error}</Alert>}
      {me && <ProfileForm me={me} onSaved={saved} />}
      {me?.role === 'Coach' && !auth.mustChangePassword && <CoachProfileEditor key={me.id} />}
      <PasswordForm />
    </div>
  )
}
