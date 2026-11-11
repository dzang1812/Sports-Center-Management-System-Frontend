import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { PLAN_TYPE_LABEL } from '../labels'
import { SubscribeModal } from '../pages/PackagesPage'
import { CommerceConfirm } from './commerce'
import { Alert, Badge, Icon, btnOutline, btnPrimary, inputCls } from './ui'
import { useClientPaged } from '../usePaged'

const money = amount => `${Number(amount).toLocaleString('vi-VN')}đ`
const duration = plan => plan.durationMonths > 0 ? `${plan.durationMonths} tháng` : `${plan.durationDays} ngày`
const isSelfPractice = plan => plan.includesGymAccess && !plan.includesClasses && !(plan.ptSessionCredits > 0)
const usesWallet = plan => plan.walletPtPackage === true || isSelfPractice(plan)

function PackageImage({ plan }) {
  const [broken, setBroken] = useState(false)
  return <div className="flex h-24 items-center justify-center overflow-hidden bg-indigo-50">
    {plan.imageUrl && !broken ? <img src={plan.imageUrl} alt={plan.name} onError={() => setBroken(true)} className="h-full w-full object-cover" /> : <Icon name={plan.ptSessionCredits > 0 ? 'fitness_center' : 'card_membership'} className="text-4xl text-indigo-400" />}
  </div>
}

