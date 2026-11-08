import { MemberCommerce } from '../components/commerce'
import { NewMemberModal } from '../components/frontDesk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, query } from '../api'
import { Alert, Avatar, Badge, Field, Icon, Pagination, btnOutline, btnPrimary, inputCls } from '../components/ui'
import { BookingSchedule } from './MyMemberSchedulePage'
import { MemberTierBadge } from '../components/MemberTier'
import SendVoucherModal from '../components/SendVoucherModal'

// Search-only directory: ID / tên / email / SĐT đều khớp qua cùng 1 ô (GET /members?q=), chọn 1 dòng để xem chi tiết.
function MemberDirectory() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(null)

  const load = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await api(`/members${query({ q, page, pageSize })}`, { signal: controller.signal })
      if (!controller.signal.aborted) setData(result)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message)
    }
    if (!controller.signal.aborted) setLoading(false)
  }, [q, page, pageSize])
  const stop = useCallback(() => request.current?.abort(), [])

  // Debounce so we don't call the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => { clearTimeout(t); stop() }
  }, [load, stop])

  useEffect(() => {
    setPage(1)
  }, [q])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-container rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <Field label="Tìm hội viên">
            <input className={inputCls} placeholder="Mã hội viên, tên, email hoặc số điện thoại…" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
        <button type="button" className={btnPrimary} onClick={() => setCreating(true)}>
          <Icon name="person_add" className="text-lg" />
          Đăng ký hội viên mới
        </button>
      </div>
      {creating && <NewMemberModal onClose={() => setCreating(false)} onDone={(m) => navigate(`/reception/members/${m.id}`)} />}

      {error && <Alert>{error}</Alert>}

      <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={loading ? 'opacity-50' : ''}>
            {data.items.map((m) => (
              <tr key={m.id} className="border-t border-surface-container cursor-pointer hover:bg-surface-container" onClick={() => navigate(`/reception/members/${m.id}`)}>
                <td className="px-4 py-3 text-secondary">#{m.id}</td>
                <td className="px-4 py-3 font-semibold">{m.fullName}</td>
                <td className="px-4 py-3 text-secondary">{m.email}</td>
                <td className="px-4 py-3 text-secondary">{m.phone ?? '—'}</td>
                <td className="px-4 py-3"><Badge tone={m.isActive ? 'green' : 'red'}>{m.isActive ? 'Hoạt động' : 'Đã khoá'}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/reception/members/${m.id}`} className={btnOutline + ' !h-8 !px-2'} onClick={(e) => e.stopPropagation()} title="Xem chi tiết">
                    <Icon name="chevron_right" className="text-base" />
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && !data.items.length && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-secondary">Không tìm thấy hội viên phù hợp.</td></tr>
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
    </div>
  )
}

function ReceptionMemberContent({ id }) {
  const [params, setParams] = useSearchParams()
  const tab = ['schedule', 'wallet'].includes(params.get('tab')) ? params.get('tab') : 'courses'
  const available = tab === 'courses' && params.get('view') === 'available'
  const [member, setMember] = useState(null)
  const [sendingVoucher, setSendingVoucher] = useState(false)
  const [voucherNotice, setVoucherNotice] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState('')
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    api(`/members${query({ q: id, pageSize: 50 })}`, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        const person = result.items.find(item => String(item.id) === String(id))
        if (person) setMember(person)
        else setError('Không tìm thấy hội viên. Vui lòng quay lại danh sách để chọn lại.')
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id])

  if (!id) return <div className="space-y-5"><div><h1 className="font-headline-xl text-headline-xl">Danh sách hội viên</h1><p className="text-secondary mt-2">Tìm hội viên để xem khóa học, lịch tập hoặc nạp tiền.</p></div><MemberDirectory /></div>
  return <div className="max-w-[1440px] mx-auto space-y-5">
    <Link to="/reception/members" className="inline-flex items-center gap-1 text-body-sm text-secondary hover:text-primary"><Icon name="arrow_back" className="text-lg" />Danh sách hội viên</Link>
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white border border-outline-variant/50 p-4 sm:p-5">
      <div className="flex items-center gap-3 min-w-0"><Avatar src={member?.avatarUrl} className="h-12 w-12" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="font-headline-lg text-headline-lg">{member?.fullName ?? 'Chi tiết hội viên'}</h1>{member && <Badge tone={member.isActive ? 'green' : 'red'}>{member.isActive ? 'Hoạt động' : 'Đã khóa'}</Badge>}{member && <MemberTierBadge memberId={id} />}</div><p className="text-body-sm text-secondary break-words mt-1">Mã hội viên #{id}{member?.email ? ` · ${member.email}` : ''}{member?.phone ? ` · ${member.phone}` : ''}</p></div></div>
      {member && <div className="flex flex-wrap gap-2"><button type="button" className={btnOutline} onClick={() => setSendingVoucher(true)}><Icon name="redeem" className="text-lg" />Gửi voucher</button><Link className={btnOutline} to={`/reception/pt?memberId=${id}`}>Đặt PT</Link><button type="button" className={btnPrimary} onClick={() => setParams({ tab: 'courses', view: 'available' })}><Icon name="add" className="text-lg" />Đăng ký khóa học</button></div>}
    </header>
    {voucherNotice && <Alert type="success">{voucherNotice}</Alert>}
    {sendingVoucher && <SendVoucherModal memberId={id} memberName={member?.fullName} onClose={() => setSendingVoucher(false)} onSent={v => { setSendingVoucher(false); setVoucherNotice(`Đã gửi voucher ${v.code} cho ${member?.fullName ?? 'hội viên'}.`) }} />}
    {error && <Alert>{error}</Alert>}{loading && <p role="status" className="text-secondary">Đang tải thông tin hội viên…</p>}
    {member && <>
      <nav aria-label="Chi tiết hội viên" className="flex flex-wrap gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
        {[['courses', 'school', 'Khóa học'], ['schedule', 'calendar_month', 'Lịch tập'], ['wallet', 'account_balance_wallet', 'Số dư & nạp tiền']].map(([value, icon, label]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => setParams(value === 'courses' ? {} : { tab: value })} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-body-sm font-semibold ${tab === value ? 'bg-primary-container text-white' : 'text-secondary hover:bg-surface-container'}`}><Icon name={icon} className="text-lg" />{label}</button>)}
      </nav>
      {tab === 'courses' && <div className="space-y-4">
        {available && <button type="button" className="inline-flex items-center gap-1 text-body-sm text-primary" onClick={() => setParams({})}><Icon name="arrow_back" className="text-lg" />Khóa của hội viên</button>}
        <MemberCommerce key={`${id}:${available ? 'catalog' : 'enrollments'}`} memberId={id} viewMode={available ? 'catalog' : 'enrollments'} embedded />
      </div>}
      {tab === 'schedule' && <BookingSchedule memberId={id} presentation="member" />}
      {tab === 'wallet' && <MemberCommerce key={`${id}:wallet`} memberId={id} viewMode="wallet" embedded />}
    </>}
  </div>
}

export default function ReceptionMemberPage() {
  const { id } = useParams()
  // Clear the selected member, forms and pending actions immediately when switching members.
  return <ReceptionMemberContent key={id ?? 'directory'} id={id} />
}
