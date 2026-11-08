import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { api, apiUpload } from '../api'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { PLAN_TYPE_LABEL } from '../labels'
import { useClientPaged } from '../usePaged'

function PlanVisibilityDialog({ plan, onClose, onDone }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const pending = useRef(false), active = useRef(false)
  const nextActive = !plan.isActive
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const close = () => { if (!pending.current) onClose() }
  const confirm = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      const saved = await api(`/membership-plans/${plan.id}/status`, {
        method: 'PATCH', body: { isActive: nextActive },
      })
      if (active.current) onDone(saved)
    } catch (err) {
      if (active.current) setError(
        err.status === 405 || err.status === 404 && err.errorCode !== 'PLAN_NOT_FOUND'
          ? 'Backend đang chạy chưa hỗ trợ ẩn/mở bán gói riêng. Cần cập nhật Backend để dùng nút này.'
          : nextActive && err.errorCode === 'PLAN_ENTITLEMENT_REQUIRED'
            ? 'Gói chưa có quyền lợi nên chưa thể mở bán lại. Hãy sửa gói và chọn quyền vào Gym, lớp nhóm hoặc buổi PT trước.'
            : err.message,
      )
    }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <Modal title={nextActive ? 'Mở bán lại gói tập' : 'Ẩn gói tập'} onClose={close} footer={<div className="w-full space-y-3">{error && <Alert>{error}</Alert>}<div className="flex justify-end gap-2"><button type="button" className={btnOutline} disabled={busy} onClick={close}>Quay lại</button><button type="button" className={btnPrimary} disabled={busy} onClick={confirm}>{busy ? 'Đang cập nhật…' : nextActive ? 'Mở bán lại' : 'Xác nhận ẩn gói'}</button></div></div>}>
    <p className="font-semibold">{plan.name}</p><p className="mt-3 text-sm leading-relaxed text-secondary">{nextActive ? 'Hội viên có thể thấy và đăng ký gói này trở lại.' : 'Gói sẽ ngừng bán và không hiện trong danh sách đăng ký của hội viên. Manager vẫn xem được gói ở trạng thái Đã ẩn và có thể mở bán lại.'}</p><p className="mt-3 text-sm leading-relaxed text-secondary">Giữ nguyên giá, thời hạn, quyền lợi của gói, các đăng ký đã mua và lịch sử thanh toán.</p>
  </Modal>
}

