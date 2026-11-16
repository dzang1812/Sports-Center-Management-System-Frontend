import { Link, useSearchParams } from 'react-router-dom'
import { MemberCommerce } from '../components/commerce'
import { Icon, btnPrimary } from '../components/ui'
import MemberSubscriptionPage from './MemberSubscriptionPage'
import MemberVouchersPage from './MemberVouchersPage'

const TABS = [
  ['balance', 'account_balance_wallet', 'Số dư & lịch sử'],
  ['packages', 'card_membership', 'Gói đã mua'],
  ['vouchers', 'confirmation_number', 'Ưu đãi'],
]

export default function MemberWalletPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([value]) => value === params.get('tab')) ? params.get('tab') : 'balance'
  const select = value => {
    const next = new URLSearchParams(params)
    if (value === 'balance') next.delete('tab')
    else next.set('tab', value)
    setParams(next)
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="font-headline-xl text-headline-xl">Ví & gói tập</h1><p className="text-secondary mt-1">Nạp tiền, quản lý gói đã mua và xem ưu đãi tại một nơi.</p></div>
      <Link className={btnPrimary} to="/member/classes?type=packages"><Icon name="add" className="text-lg" />Đăng ký gói tập</Link>
    </div>
    <nav aria-label="Quản lý ví và gói tập" className="flex flex-wrap gap-1 w-fit rounded-xl bg-surface-container-low p-1">
      {TABS.map(([value, icon, label]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => select(value)}
        className={`flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-body-sm font-semibold transition-colors ${tab === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container-high'}`}>
        <Icon name={icon} className="text-lg" />{label}
      </button>)}
    </nav>
    {tab === 'balance' && <MemberCommerce embedded viewMode="wallet" />}
    {tab === 'packages' && <MemberSubscriptionPage embedded />}
    {tab === 'vouchers' && <MemberVouchersPage embedded />}
  </div>
}
