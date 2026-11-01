import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, query } from '../api'
import { MemberLookupField } from './booking'
import { Alert, Avatar, Badge, Icon } from './ui'

function SelectedMember({ memberId, onChange, children }) {
  const [member, setMember] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    api(`/members${query({ q: memberId, pageSize: 50 })}`, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        const person = result.items.find(item => String(item.id) === String(memberId))
        if (person) setMember(person)
        else setError('Không tìm thấy hội viên. Vui lòng chọn lại.')
      }).catch(err => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [memberId])
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-container/30 bg-white p-4">
      {member ? <div className="flex items-center gap-3 min-w-0"><Avatar src={member.avatarUrl} className="h-10 w-10" /><div className="min-w-0"><p className="font-semibold">{member.fullName} <span className="text-secondary font-normal">#{member.id}</span></p><p className="text-secondary text-body-sm break-words">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p></div><Badge tone={member.isActive ? 'green' : 'red'}>{member.isActive ? 'Hoạt động' : 'Đã khóa'}</Badge></div>
        : <p role="status" className="text-body-sm text-secondary">{error ? 'Chưa chọn được hội viên.' : 'Đang xác minh hội viên…'}</p>}
      <div className="flex gap-3 items-center text-body-sm"><button type="button" className="text-primary font-semibold" onClick={() => onChange('')}>Đổi hội viên</button>{member && <Link className="inline-flex items-center gap-1 text-secondary hover:text-primary" to={`/reception/members/${member.id}`}>Hồ sơ<Icon name="arrow_forward" className="text-base" /></Link>}</div>
    </div>
    {error && <Alert>{error}</Alert>}
    {member && children?.(member)}
  </div>
}

export default function ReceptionMemberPicker({ memberId, onChange, children }) {
  return memberId ? <SelectedMember key={memberId} memberId={memberId} onChange={onChange}>{children}</SelectedMember>
    : <div className="rounded-2xl border border-outline-variant/50 bg-white p-4 sm:p-5 space-y-2"><h2 className="font-semibold mb-3">Chọn hội viên để bắt đầu</h2><MemberLookupField onSelect={onChange} /><p className="text-body-sm text-secondary">Tìm theo tên, mã hội viên, email hoặc số điện thoại.</p></div>
}