function PlanForm({ plan, sports, onClose, onDone }) {
  const editing = !!plan
  const monthly = (plan?.durationMonths ?? 0) > 0
  const formId = useId()
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    durationDays: plan?.durationDays ?? 30,
    durationMonths: plan?.durationMonths ?? 0,
    price: plan?.price ?? 0,
    isActive: plan?.isActive ?? true,
    sportId: plan?.sportId ?? '',
    includesClasses: plan?.includesClasses ?? false,
    includesGymAccess: plan?.includesGymAccess ?? !editing,
    ptSessionCredits: plan?.ptSessionCredits ?? 0,
    imageUrl: plan?.imageUrl ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const pending = useRef(false), active = useRef(false)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const close = () => { if (!pending.current && !uploading) onClose() }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (k) => () => setForm({ ...form, [k]: !form[k] })

  const uploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file || pending.current || uploading) return
    setError('')
    setUploading(true)
    try {
      const { url } = await apiUpload(file)
      if (active.current) setForm((f) => ({ ...f, imageUrl: url }))
    } catch (err) {
      if (active.current) setError(err.message)
    }
    if (active.current) setUploading(false)
    e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (pending.current || uploading) return
    setError('')
    pending.current = true
    setBusy(true)
    try {
      const body = {
        ...form,
        description: form.description || null,
        durationDays: Number(form.durationDays),
        durationMonths: Number(form.durationMonths),
        price: Number(form.price),
        sportId: form.sportId ? Number(form.sportId) : null,
        ptSessionCredits: Number(form.ptSessionCredits),
        imageUrl: form.imageUrl || null,
      }
      const result = editing ? await api(`/membership-plans/${plan.id}`, { method: 'PUT', body }) : await api('/membership-plans', { method: 'POST', body })
      if (active.current) onDone(result)
    } catch (err) {
      if (active.current) setError(err.message)
    } finally {
      pending.current = false
      if (active.current) setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Sửa gói tập' : 'Thêm gói tập'} onClose={close} footer={<div className="w-full space-y-3">{error && <div className="max-h-28 overflow-y-auto"><Alert>{error}</Alert></div>}<div className="flex justify-end gap-2"><button type="button" className={btnOutline} disabled={busy || uploading} onClick={close}>Huỷ</button><button type="submit" form={formId} disabled={busy || uploading} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu'}</button></div></div>}>
      <form id={formId} onSubmit={submit}>
        <fieldset disabled={busy || uploading} className="flex flex-col gap-4">
        {!editing && <p className="rounded-lg bg-surface-container-low px-3 py-2 text-sm text-secondary">Gói tự tập theo thời hạn. Hội viên sử dụng sau khi thanh toán; không kèm lớp nhóm hoặc PT.</p>}
        <Field label="Tên gói">
          <input className={inputCls} required minLength={2} maxLength={100} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Mô tả" hint="Tối đa 500 ký tự">
          <input className={inputCls} maxLength={500} value={form.description} onChange={set('description')} />
        </Field>
        <Field label="Ảnh banner">
          <div className="flex items-center gap-3">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 border border-outline-variant" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 border border-outline-variant">
                <Icon name="image" className="text-outline text-2xl" />
              </div>
            )}
            <label className={`${btnOutline} cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? 'Đang tải lên…' : form.imageUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={monthly ? 'Thời hạn (tháng)' : 'Thời hạn (ngày)'}>
            <input className={inputCls} type="number" required min={1} max={monthly ? 120 : 3650} value={monthly ? form.durationMonths : form.durationDays} onChange={set(monthly ? 'durationMonths' : 'durationDays')} />
          </Field>
          <Field label="Giá (đ)">
            <input className={inputCls} type="number" required min={0} max={1_000_000_000} value={form.price} onChange={set('price')} />
          </Field>
        </div>
        <Field label="Bộ môn áp dụng" hint="Bỏ trống nếu áp dụng mọi bộ môn (gói All-Access)">
          <select className={inputCls} value={form.sportId} onChange={set('sportId')}>
            <option value="">Mọi bộ môn</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        {editing && <details className="rounded-lg border border-outline-variant/40 p-3">
          <summary className="cursor-pointer text-sm font-semibold">Cấu hình gói hiện có</summary>
          <div className="mt-3 space-y-3">
            <Field label="Số buổi PT tặng kèm">
              <input className={inputCls} type="number" min={0} max={1000} value={form.ptSessionCredits} onChange={set('ptSessionCredits')} />
            </Field>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.includesGymAccess} onChange={toggle('includesGymAccess')} />
                Tự tập tại trung tâm
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.includesClasses} onChange={toggle('includesClasses')} />
                Bao gồm lớp học nhóm
              </label>
            </div>
          </div>
        </details>}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.isActive} onChange={toggle('isActive')} />
            Đang mở bán
          </label>
        </fieldset>
      </form>
    </Modal>
  )
}

export default function ManagerPackagesPage({ embedded = false }) {
  const [plans, setPlans] = useState([])
  const [sports, setSports] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { plan? }
  const [visibilityPlan, setVisibilityPlan] = useState(null)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sportFilter, setSportFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')

  const filteredPlans = plans
    .filter((p) => !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((p) => typeFilter === 'all' || p.planType === typeFilter)
    .filter((p) => sportFilter === 'all' || String(p.sportId) === sportFilter)
    .filter((p) => statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive))
  const planPage = useClientPaged(filteredPlans)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [p, s] = await Promise.all([api('/membership-plans/all'), api('/sports')])
      setPlans(p)
      setSports(s)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const done = () => {
    setModal(null)
    setNotice('Đã lưu gói tập.')
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {embedded ? <h2 className="font-headline-md text-headline-md">Gói tập</h2> : <h1 className="font-headline-xl text-headline-xl">Gói tập</h1>}
          <p className="text-secondary">Gói đang mở bán hiển thị cho hội viên đăng ký. Ẩn gói để ngừng bán và giữ lịch sử.</p>
        </div>
        <button className={btnPrimary} onClick={() => setModal({})}>
          <Icon name="add" className="text-lg" />
          Thêm gói
        </button>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      <div className="bg-surface-container rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Tìm theo tên gói">
            <input className={inputCls} placeholder="Tìm theo tên…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Field>
          <Field label="Loại gói">
            <select className={inputCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              {Object.entries(PLAN_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Bộ môn">
            <select className={inputCls} value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Trạng thái">
            <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">— Tất cả —</option>
              <option value="active">Đang mở bán</option>
              <option value="inactive">Đã ẩn / ngừng bán</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            className={btnOutline}
            onClick={() => { setSearch(''); setTypeFilter('all'); setSportFilter('all'); setStatusFilter('active') }}
          >
            Đặt lại
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Ảnh</th>
              <th className="px-4 py-3">Tên gói</th>
              <th className="px-4 py-3">Loại gói</th>
              <th className="px-4 py-3">Bộ môn</th>
              <th className="px-4 py-3">Thời hạn</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Buổi PT</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {planPage.pageItems.map((p) => (
              <tr key={p.id} className="border-t border-surface-container">
                <td className="px-4 py-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                      <Icon name="image" className="text-outline text-base" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-secondary">{PLAN_TYPE_LABEL[p.planType] ?? p.planType}</td>
                <td className="px-4 py-3 text-secondary">{p.sportName ?? 'Mọi bộ môn'}</td>
                <td className="px-4 py-3">{p.durationMonths > 0 ? `${p.durationMonths} tháng` : `${p.durationDays} ngày`}</td>
                <td className="px-4 py-3">{p.price.toLocaleString('vi-VN')}đ</td>
                <td className="px-4 py-3">{p.ptSessionCredits || '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Đang mở bán' : 'Đã ẩn'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap"><button type="button" className={btnOutline + ' !h-8 !px-2'} title="Sửa" aria-label={`Sửa gói ${p.name}`} onClick={() => setModal({ plan: p })}>
                    <Icon name="edit" className="text-base" />
                  </button>
                  <button type="button" className={btnOutline + ' !h-8 !text-xs'} aria-label={`${p.isActive ? 'Ẩn gói' : 'Mở bán lại gói'} ${p.name}`} onClick={() => setVisibilityPlan(p)}><Icon name={p.isActive ? 'visibility_off' : 'visibility'} className="text-base" />{p.isActive ? 'Ẩn gói' : 'Mở bán lại'}</button></div>
                </td>
              </tr>
            ))}
            {!loading && !plans.length && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-secondary">Chưa có gói tập nào.</td></tr>
            )}
            {!loading && plans.length > 0 && !filteredPlans.length && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-secondary">Không có gói khớp bộ lọc.</td></tr>
            )}
          </tbody>
        </table>
        {planPage.pagination}
      </div>

      {modal && <PlanForm plan={modal.plan} sports={sports} onClose={() => setModal(null)} onDone={done} />}
      {visibilityPlan && <PlanVisibilityDialog plan={visibilityPlan} onClose={() => setVisibilityPlan(null)} onDone={saved => { setPlans(current => current.map(plan => plan.id === saved.id ? saved : plan)); setVisibilityPlan(null); setNotice(saved.isActive ? `Đã mở bán lại gói “${saved.name}”.` : `Đã ẩn gói “${saved.name}” khỏi danh sách đăng ký của hội viên. Có thể mở bán lại tại đây.`) }} />}
    </div>
  )
}
