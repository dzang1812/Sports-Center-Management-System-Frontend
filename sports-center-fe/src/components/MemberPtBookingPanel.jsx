import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, formatDate, fromTimeOnly } from '../dateUtils'
import { Avatar, Field, Icon, btnOutline, btnPrimary, inputCls } from './ui'
import CoachProfileButton from './CoachProfile'

const money = value => `${Number(value).toLocaleString('vi-VN')}đ`
const card = 'rounded-2xl border border-outline-variant/50 bg-white'
const heading = (number, title) => <h2 className="flex items-center gap-2 font-semibold"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary text-sm">{number}</span>{title}</h2>

function CoachPortrait({ coach }) {
  const [broken, setBroken] = useState(false)
  const initials = coach.fullName.trim().split(/\s+/).slice(-2).map(word => word[0]).join('')
  return <div className="relative h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-50 to-slate-200">
    {coach.avatarUrl && !broken
      ? <img src={coach.avatarUrl} alt={coach.fullName} onError={() => setBroken(true)} className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
      : <div className="flex h-full flex-col items-center justify-center gap-2 text-indigo-800"><span className="flex h-20 w-20 items-center justify-center rounded-full border border-white bg-white/70 text-3xl font-bold shadow-sm">{initials}</span><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Huấn luyện viên</span></div>}
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/35 to-transparent" />
  </div>
}

function CoachShowcase({ coaches, loading, selected, onSelect, search, onSearch, sport, onSport, sports, total }) {
  const gallery = useRef(null)
  const move = direction => {
    const element = gallery.current
    if (element) element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: 'smooth' })
  }
  return <section className={card + ' overflow-hidden shadow-sm'} aria-label="Chọn huấn luyện viên">
    <div className="relative overflow-hidden bg-slate-900 px-5 py-5 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">TẬP RIÊNG CÙNG COACH</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Chọn người đồng hành của bạn</h2>
          <p className="mt-1.5 text-body-sm text-slate-300">Tìm hiểu HLV, xem hành trình học viên rồi chọn giờ tập phù hợp.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-body-sm font-semibold text-white"><Icon name="fitness_center" className="text-lg text-indigo-300" />{loading ? 'Đang tải HLV…' : `${total} huấn luyện viên`}</span>
      </div>
    </div>
    <div className="p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[180px] flex-1"><Icon name="search" className="pointer-events-none absolute left-3 top-3 text-xl text-slate-400" /><input aria-label="Tìm huấn luyện viên" className={inputCls + ' !pl-10'} placeholder="Tìm tên HLV hoặc bộ môn…" value={search} onChange={event => onSearch(event.target.value)} /></div>
        <select aria-label="Lọc bộ môn của HLV" className={inputCls + ' !w-auto max-w-full sm:min-w-44'} value={sport} onChange={event => onSport(event.target.value)}><option value="all">Tất cả bộ môn</option>{sports.map(name => <option key={name}>{name}</option>)}</select>
        <div className="flex gap-2">
          <button type="button" aria-label="Xem HLV phía trước" onClick={() => move(-1)} disabled={loading || !coaches.length} className={btnOutline + ' !h-10 !w-10 !p-0'}><Icon name="chevron_left" /></button>
          <button type="button" aria-label="Xem HLV tiếp theo" onClick={() => move(1)} disabled={loading || !coaches.length} className={btnOutline + ' !h-10 !w-10 !p-0'}><Icon name="chevron_right" /></button>
        </div>
      </div>
      <div ref={gallery} tabIndex={0} role="region" aria-label="Danh sách huấn luyện viên" aria-busy={loading} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 px-1 -mx-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-xl">
        {loading ? <p role="status" className="py-10 text-secondary">Đang tải HLV…</p> : coaches.map(item => {
          const active = selected?.id === item.id
          return <article key={item.id} className={`group relative flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-xl border bg-white sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)] ${active ? 'border-primary-container ring-2 ring-primary-container shadow-md' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'} transition-shadow`}>
            <button type="button" aria-label={`Chọn HLV ${item.fullName}`} aria-pressed={active} onClick={() => onSelect(item)} className="flex flex-1 flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2">
              <div className="relative w-full"><CoachPortrait key={`${item.id}:${item.avatarUrl ?? ''}`} coach={item} />
                {active && <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary-container py-1 pl-1.5 pr-2 text-[11px] font-bold text-white shadow"><Icon name="check_circle" className="text-base" />Đã chọn</span>}
                <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-primary shadow-sm">{item.sports.map(specialty => specialty.name).join(' · ') || 'Huấn luyện cá nhân'}</span>
              </div>
              <div className="w-full p-3 space-y-1.5"><h3 className="truncate text-lg font-bold text-slate-900" title={item.fullName}>{item.fullName}</h3>
                <p className="min-h-8 line-clamp-2 text-body-sm leading-4 text-slate-500">{item.bio || 'Xem hồ sơ để tìm hiểu thêm về huấn luyện viên.'}</p>
              </div>
            </button>
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5"><CoachProfileButton coach={item} className="inline-flex items-center gap-1 text-body-sm">Hồ sơ & ảnh học viên<Icon name="arrow_outward" className="text-sm" /></CoachProfileButton><Icon name={active ? 'check_circle' : 'add_circle_outline'} className={`text-xl ${active ? 'text-primary' : 'text-slate-300'}`} /></div>
          </article>
        })}
        {!loading && !coaches.length && <p className="w-full rounded-xl bg-slate-50 py-8 text-center text-body-sm text-secondary">{total ? 'Không tìm thấy HLV phù hợp. Thử tên hoặc bộ môn khác.' : 'Chưa có HLV nhận lịch PT.'}</p>}
      </div>
      {selected ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3"><p className="text-sm text-slate-600">Bạn đang chọn <strong className="font-bold text-primary">{selected.fullName}</strong><span className="block sm:inline sm:ml-2 text-body-sm">Tiếp tục chọn ngày và giờ tập bên dưới.</span></p><span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary"><Icon name="south" className="text-base" />Bước 2 · Chọn giờ tập</span></div>
        : <p className="flex items-center gap-2 text-body-sm text-slate-500"><Icon name="touch_app" className="text-lg text-primary" />Chạm vào thẻ HLV để chọn, hoặc mở hồ sơ để tìm hiểu trước.</p>}
    </div>
  </section>
}

