import { useCallback, useEffect, useState } from 'react'
import { api, apiUpload, query } from '../api'
import { useAuth } from '../auth'
import { Alert, Avatar, Badge, Field, Icon, Modal, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { ROLE_LABEL } from '../labels'

const ROLE_TONE = { Manager: 'amber', Coach: 'indigo', Receptionist: 'slate', Member: 'green' }
const isStaffAccount = (role) => role === 'Coach' || role === 'Receptionist'

function UserForm({ user, onClose, onDone }) {
  const editing = !!user
  const [form, setForm] = useState({
    email: user?.email ?? '',
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'Coach',
    specialties: user?.specialties ?? [],
    avatarUrl: user?.avatarUrl ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sports, setSports] = useState([])

  useEffect(() => {
    api('/sports').then((list) => setSports(list.filter((s) => s.status === 'Active').map((s) => s.name))).catch(() => {})
  }, [])
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (s) =>
    setForm({ ...form, specialties: form.specialties.includes(s) ? form.specialties.filter((x) => x !== s) : [...form.specialties, s] })
  const isCoach = form.role === 'Coach'

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { url } = await apiUpload(file)
      setForm((f) => ({ ...f, avatarUrl: url }))
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
    e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const specialties = isCoach ? form.specialties : []
    const avatarUrl = form.avatarUrl || null
    try {
      const result = editing
        ? await api(`/users/${user.id}`, { method: 'PUT', body: { fullName: form.fullName, phone: form.phone || null, specialties, avatarUrl } })
        : await api('/users', { method: 'POST', body: { ...form, phone: form.phone || null, specialties, avatarUrl } })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Sửa tài khoản' : 'Thêm tài khoản'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Ảnh đại diện">
          <div className="flex items-center gap-3">
            <Avatar src={form.avatarUrl} className="w-16 h-16" />
            <label className={`${btnOutline} cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? 'Đang tải lên…' : form.avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </label>
          </div>
        </Field>
        {!editing && (
          <Field label="Vai trò">
            <select className={inputCls} value={form.role} onChange={set('role')}>
              <option value="Coach">{ROLE_LABEL.Coach}</option>
              <option value="Receptionist">{ROLE_LABEL.Receptionist}</option>
            </select>
          </Field>
        )}
        <Field label="Email" hint={editing ? 'Không thể đổi email' : 'Hệ thống sẽ sinh mật khẩu tạm cho tài khoản này'}>
          <input className={inputCls} type="email" required disabled={editing} value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Họ và tên">
          <input className={inputCls} required value={form.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Số điện thoại">
          <input className={inputCls} type="tel" value={form.phone} onChange={set('phone')} />
        </Field>
        {isCoach && (
          <fieldset className="flex flex-col gap-2">
            <legend className="font-label-md text-label-md font-semibold mb-1.5">Chuyên môn</legend>
            <div className="flex flex-wrap gap-4">
              {sports.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.specialties.includes(s)} onChange={() => toggle(s)} />
                  {s}
                </label>
              ))}
            </div>
            <span className="font-body-sm text-body-sm text-secondary">HLV có Gym hoặc Boxing sẽ xuất hiện trong danh sách đặt PT.</span>
          </fieldset>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function TempPasswordModal({ created, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard?.writeText(created.tempPassword)
    setCopied(true)
  }
  return (
    <Modal title="Đã tạo tài khoản" onClose={onClose}>
      <p className="mb-3">
        Tài khoản <b>{created.user.email}</b> đã được tạo. Hãy gửi mật khẩu tạm cho người dùng, họ sẽ phải đổi mật khẩu ở lần đăng nhập đầu.
      </p>
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-surface-container font-mono text-lg">
        {created.tempPassword}
        <button onClick={copy} className={btnOutline + ' !h-8'}>
          <Icon name={copied ? 'check' : 'content_copy'} className="text-base" />
          {copied ? 'Đã chép' : 'Sao chép'}
        </button>
      </div>
      <Alert type="warning" className="mt-3">
        Mật khẩu chỉ hiển thị một lần, không xem lại được sau khi đóng.
      </Alert>
      <div className="flex justify-end pt-4">
        <button className={btnPrimary} onClick={onClose}>
          Đã lưu lại
        </button>
      </div>
    </Modal>
  )
}

function LockConfirmModal({ user, onClose, onConfirm, busy }) {
  const lock = user.isActive
  return (
    <Modal title={lock ? 'Khoá tài khoản' : 'Mở khoá tài khoản'} onClose={onClose}>
      <p className="text-on-surface">
        {lock ? 'Khoá' : 'Mở khoá'} tài khoản <b>{user.email}</b>?
        {lock && ' Tài khoản sẽ không thể đăng nhập cho đến khi được mở khoá lại.'}
      </p>
      <div className="flex justify-end gap-2 pt-5">
        <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
        <button
          type="button"
          disabled={busy}
          className={lock ? btnPrimary + ' !bg-error !text-white hover:!opacity-90' : btnPrimary}
          onClick={onConfirm}
        >
          {busy ? 'Đang xử lý…' : lock ? 'Khoá tài khoản' : 'Mở khoá'}
        </button>
      </div>
    </Modal>
  )
}

export default function UsersPage() {
  const { auth } = useAuth()
  const [filters, setFilters] = useState({ q: '', role: '', status: '' })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { type: 'form', user? } | { type: 'temp', created } | { type: 'lock', user }

  // Debounce the search box so we don't call the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.q === q ? f : { ...f, q }))
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api(`/users${query({ ...filters, page, pageSize })}`))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filters, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.value })
    setPage(1)
  }

  const [lockBusy, setLockBusy] = useState(false)

  const [verifyingId, setVerifyingId] = useState(null)

  const verifyEmail = async (u) => {
    setVerifyingId(u.id)
    setError('')
    try {
      await api(`/users/${u.id}/verify-email`, { method: 'PATCH' })
      load()
    } catch (err) {
      setError(err.message)
    }
    setVerifyingId(null)
  }

  const confirmToggleStatus = async () => {
    const u = modal.user
    setLockBusy(true)
    try {
      await api(`/users/${u.id}/status`, { method: 'PATCH', body: { isActive: !u.isActive } })
      setModal(null)
      load()
    } catch (err) {
      setError(err.message)
    }
    setLockBusy(false)
  }

  const done = (result) => {
    setModal(result?.tempPassword ? { type: 'temp', created: result } : null)
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Hội viên & nhân sự</h1>
          <p className="text-secondary">Thành viên, huấn luyện viên và lễ tân của trung tâm.</p>
        </div>
        <button className={btnPrimary} onClick={() => setModal({ type: 'form' })}>
          <Icon name="person_add" className="text-lg" />
          Thêm tài khoản
        </button>
      </div>

      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Từ khoá">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-2.5 text-outline text-xl pointer-events-none" />
              <input className={`${inputCls} pl-10`} placeholder="Tìm theo tên, email, SĐT…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </Field>
          <Field label="Vai trò">
            <select className={inputCls} value={filters.role} onChange={setFilter('role')}>
              <option value="">— Tất cả —</option>
              {Object.entries(ROLE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái">
            <select className={inputCls} value={filters.status} onChange={setFilter('status')}>
              <option value="">— Tất cả —</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Locked">Đã khoá</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            className={btnOutline}
            onClick={() => {
              setQ('')
              setFilters({ q: '', role: '', status: '' })
              setPage(1)
            }}
          >
            Đặt lại
          </button>
          <button type="button" className={btnPrimary} onClick={load}>Tìm kiếm</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Chuyên môn</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {data.items.map((u) => (
              <tr key={u.id} className="border-t border-surface-container">
                <td className="px-4 py-3 text-secondary">#{u.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatarUrl} className="w-9 h-9" />
                    <div>
                      <div className="font-semibold">{u.fullName}</div>
                      <div className="text-secondary text-body-sm">{u.email}</div>
                      {!u.emailVerified && <Badge tone="amber">Chưa xác thực email</Badge>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{u.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">{u.specialties.length ? u.specialties.map((s) => <Badge key={s}>{s}</Badge>) : '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Hoạt động' : 'Đã khoá'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {isStaffAccount(u.role) && (
                      <button className={btnOutline + ' !h-8 !px-2'} title="Sửa" onClick={() => setModal({ type: 'form', user: u })}>
                        <Icon name="edit" className="text-base" />
                      </button>
                    )}
                    {!u.emailVerified && (
                      <button
                        className={btnOutline + ' !h-8 !px-2'}
                        title="Xác thực email thủ công (dùng khi người dùng không nhận được mail)"
                        disabled={verifyingId === u.id}
                        onClick={() => verifyEmail(u)}
                      >
                        <Icon name="mark_email_read" className="text-base" />
                      </button>
                    )}
                    {u.id !== auth.userId && (
                      <button className={btnOutline + ' !h-8 !px-2'} title={u.isActive ? 'Khoá' : 'Mở khoá'} onClick={() => setModal({ type: 'lock', user: u })}>
                        <Icon name={u.isActive ? 'lock' : 'lock_open'} className="text-base" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !data.items.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-secondary">
                  Không có người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPage={setPage}
          onPageSize={(n) => {
            setPageSize(n)
            setPage(1)
          }}
        />
      </div>

      {modal?.type === 'form' && <UserForm user={modal.user} onClose={() => setModal(null)} onDone={done} />}
      {modal?.type === 'temp' && <TempPasswordModal created={modal.created} onClose={() => setModal(null)} />}
      {modal?.type === 'lock' && (
        <LockConfirmModal user={modal.user} busy={lockBusy} onClose={() => setModal(null)} onConfirm={confirmToggleStatus} />
      )}
    </div>
  )
}
