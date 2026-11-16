import { useEffect, useState } from 'react'
import { api } from '../api'
import { Icon } from './ui'

// Colors per tier (backend MemberTier enum, serialized as strings).
const TIER_STYLE = {
  New: { chip: 'bg-slate-100 text-slate-700 border-slate-200', card: 'from-slate-700 to-slate-900', icon: 'person' },
  Loyal: { chip: 'bg-sky-50 text-sky-700 border-sky-200', card: 'from-sky-600 to-sky-900', icon: 'favorite' },
  Bronze: { chip: 'bg-orange-50 text-orange-800 border-orange-200', card: 'from-orange-700 to-amber-900', icon: 'military_tech' },
  Silver: { chip: 'bg-zinc-100 text-zinc-700 border-zinc-300', card: 'from-zinc-400 to-zinc-700', icon: 'military_tech' },
  Gold: { chip: 'bg-amber-50 text-amber-800 border-amber-300', card: 'from-amber-500 to-yellow-700', icon: 'workspace_premium' },
  Diamond: { chip: 'bg-violet-50 text-violet-700 border-violet-300', card: 'from-violet-600 to-indigo-900', icon: 'diamond' },
}
const vnd = (n) => `${Number(n).toLocaleString('vi-VN')}đ`
export const TIER_NAME = { New: 'Hội viên mới', Loyal: 'Thân thiết', Bronze: 'Đồng', Silver: 'Bạc', Gold: 'Vàng', Diamond: 'Kim cương' }

// Reloads after any API mutation (e.g. a purchase) so an upgrade shows without a page refresh.
function useTier(path) {
  const [tier, setTier] = useState(null)
  useEffect(() => {
    const load = () => api(path).then(setTier).catch(() => setTier(null))
    load()
    window.addEventListener('sc:api-mutated', load)
    return () => window.removeEventListener('sc:api-mutated', load)
  }, [path])
  return tier
}

// Small chip: a member's own tier (no memberId, e.g. next to the logo) or, for staff, a given member's tier.
export function MemberTierBadge({ memberId }) {
  const tier = useTier(memberId ? `/members/${memberId}/tier` : '/me/tier')
  if (!tier) return null
  const s = TIER_STYLE[tier.tier] ?? TIER_STYLE.New
  return <span title={`Tổng chi tiêu ${vnd(tier.lifetimeSpend)}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${s.chip}`}><Icon name={s.icon} className="text-sm" />{tier.tierName}</span>
}

// Member's own tier card with progress to the next tier and the full ladder.
export function MemberTierCard() {
  const tier = useTier('/me/tier')
  if (!tier) return null
  const s = TIER_STYLE[tier.tier] ?? TIER_STYLE.New
  const current = tier.tiers.find(t => t.tier === tier.tier)
  const pct = tier.nextTierMinSpend ? Math.min(100, ((tier.lifetimeSpend - current.minSpend) / (tier.nextTierMinSpend - current.minSpend)) * 100) : 100
  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-white shadow-sm">
      <div className={`bg-gradient-to-br ${s.card} p-5 text-white`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"><Icon name={s.icon} className="text-3xl" /></span>
            <div><p className="text-xs uppercase tracking-widest text-white/70">Hạng hội viên</p><p className="text-2xl font-bold">{tier.tierName}</p></div>
          </div>
          <div className="text-right"><p className="text-xs text-white/70">Tổng chi tiêu</p><p className="text-lg font-bold">{vnd(tier.lifetimeSpend)}</p></div>
        </div>
        <div className="mt-4">
          <div className="h-2 rounded-full bg-white/20" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ lên hạng tiếp theo"><div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-sm text-white/85">{tier.nextTierName ? <>Chi tiêu thêm <b>{vnd(tier.remainingToNext)}</b> để lên hạng <b>{tier.nextTierName}</b>.</> : 'Bạn đã đạt hạng cao nhất. Cảm ơn bạn đã đồng hành cùng FitZone!'}</p>
        </div>
      </div>
      <ol className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-slate-100 text-center text-xs">
        {tier.tiers.map(t => {
          const reached = tier.lifetimeSpend >= t.minSpend
          return <li key={t.tier} className={`bg-white px-2 py-3 ${t.tier === tier.tier ? 'font-bold text-slate-900' : reached ? 'text-slate-700' : 'text-slate-400'}`}>
            <Icon name={(TIER_STYLE[t.tier] ?? TIER_STYLE.New).icon} className="text-lg" /><p>{t.name}</p><p className="mt-0.5 font-normal">{t.minSpend ? `từ ${vnd(t.minSpend)}` : 'mặc định'}</p>
          </li>
        })}
      </ol>
      <p className="px-5 py-3 text-xs text-secondary">Hạng được tính theo tổng số tiền đã chi cho gói tập, khóa học và PT (đã trừ khoản hoàn tiền; tiền nạp ví chưa sử dụng không tính). Hạng không bị hạ.</p>
    </section>
  )
}
