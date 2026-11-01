import { useEffect, useRef, useState } from 'react'
import { Alert, Icon, Modal, btnOutline } from './ui'

const cameraError = error => {
  if (['NotAllowedError', 'PermissionDeniedError'].includes(error.name)) return 'Chưa được cấp quyền camera. Hãy cho phép camera trong trình duyệt rồi bấm Thử lại.'
  if (['NotFoundError', 'DevicesNotFoundError'].includes(error.name)) return 'Không tìm thấy camera. Hãy kết nối camera hoặc nhập mã thẻ thủ công.'
  if (['NotReadableError', 'TrackStartError'].includes(error.name)) return 'Không mở được camera. Hãy đóng ứng dụng khác đang dùng camera rồi thử lại.'
  return error.message || 'Không mở được camera. Vui lòng thử lại hoặc nhập mã thẻ thủ công.'
}

export default function GymQrCamera({ onScan, onClose }) {
  const video = useRef(null)
  const scanned = useRef(onScan)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('Đang mở camera…')
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    scanned.current = onScan
  }, [onScan])

  useEffect(() => {
    let cancelled = false, stream, timer
    const preview = video.current
    const stop = () => {
      clearTimeout(timer)
      stream?.getTracks().forEach(track => track.stop())
      if (preview?.srcObject === stream) preview.srcObject = null
    }
    const fail = message => {
      if (cancelled) return
      cancelled = true
      stop()
      setError(message)
    }
    const pause = () => {
      if (document.hidden) fail('Camera đã tạm dừng khi rời trang. Bấm Thử lại để quét tiếp.')
    }
    const start = async () => {
      try {
        if (cancelled) return
        setError(''); setInvalid(false); setStatus('Đang mở camera…')
        if (window.isSecureContext === false) throw new Error('Camera cần HTTPS hoặc localhost. Vui lòng mở trang bằng kết nối HTTPS.')
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Trình duyệt chưa hỗ trợ mở camera. Hãy dùng trình duyệt mới hoặc nhập mã thẻ thủ công.')
        // Load the decoder only when reception opens the camera; video stays on this device.
        const { default: decode } = await import('jsqr')
        if (cancelled) return
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
        if (cancelled) { stop(); return }
        stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => fail('Camera đã ngắt kết nối. Bấm Thử lại hoặc nhập mã thẻ thủ công.'), { once: true }))
        preview.srcObject = stream
        await preview.play()
        if (cancelled) return
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) throw new Error('Không đọc được hình ảnh camera. Hãy thử trình duyệt khác hoặc nhập mã thẻ thủ công.')
        setStatus('Đưa mã QR thẻ hội viên vào trước camera.')
        const scan = () => {
          if (cancelled) return
          try {
            if (preview.readyState >= 2 && preview.videoWidth && preview.videoHeight) {
              const scale = Math.min(1, 640 / preview.videoWidth)
              canvas.width = Math.round(preview.videoWidth * scale)
              canvas.height = Math.round(preview.videoHeight * scale)
              context.drawImage(preview, 0, 0, canvas.width, canvas.height)
              const frame = context.getImageData(0, 0, canvas.width, canvas.height)
              const result = decode(frame.data, frame.width, frame.height, { inversionAttempts: 'attemptBoth' })
              if (result) {
                const code = result.data.trim().toUpperCase()
                if (/^GYM-[0-9A-F]{32}$/.test(code)) {
                  cancelled = true
                  stop()
                  scanned.current(code)
                  return
                }
                setInvalid(true)
              }
            }
            timer = setTimeout(scan, 180)
          } catch (err) { fail(cameraError(err)) }
        }
        scan()
      } catch (err) { fail(cameraError(err)) }
    }
    document.addEventListener('visibilitychange', pause)
    void Promise.resolve().then(start)
    return () => { cancelled = true; document.removeEventListener('visibilitychange', pause); stop() }
  }, [attempt])

  return <Modal title="Quét QR thẻ hội viên" onClose={onClose} footer={<button type="button" className={btnOutline} onClick={onClose}>Đóng camera</button>}>
    <div className="space-y-4">
      {error && <><Alert>{error}</Alert><button type="button" className={btnOutline} onClick={() => setAttempt(value => value + 1)}><Icon name="refresh" className="text-lg" />Thử lại</button></>}
        <div hidden={Boolean(error)} className="relative overflow-hidden rounded-xl bg-slate-950">
          <video ref={video} autoPlay muted playsInline aria-label="Camera quét mã QR hội viên" className="aspect-[4/3] w-full object-contain" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-10 rounded-xl border-2 border-white/70" />
        </div>
      {!error && <><p role="status" className="text-center text-sm font-medium text-primary">{status}</p>
        {invalid && <Alert type="warning">Mã QR này không phải thẻ hội viên Gym. Vui lòng đưa đúng mã thẻ GYM vào camera.</Alert>}
      </>}
      <p className="text-body-sm leading-relaxed text-secondary">Quét thành công sẽ tự điền mã và tra cứu hội viên. Kiểm tra thông tin rồi bấm xác nhận vào/ra Gym. Hình ảnh camera không được tải lên máy chủ.</p>
    </div>
  </Modal>
}
