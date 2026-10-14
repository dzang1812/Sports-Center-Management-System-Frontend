import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Badge, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from '../components/ui'

function PlanForm({ plan, sports, onClose, onDone }) {
  const editing = !!plan
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    durationDays: plan?.durationDays ?? 30,
    price: plan?.price ?? 0,
    isActive: plan?.isActive ?? true,
    sportId: plan?.sportId ?? '',
    includesClasses: plan?.includesClasses ?? false,
    ptSessionCredits: plan?.ptSessionCredits ?? 0,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const toggle = (k) => () => setForm({ ...form, [k]: !form[k] })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = {
        ...form,
        description: form.description || null,
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        sportId: form.sportId ? Number(form.sportId) : null,
        ptSessionCredits: Number(form.ptSessionCredits),
      }
      const result = editing ? await api(`/membership-plans/${plan.id}`, { method: 'PUT', body }) : await api('/membership-plans', { method: 'POST', body })
      onDone(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Sửa gói tập' : 'Thêm gói tập'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Tên gói">
          <input className={inputCls} required minLength={2} maxLength={100} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Mô tả" hint="Tối đa 500 ký tự">
          <input className={inputCls} maxLength={500} value={form.description} onChange={set('description')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Thời hạn (ngày)">
            <input className={inputCls} type="number" required min={1} max={3650} value={form.durationDays} onChange={set('durationDays')} />
          </Field>
          <Field label="Giá (đ)">
            <input className={inputCls} type="number" required min={0} value={form.price} onChange={set('price')} />
          </Field>
        </div>
        <Field label="Bộ môn áp dụng" hint="Bỏ trống nếu áp dụng mọi bộ môn (gói All-Access)">
          <select className={inputCls} value={form.sportId} onChange={set('sportId')}>
            <option value="">Mọi bộ môn</option>
            {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Số buổi PT tặng kèm">
          <input className={inputCls} type="number" min={0} max={1000} value={form.ptSessionCredits} onChange={set('ptSessionCredits')} />
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.includesClasses} onChange={toggle('includesClasses')} />
            Bao gồm lớp học nhóm
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-container" checked={form.isActive} onChange={toggle('isActive')} />
            Đang mở bán
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnOutline} onClick={onClose}>Huỷ</button>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function ManagerPackagesPage() {
  const [plans, setPlans] = useState([])
  const [sports, setSports] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { plan? }

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
    load()
  }

  const sportName = (id) => sports.find((s) => s.id === id)?.name ?? '—'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-xl text-headline-xl">Gói tập</h1>
          <p className="text-secondary">Các gói thành viên hội viên có thể đăng ký ở trang Bảng giá.</p>
        </div>
        <button className={btnPrimary} onClick={() => setModal({})}>
          <Icon name="add" className="text-lg" />
          Thêm gói
        </button>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Tên gói</th>
              <th className="px-4 py-3">Bộ môn</th>
              <th className="px-4 py-3">Thời hạn</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Buổi PT</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-surface-container">
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-secondary">{p.sportId ? sportName(p.sportId) : 'Mọi bộ môn'}</td>
                <td className="px-4 py-3">{p.durationDays} ngày</td>
                <td className="px-4 py-3">{p.price.toLocaleString('vi-VN')}đ</td>
                <td className="px-4 py-3">{p.ptSessionCredits || '—'}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Đang mở bán' : 'Ngừng bán'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className={btnOutline + ' !h-8 !px-2'} title="Sửa" onClick={() => setModal({ plan: p })}>
                    <Icon name="edit" className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !plans.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-secondary">Chưa có gói tập nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && <PlanForm plan={modal.plan} sports={sports} onClose={() => setModal(null)} onDone={done} />}
    </div>
  )
}
