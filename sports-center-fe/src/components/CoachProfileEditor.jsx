import { useEffect, useRef, useState } from 'react'
import { api, apiUpload } from '../api'
import { Alert, Field, Icon, Modal, btnOutline, btnPrimary, inputCls } from './ui'
import { CoachProfileContent } from './CoachProfile'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
function PhotoField({ label, url, disabled, onUpload }) {
  return <div className="space-y-2"><p className="text-sm font-semibold">{label}</p><div className="aspect-[3/4] max-h-52 rounded-xl border border-dashed border-outline-variant overflow-hidden bg-slate-50 flex items-center justify-center">
    {url ? <img src={url} alt={label} className="h-full w-full object-contain" /> : <Icon name="add_photo_alternate" className="text-4xl text-slate-400" />}
  </div><label className={`${btnOutline} w-full !text-xs cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>{url ? 'Thay ảnh' : 'Chọn ảnh'}<input type="file" accept={IMAGE_TYPES.join(',')} disabled={disabled} onChange={onUpload} className="sr-only" /></label></div>
}

export default function CoachProfileEditor() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState('')
  const [preview, setPreview] = useState(false)
  const [reload, setReload] = useState(0)
  const pending = useRef(false)
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    void Promise.resolve().then(() => { if (!controller.signal.aborted) { setLoading(true); setError('') } })
    api('/me/coach-profile', { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setForm(value) })
      .catch(err => { if (!controller.signal.aborted) setError(err.status === 404 ? 'Hồ sơ chuyên môn chưa sẵn sàng. Cần cập nhật Backend để lưu kinh nghiệm và ảnh học viên.' : err.status >= 500 ? 'Chưa tải được hồ sơ HLV do máy chủ đang gặp lỗi. Vui lòng thử lại hoặc báo quản lý.' : err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { active.current = false; controller.abort() }
  }, [reload])
  const set = key => event => { setNotice(''); setForm({ ...form, [key]: event.target.value }) }
  const upload = key => async event => {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file || pending.current) return
    setError(''); setNotice('')
    if (!IMAGE_TYPES.includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) { setError('Chọn ảnh JPG, PNG, WebP hoặc GIF, tối đa 10 MB.'); return }
    pending.current = true; setUploading(key)
    try {
      const result = await apiUpload(file)
      if (active.current) setForm(current => ({ ...current, [key]: result.url, studentPhotoConsentConfirmed: false }))
    } catch (err) { if (active.current) setError(err.message) }
    finally { pending.current = false; if (active.current) setUploading('') }
  }
  const save = async event => {
    event.preventDefault()
    if (pending.current) return
    setError(''); setNotice('')
    const before = form.studentBeforeImageUrl || null, after = form.studentAfterImageUrl || null
    if (Boolean(before) !== Boolean(after)) { setError('Vui lòng chọn đủ hai ảnh trước/sau, hoặc bỏ cả hai ảnh.'); return }
    if (before && before === after) { setError('Vui lòng chọn hai ảnh trước và sau khác nhau.'); return }
    if (before && !form.studentPhotoConsentConfirmed) { setError('Cần xác nhận học viên đồng ý cho hiển thị hai ảnh này.'); return }
    const years = form.experienceYears === '' || form.experienceYears == null ? null : Number(form.experienceYears)
    if (years != null && (!Number.isInteger(years) || years < 0 || years > 80)) { setError('Số năm kinh nghiệm phải là số nguyên từ 0 đến 80.'); return }
    pending.current = true; setBusy(true)
    try {
      const saved = await api('/me/coach-profile', { method: 'PUT', body: { bio: form.bio?.trim() || null,
        certifications: form.certifications?.trim() || null, experienceYears: years,
        studentBeforeImageUrl: before, studentAfterImageUrl: after, studentResultSummary: before ? form.studentResultSummary?.trim() || null : null,
        studentPhotoConsentConfirmed: Boolean(before && form.studentPhotoConsentConfirmed) } })
      if (active.current) { setForm(saved); setNotice('Đã lưu hồ sơ HLV. Hội viên có thể xem thông tin mới khi đặt khóa học hoặc PT.') }
    } catch (err) { if (active.current) setError(err.message) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  const disabled = busy || Boolean(uploading)
  const hasPhotos = form?.studentBeforeImageUrl || form?.studentAfterImageUrl
  return <section className="rounded-xl border border-outline-variant/40 bg-white p-4 sm:p-6 space-y-4">
    <div><h2 className="text-xl font-semibold">Hồ sơ HLV & ảnh học viên</h2><p className="text-sm text-secondary mt-1">Giới thiệu chuyên môn và chia sẻ một cặp ảnh trước/sau để hội viên tham khảo trước khi đặt lịch.</p></div>
    {loading && <p role="status" className="text-sm text-secondary">Đang tải hồ sơ chuyên môn…</p>}{error && <Alert>{error}</Alert>}{notice && <Alert type="success">{notice}</Alert>}
    {!form && error && !loading && <button type="button" className={btnOutline} onClick={() => setReload(value => value + 1)}>Thử lại</button>}
    {form && <form onSubmit={save} className="space-y-4"><fieldset disabled={disabled} className="space-y-4">
      <Field label="Số năm kinh nghiệm"><input type="number" min="0" max="80" step="1" className={inputCls + ' max-w-40'} value={form.experienceYears ?? ''} onChange={set('experienceYears')} placeholder="VD: 5" /></Field>
      <Field label="Giới thiệu & kinh nghiệm"><textarea className={inputCls + ' !h-28 py-2'} maxLength={4000} value={form.bio ?? ''} onChange={set('bio')} placeholder="Kinh nghiệm huấn luyện, phương pháp và nhóm học viên phù hợp…" /></Field>
      <Field label="Chứng chỉ & chuyên môn"><textarea className={inputCls + ' !h-20 py-2'} maxLength={1000} value={form.certifications ?? ''} onChange={set('certifications')} /></Field>
      <div className="grid grid-cols-2 gap-3"><PhotoField label="Ảnh trước tập" url={form.studentBeforeImageUrl} disabled={disabled} onUpload={upload('studentBeforeImageUrl')} /><PhotoField label="Ảnh sau tập" url={form.studentAfterImageUrl} disabled={disabled} onUpload={upload('studentAfterImageUrl')} /></div>
      <p className="text-xs text-secondary">JPG, PNG, WebP hoặc GIF · tối đa 10 MB/ảnh. Ảnh chỉ hiển thị trên hồ sơ sau khi lưu.</p>
      {hasPhotos && <><Field label="Mô tả hành trình học viên"><textarea className={inputCls + ' !h-20 py-2'} maxLength={1000} value={form.studentResultSummary ?? ''} onChange={set('studentResultSummary')} placeholder="Mục tiêu, thời gian đồng hành và kết quả học viên đạt được…" /></Field>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={Boolean(form.studentPhotoConsentConfirmed)} onChange={event => setForm({ ...form, studentPhotoConsentConfirmed: event.target.checked })} /><span>Học viên đã đồng ý cho hiển thị hai ảnh này trên hồ sơ HLV.</span></label>
        <button type="button" className="text-sm text-error hover:underline" onClick={() => setForm({ ...form, studentBeforeImageUrl: null, studentAfterImageUrl: null, studentResultSummary: null, studentPhotoConsentConfirmed: false })}>Bỏ cả hai ảnh khỏi hồ sơ</button></>}
    </fieldset>
    {uploading && <p role="status" className="text-sm text-primary">Đang tải ảnh lên…</p>}
    <div className="flex flex-wrap justify-end gap-2"><button type="button" className={btnOutline} disabled={disabled} onClick={() => setPreview(true)}>Xem trước</button><button type="submit" className={btnPrimary} disabled={disabled}>{busy ? 'Đang lưu…' : 'Lưu hồ sơ HLV'}</button></div>
    </form>}
    {preview && form && <Modal title="Xem trước hồ sơ HLV — chưa lưu" onClose={() => setPreview(false)} footer={<button type="button" className={btnOutline} onClick={() => setPreview(false)}>Đóng</button>}><CoachProfileContent preview profile={form} /></Modal>}
  </section>
}