export default function MemberPtBookingPanel({ coaches, coachesLoading, coach, sportId, onCoachChange, onSportChange,
  range, onRangeChange, slots, loading, onRefresh, selectedSlot, onSlotChange, wallet, prices,
  fundingSource, onFundingChange, onContinue, staff = false, memberId = null, counterPending = false }) {
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState('all')
  const [day, setDay] = useState(null)
  const sports = [...new Set(coaches.flatMap(item => item.sports.map(sport => sport.name)))].sort()
  const shownCoaches = coaches.filter(item => (sportFilter === 'all' || item.sports.some(sport => sport.name === sportFilter))
    && `${item.fullName} ${item.sports.map(sport => sport.name).join(' ')}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')))
  const dates = [...new Set(slots.map(slot => slot.date))].sort()
  const activeDay = dates.includes(day) ? day : dates[0]
  const daySlots = slots.filter(slot => slot.date === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime))
  const selectedSport = coach?.sports.find(sport => String(sport.id) === String(sportId))
  const rate = prices.find(price => String(price.id) === String(sportId))?.ptSinglePrice
  const usingWallet = fundingSource === 'Wallet'
  const payingMoney = fundingSource !== 'PackageCredit'
  const insufficient = usingWallet && selectedSlot && rate != null && wallet != null && wallet.balance < rate
  const canContinue = selectedSlot && !loading && !counterPending && (!payingMoney || (rate != null && (!usingWallet || (wallet != null && !insufficient))))
  const paymentMethods = staff ? [['Cash', 'Tiền mặt'], ['BankTransfer', 'Chuyển khoản'], ['Wallet', 'Số dư'], ['PackageCredit', 'Gói đã mua']] : [['Wallet', 'Số dư'], ['PackageCredit', 'Gói đã mua']]

  return <div className={staff ? 'grid lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start' : 'space-y-5'}>
    {staff ? <section className={card + ' overflow-hidden'} aria-label="Chọn huấn luyện viên">
      <div className="p-4 space-y-3 border-b border-outline-variant/40">
        {heading(1, 'Chọn huấn luyện viên')}
        <input aria-label="Tìm huấn luyện viên" className={inputCls} placeholder="Tìm tên HLV…" value={search} onChange={event => setSearch(event.target.value)} />
        <select aria-label="Lọc bộ môn của HLV" className={inputCls} value={sportFilter} onChange={event => setSportFilter(event.target.value)}><option value="all">Tất cả bộ môn</option>{sports.map(sport => <option key={sport}>{sport}</option>)}</select>
      </div>
      <div className="max-h-64 lg:max-h-[480px] overflow-y-auto p-2 space-y-1">
        {coachesLoading && <p role="status" className="p-4 text-body-sm text-secondary">Đang tải HLV…</p>}
        {shownCoaches.map(item => <div key={item.id} className={`rounded-xl border transition-colors ${coach?.id === item.id ? 'border-primary-container bg-primary-container/5' : 'border-transparent hover:bg-surface-container-low'}`}><button type="button" aria-pressed={coach?.id === item.id} onClick={() => onCoachChange(item)}
          className="w-full flex items-center gap-3 p-3 pb-1 text-left rounded-xl">
          <Avatar src={item.avatarUrl} className="h-10 w-10" /><span className="min-w-0 flex-1"><span className="block font-semibold truncate">{item.fullName}</span><span className="block text-body-sm text-secondary truncate">{item.sports.map(sport => sport.name).join(' · ')}</span></span>
          {coach?.id === item.id && <Icon name="check_circle" className="text-primary text-lg shrink-0" />}
        </button><div className="pl-16 pr-3 pb-2"><CoachProfileButton coach={item} className="text-[11px]">Xem hồ sơ HLV</CoachProfileButton></div></div>)}
        {!coachesLoading && !shownCoaches.length && <p className="p-4 text-body-sm text-secondary">{coaches.length ? 'Không tìm thấy HLV phù hợp.' : 'Chưa có HLV nhận lịch PT.'}</p>}
      </div>
    </section> : <CoachShowcase coaches={shownCoaches} loading={coachesLoading} selected={coach} onSelect={onCoachChange} search={search} onSearch={setSearch} sport={sportFilter} onSport={setSportFilter} sports={sports} total={coaches.length} />}

    <div className={`grid ${staff ? 'xl:grid-cols-[minmax(0,1fr)_280px]' : 'lg:grid-cols-[minmax(0,1fr)_320px]'} gap-5 items-start min-w-0`}>
      <section className={card + ' min-w-0 overflow-hidden'} aria-label="Chọn ngày và giờ tập">
        <div className="p-4 sm:p-5 border-b border-outline-variant/40 space-y-4">
          {heading(2, 'Chọn ngày & giờ tập')}
          {coach ? <>
            <div className="flex items-center gap-3"><Avatar src={coach.avatarUrl} className="h-10 w-10" /><div className="min-w-0"><p className="font-semibold">{coach.fullName}</p><p className="text-body-sm text-secondary">{selectedSport?.name}{rate != null ? ` · ${money(rate)}/buổi` : ''}</p></div></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><Field label="Bộ môn"><select className={inputCls} value={sportId} onChange={event => onSportChange(event.target.value)}>{coach.sports.map(sport => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</select></Field></div>
              <Field label="Từ ngày"><input className={inputCls} type="date" value={range.from} onChange={event => onRangeChange({ ...range, from: event.target.value })} /></Field>
              <Field label="Đến ngày"><input className={inputCls} type="date" value={range.to} min={range.from} max={range.from ? addDays(range.from, 31) : undefined} onChange={event => onRangeChange({ ...range, to: event.target.value })} /></Field>
            </div>
            <p className="text-xs text-secondary">Tìm giờ trống trong khoảng tối đa 31 ngày. Giờ Việt Nam.</p>
          </> : <p className="text-body-sm text-secondary">Chọn một HLV {staff ? 'bên trái' : 'phía trên'} để xem các giờ còn trống.</p>}
        </div>
        {coach ? <div className="p-4 sm:p-5 space-y-4" aria-busy={loading}>
          <div className="flex items-center justify-between gap-2"><p className="text-body-sm font-semibold">Giờ còn trống</p><button type="button" className="inline-flex items-center gap-1 text-primary text-body-sm disabled:opacity-50" disabled={loading} onClick={onRefresh}><Icon name="refresh" className="text-lg" />Làm mới</button></div>
          {loading ? <p role="status" className="py-8 text-center text-secondary">Đang tìm giờ trống…</p> : dates.length ? <>
            <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Ngày có lịch trống">{dates.map(date => <button type="button" key={date} aria-pressed={activeDay === date} onClick={() => { setDay(date); if (date !== activeDay) onSlotChange(null) }}
              className={`shrink-0 rounded-xl border px-3 py-2 text-center ${activeDay === date ? 'bg-primary-container text-white border-primary-container' : 'border-outline-variant/60 hover:bg-surface-container-low'}`}>
              <span className="block text-body-sm">{formatDate(date, { weekday: 'short' })}</span><span className="block font-semibold">{formatDate(date, { day: '2-digit', month: '2-digit' })}</span>
            </button>)}</div>
            <p className="text-body-sm text-secondary">{formatDate(activeDay, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} · {daySlots.length} giờ trống</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2">{daySlots.map(slot => {
              const selected = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime
              return <button type="button" key={slot.date + slot.startTime} aria-pressed={selected} onClick={() => onSlotChange(slot)}
                className={`rounded-xl border py-3 px-2 font-semibold text-body-sm ${selected ? 'border-primary-container bg-primary-container/10 text-primary ring-1 ring-primary-container' : 'border-outline-variant/60 hover:border-primary-container hover:bg-surface-container-low'}`}>
                {fromTimeOnly(slot.startTime)}–{fromTimeOnly(slot.endTime)}{selected && <span className="block text-xs font-normal mt-1">Đã chọn</span>}
              </button>
            })}</div>
          </> : <div className="py-6 text-center space-y-3"><Icon name="event_busy" className="text-3xl text-outline" /><p className="text-body-sm text-secondary">Chưa có giờ trống trong khoảng này.<br />Thử ngày khác hoặc chọn HLV khác.</p><button type="button" className={btnOutline} onClick={() => onRangeChange({ from: addDays(range.from, 7), to: addDays(range.to, 7) })} disabled={!range.from || !range.to}>Xem tuần tiếp theo</button></div>}
        </div> : <div className="py-12 text-center text-outline"><Icon name="calendar_month" className="text-5xl" /></div>}
      </section>

      <aside className={card + ' overflow-hidden xl:sticky xl:top-20'} aria-label="Thông tin đặt PT">
        <div className="p-4 border-b border-outline-variant/40">{heading(3, staff ? 'Thu tiền & xác nhận' : 'Xác nhận buổi tập')}</div>
        <div className="p-4 space-y-4">
          {selectedSlot ? <div className="rounded-xl bg-surface-container-low p-3 space-y-1 text-body-sm"><p className="font-semibold">{coach.fullName}</p><p className="text-secondary">{selectedSport?.name}</p><p>{formatDate(selectedSlot.date, { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</p><p className="font-semibold text-primary">{fromTimeOnly(selectedSlot.startTime)}–{fromTimeOnly(selectedSlot.endTime)}</p></div>
            : <p className="text-body-sm text-secondary">Chọn một giờ trống để xem chi tiết và thanh toán.</p>}
          <div className="space-y-2"><p className="text-body-sm font-semibold">Thanh toán bằng</p><div className="grid grid-cols-2 gap-2">
            {paymentMethods.map(([value, label]) => <button type="button" key={value} aria-pressed={fundingSource === value} onClick={() => onFundingChange(value)} className={`rounded-lg border px-2 py-2 text-body-sm ${fundingSource === value ? 'border-primary-container bg-primary-container/5 text-primary font-semibold' : 'border-outline-variant/60 text-secondary'}`}>{label}</button>)}
          </div></div>
          {payingMoney ? <div className="space-y-2 text-body-sm">
            <div className="flex justify-between gap-2"><span className="text-secondary">Tiền buổi tập</span><b>{selectedSlot && rate != null ? money(rate) : '—'}</b></div>
            {usingWallet && <div className="flex justify-between gap-2"><span className="text-secondary">Số dư hiện tại</span><span>{wallet ? money(wallet.balance) : '—'}</span></div>}
            {usingWallet && selectedSlot && wallet && rate != null && !insufficient && <div className="flex justify-between gap-2 border-t border-outline-variant/40 pt-2"><span className="text-secondary">Sau thanh toán</span><span>{money(wallet.balance - rate)}</span></div>}
            {fundingSource === 'Cash' && <p className="text-secondary">Xác nhận sau khi đã nhận đủ tiền mặt từ hội viên.</p>}
            {fundingSource === 'BankTransfer' && <p className="text-secondary">Tạo mã QR để khách quét. Hoàn tất đặt lịch sau khi thanh toán được xác nhận.</p>}
            {insufficient && <p role="status" className="text-error">Cần nạp thêm {money(rate - wallet.balance)} để đặt buổi này.</p>}
            {selectedSlot && !loading && rate == null && <p role="status" className="text-error">Bộ môn này chưa có giá PT. Vui lòng liên hệ trung tâm.</p>}
          </div> : <p className="text-body-sm text-secondary">Dùng 1 buổi từ gói PT đúng bộ môn, còn hạn tại ngày tập và còn buổi. Không trừ số dư.</p>}
          <button type="button" className={btnPrimary + ' w-full'} disabled={!canContinue} onClick={() => onContinue(selectedSlot)}>{fundingSource === 'Cash' ? 'Thu tiền mặt' : fundingSource === 'BankTransfer' ? 'Tạo mã QR' : usingWallet ? 'Tiếp tục thanh toán' : 'Xác nhận dùng gói'}<Icon name="arrow_forward" className="text-lg" /></button>
          {counterPending && <p role="status" className="text-body-sm text-secondary">Hoàn tất yêu cầu đang chờ ở trên trước khi đặt buổi mới.</p>}
          <Link className="block text-center text-body-sm text-primary hover:underline" to={staff ? `/reception/members/${memberId}${payingMoney ? '?tab=wallet' : ''}` : usingWallet ? '/member/wallet' : '/member/subscription'}>{staff ? payingMoney ? 'Số dư & nạp tiền của hội viên' : 'Hồ sơ hội viên' : usingWallet ? 'Nạp tiền vào số dư' : 'Xem gói đã mua'}</Link>
          <p className="text-xs text-secondary leading-relaxed">Chọn giờ chưa giữ chỗ. Lịch được xác nhận sau khi hoàn tất thanh toán.</p>
        </div>
      </aside>
    </div>
  </div>
}
