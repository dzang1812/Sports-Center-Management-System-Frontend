import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { Alert, Avatar, Badge, Icon, Modal, btnOutline } from './ui'
import { CoachReviewList } from './CoachRating'

function ShowcasePhoto({ src, label }) {
  const [failed, setFailed] = useState(false)
  return <figure className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    <figcaption className="px-3 py-2 text-sm font-bold text-slate-700">{label}</figcaption>
    {failed ? <p className="aspect-[3/4] flex items-center justify-center px-3 text-center text-body-sm text-secondary">Không tải được ảnh.</p>
      : <img src={src} alt={`${label} của học viên do HLV hướng dẫn`} loading="lazy" decoding="async" onError={() => setFailed(true)} className="aspect-[3/4] w-full object-contain bg-slate-100" />}
  </figure>
}

export function CoachProfileContent({ profile, preview = false }) {
  const photos = profile.studentBeforeImageUrl && profile.studentAfterImageUrl && (profile.studentPhotoConsentConfirmed || preview)
  return <div className="space-y-5">
    <div className="flex items-center gap-3"><Avatar src={profile.avatarUrl} className="h-16 w-16" /><div className="min-w-0"><h3 className="text-xl font-bold text-slate-900">{profile.fullName}</h3>
      <div className="flex flex-wrap gap-1.5 mt-2">{profile.experienceYears != null && <Badge tone="indigo">{profile.experienceYears} năm kinh nghiệm</Badge>}{(profile.sports ?? []).map(sport => <Badge key={sport.id} tone="green">{sport.name}</Badge>)}</div>
    </div></div>
    <section><h4 className="font-semibold mb-1">Giới thiệu & kinh nghiệm</h4><p className="whitespace-pre-line text-sm leading-6 text-slate-600 break-words">{profile.bio || 'HLV chưa cập nhật phần giới thiệu.'}</p></section>
    {profile.certifications && <section><h4 className="font-semibold mb-1 flex items-center gap-1.5"><Icon name="workspace_premium" className="text-lg text-primary" />Chứng chỉ & chuyên môn</h4><p className="whitespace-pre-line text-sm leading-6 text-slate-600 break-words">{profile.certifications}</p></section>}
    <section className="space-y-3 border-t border-slate-100 pt-4"><div><h4 className="font-semibold">Hành trình học viên</h4><p className="text-body-sm text-secondary mt-1">Hình ảnh và mô tả do HLV chia sẻ.</p></div>
      {photos ? <><div className="grid grid-cols-2 gap-3"><ShowcasePhoto key={profile.studentBeforeImageUrl} src={profile.studentBeforeImageUrl} label="Trước tập" /><ShowcasePhoto key={profile.studentAfterImageUrl} src={profile.studentAfterImageUrl} label="Sau tập" /></div>
        {profile.studentResultSummary && <p className="text-sm leading-6 text-slate-600 whitespace-pre-line break-words">{profile.studentResultSummary}</p>}</>
        : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">HLV chưa chia sẻ cặp ảnh trước và sau tập.</p>}
    </section>
  </div>
}

function CoachProfileDialog({ coachId, coach, onClose }) {
  const fallbackCoach = useRef(coach)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        let result
        try { result = await api(`/coaches/${coachId}/profile`, { signal: controller.signal }) }
        catch (err) {
          if (err.status !== 404) throw err
          // Keep the existing coach bio usable while EC2 is being updated; never fabricate a result photo.
          const coaches = await api('/pt/coaches', { signal: controller.signal })
          result = coaches.find(item => String(item.id) === String(coachId)) ?? fallbackCoach.current
          if (!result?.fullName) throw err
        }
        if (!controller.signal.aborted) setProfile(result)
      } catch (err) { if (!controller.signal.aborted) setError(err.message) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [coachId])
  return <Modal title="Hồ sơ huấn luyện viên" onClose={onClose} footer={<button type="button" className={btnOutline} onClick={onClose}>Đóng</button>}>
    {loading && <p role="status" className="text-secondary text-sm">Đang tải hồ sơ HLV…</p>}{error && <Alert>{error}</Alert>}
    {profile && <CoachProfileContent profile={profile} />}
    {profile && <div className="mt-5"><CoachReviewList coachId={coachId} /></div>}
  </Modal>
}

export default function CoachProfileButton({ coachId, coach = null, children = 'Xem hồ sơ HLV', className = '' }) {
  const [open, setOpen] = useState(false)
  const id = coachId ?? coach?.id
  if (!id) return null
  return <><button type="button" className={`text-primary font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded ${className}`} aria-label={`Xem hồ sơ HLV${coach?.fullName ? ` ${coach.fullName}` : ''}`} onClick={() => setOpen(true)}>{children}</button>
    {open && <CoachProfileDialog key={id} coachId={id} coach={coach} onClose={() => setOpen(false)} />}
  </>
}