export default function MemberPackages() {
  const [plans, setPlans] = useState([]), [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [walletError, setWalletError] = useState('')
  const [search, setSearch] = useState(''), [type, setType] = useState('all'), [reload, setReload] = useState(0)
  const [selected, setSelected] = useState(null), [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      if (controller.signal.aborted) return
      setLoading(true); setError(''); setWalletError(''); setWallet(null)
      const [catalog, balance] = await Promise.allSettled([api('/membership-plans', { signal: controller.signal }), api('/wallet', { signal: controller.signal })])
      if (controller.signal.aborted) return
      if (catalog.status === 'fulfilled') setPlans(catalog.value.filter(plan => plan.isActive !== false))
      else { setPlans([]); setError(catalog.reason.message) }
      if (balance.status === 'fulfilled') setWallet(balance.value)
      else setWalletError('Chưa tải được số dư. Hãy bấm Làm mới trước khi thanh toán bằng số dư.')
      setLoading(false)
    }
    void Promise.resolve().then(load)
    return () => controller.abort()
  }, [reload])
  const shown = plans.filter(plan => (type === 'all' || plan.planType === type)
    && `${plan.name} ${plan.sportName ?? ''}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')))
  const { pageItems, pagination } = useClientPaged(shown)
  const bought = () => {
    setNotice(`Đã thanh toán gói “${selected.name}” bằng số dư. Xem thời hạn trong Ví & gói → Gói đã mua.`)
    setSelected(null); setReload(value => value + 1)
  }
  return <section className="space-y-4" aria-label="Đăng ký gói tập">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Chọn gói tập phù hợp</h2><p className="mt-1 text-body-sm text-slate-500">Gói theo thời hạn, lớp nhóm hoặc buổi PT do trung tâm mở bán.</p></div><Link className={btnOutline + ' !h-9 !text-xs'} to="/member/wallet?tab=packages">Gói đã mua<Icon name="arrow_forward" className="text-base" /></Link></div>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-body-sm text-emerald-900"><span>Số dư khả dụng: <b>{wallet ? money(wallet.balance) : '—'}</b></span><Link className="font-semibold hover:underline" to="/member/wallet">Nạp tiền<Icon name="arrow_forward" className="ml-1 text-sm" /></Link></div>
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto]"><input aria-label="Tìm gói tập" className={inputCls} placeholder="Tìm tên gói, bộ môn…" value={search} onChange={event => setSearch(event.target.value)} /><select aria-label="Lọc loại gói tập" className={inputCls} value={type} onChange={event => setType(event.target.value)}><option value="all">Tất cả loại gói</option>{Object.entries(PLAN_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" className={btnOutline + ' !h-11'} disabled={loading} onClick={() => setReload(value => value + 1)}><Icon name="refresh" className="text-lg" />Làm mới</button></div>
    {error && <Alert>{error}</Alert>}{walletError && <Alert type="warning">{walletError}</Alert>}{notice && <Alert type="success">{notice}</Alert>}
    {loading ? <p role="status" className="py-6 text-center text-secondary">Đang tải gói tập…</p> : <>
      <p className="text-body-sm text-slate-500">{shown.length} gói đang mở bán</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{pageItems.map(plan => {
        const paysFromWallet = usesWallet(plan)
        const insufficient = paysFromWallet && wallet && wallet.balance < plan.price
        return <article key={plan.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <PackageImage key={`${plan.id}:${plan.imageUrl ?? ''}`} plan={plan} />
          <div className="flex-1 space-y-3 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={plan.ptSessionCredits > 0 ? 'amber' : 'indigo'}>{PLAN_TYPE_LABEL[plan.planType] ?? plan.planType}</Badge><span className="text-xs text-slate-500">{duration(plan)}</span></div><div><h3 className="text-base font-bold text-slate-900">{plan.name}</h3><p className="mt-1 text-body-sm text-primary">{plan.sportName ?? 'Mọi bộ môn được gói hỗ trợ'}</p></div>
            {plan.description && <p className="text-body-sm text-slate-500">{plan.description}</p>}
            <ul className="space-y-1.5 text-body-sm text-slate-600">{plan.includesGymAccess && <li>✓ Tự tập tại trung tâm trong thời hạn gói</li>}{plan.includesClasses && <li>✓ Tham gia lớp nhóm thuộc quyền lợi gói</li>}{plan.ptSessionCredits > 0 && <li>✓ {plan.ptSessionCredits} buổi PT cá nhân</li>}</ul>
            <div className="border-t border-slate-100 pt-3"><p className="text-xl font-bold text-primary">{money(plan.price)}</p><p className="mt-1 text-xs text-slate-500">{paysFromWallet ? 'Trừ trực tiếp số dư khi xác nhận' : 'Thanh toán chuyển khoản qua QR'}</p></div>
            {insufficient && <p className="text-xs text-amber-800">Cần nạp thêm {money(plan.price - wallet.balance)} để mua gói.</p>}
          </div>
          <div className="border-t border-slate-100 bg-slate-50/60 p-3"><button type="button" className={btnPrimary + ' w-full'} disabled={paysFromWallet && (!wallet || insufficient)} onClick={() => { setNotice(''); setSelected(plan) }}>Đăng ký gói này</button></div>
        </article>
      })}</div>
      {pagination}
      {!error && !shown.length && <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-body-sm text-slate-500">{plans.length ? 'Không có gói khớp bộ lọc.' : 'Hiện chưa có gói tập nào đang mở bán.'}</p>}
    </>}
    {selected && (usesWallet(selected) ? <CommerceConfirm intent={{ title: `Mua gói “${selected.name}”`, confirmLabel: 'Thanh toán và đăng ký gói', description: isSelfPractice(selected) ? `Tự tập · ${selected.sportName ?? 'Mọi bộ môn'} · ${duration(selected)}.` : `${selected.ptSessionCredits} buổi PT · ${duration(selected)}.`, price: selected.price, balance: wallet?.balance,
      policy: isSelfPractice(selected)
        ? 'Trừ số dư và xác nhận gói trong cùng giao dịch. Gói bắt đầu hôm nay; nếu gói này còn hạn, thời hạn mới nối tiếp sau ngày hết hạn. Hệ thống kiểm tra lại giá và số dư khi xác nhận.'
        : 'Gói được kích hoạt từ ngày mua theo giờ Việt Nam. Mua gói chưa giữ giờ tập; sau khi mua, chọn lịch PT và dùng Gói đã mua. Backend kiểm tra lại giá và số dư khi xác nhận.',
      path: isSelfPractice(selected) ? `/membership-plans/${selected.id}/purchase` : `/pt/packages/${selected.id}/purchase`, body: { memberId: null, expectedPrice: selected.price }, voucherKind: isSelfPractice(selected) ? 'Membership' : 'PtPackage',
      errorMessage: err => isSelfPractice(selected) && (err.status === 405 || err.status === 404 && err.errorCode !== 'PLAN_NOT_FOUND')
        ? 'Backend đang chạy chưa hỗ trợ mua gói tự tập bằng số dư. Cần cập nhật Backend để dùng chức năng này.' : err.message,
    }} onClose={() => setSelected(null)} onDone={bought} />
      : <SubscribeModal plan={selected} onClose={() => setSelected(null)} />)}
  </section>
}
