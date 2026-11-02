import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ApplyButton } from './AiAssistant'
import AiText from './AiText'
import { Alert, Icon, btnPrimary } from './ui'

const MEMBER_QUICK = ['Giới thiệu các gói tập', 'Đặt lớp như thế nào?', 'Có những PT nào?', 'Đánh giá lịch tập của tôi']
const GUEST_QUICK = ['Giới thiệu các gói tập', 'Có những PT nào?', 'Có lớp học nào đang mở?']
const AUTH_PAGES = /^\/(login|register|forgot-password|reset-password|verify-email)/

// Messenger-style docked chat: a small panel in the bottom-right corner instead of a centred dialog.
// Members get the full assistant; visitors can only ask a few questions about the center (nothing is stored).
export default function AiChatWidget() {
  const { auth } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([]) // { role, content, suggestions? }
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(null) // visitors only: questions left today
  const [limited, setLimited] = useState(false)
  const loaded = useRef(false)
  const bottom = useRef(null)
  const isMember = auth?.role === 'Member'

  useEffect(() => {
    if (!open || !isMember || loaded.current) return
    loaded.current = true
    api('/ai/history')
      .then((h) => setMessages(h.map((m) => ({ role: m.role, content: m.content }))))
      .catch((e) => setError(e.message))
  }, [open, isMember])
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [messages, busy, open])

  // Staff have no AI features, and the auth screens stay uncluttered.
  if ((auth && !isMember) || AUTH_PAGES.test(pathname)) return null

  const send = async (message) => {
    message = message.trim()
    if (!message || busy) return
    setText('')
    setError('')
    const history = messages.slice(-4).map((m) => ({ role: m.role, content: m.content }))
    setMessages((m) => [...m, { role: 'user', content: message }])
    setBusy(true)
    try {
      if (isMember) {
        const r = await api('/ai/chat', { method: 'POST', body: { message } })
        setMessages((m) => [...m, { role: 'assistant', content: r.response, suggestions: r.suggestions }])
      } else {
        const r = await api('/public/ai/chat', { method: 'POST', body: { message, history } })
        setMessages((m) => [...m, { role: 'assistant', content: r.response }])
        setRemaining(r.remaining)
        if (r.remaining <= 0) setLimited(true)
      }
    } catch (err) {
      setError(err.message)
      if (!isMember && err.status === 429) setLimited(true)
    } finally {
      setBusy(false)
    }
  }

  const clear = async () => {
    if (isMember) await api('/ai/history', { method: 'DELETE' }).catch(() => {})
    setMessages([])
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        title="Chat với trợ lý AI"
        className="fixed bottom-5 right-24 z-40 h-14 pl-4 pr-5 rounded-full bg-primary-container text-on-primary shadow-lg hover:shadow-xl flex items-center gap-2 font-label-md text-label-md"
      >
        <Icon name="smart_toy" className="text-[24px]" /> Hỏi AI
      </button>
    )

  return (
    <div className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[100dvh] sm:h-[min(580px,calc(100vh-2.5rem))] flex flex-col bg-surface-container-lowest sm:rounded-2xl shadow-2xl border border-outline-variant overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Icon name="smart_toy" className="text-[22px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-md text-label-md leading-tight">Trợ lý AI FitZone</p>
          <p className="text-[12px] opacity-80 leading-tight">{isMember ? 'Tư vấn tập luyện, gói tập, PT và lớp học' : 'Hỏi nhanh về gói tập, PT và lớp học'}</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} title={isMember ? 'Xóa lịch sử chat' : 'Xóa cuộc trò chuyện'} className="p-1.5 rounded-full hover:bg-white/20">
            <Icon name="delete" className="text-[20px]" />
          </button>
        )}
        <button onClick={() => setOpen(false)} title="Thu nhỏ" className="p-1.5 rounded-full hover:bg-white/20">
          <Icon name="close" className="text-[22px]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 bg-surface">
        {messages.length === 0 && !busy && (
          <div className="flex flex-col items-center gap-3 mt-6 text-center">
            <p className="text-secondary text-body-sm px-4">Xin chào! Mình có thể giúp gì cho bạn?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(isMember ? MEMBER_QUICK : GUEST_QUICK).map((q) => (
                <button key={q} onClick={() => send(q)} disabled={limited} className="px-3 py-1.5 rounded-full border border-outline-variant text-body-sm hover:bg-surface-container disabled:opacity-40">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="self-end max-w-[82%] rounded-2xl rounded-br-md px-3.5 py-2 bg-primary-container text-on-primary whitespace-pre-wrap break-words">
              {m.content}
            </div>
          ) : (
            <div key={i} className="self-start flex items-end gap-2 max-w-[94%]">
              <div className="w-7 h-7 rounded-full bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0">
                <Icon name="smart_toy" className="text-[18px]" />
              </div>
              <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-surface-container text-on-surface text-body-md min-w-0 break-words">
                <AiText text={m.content} onNavigate={() => window.innerWidth < 640 && setOpen(false)} />
                {m.suggestions?.length > 0 && (
                  <ApplyButton
                    suggestions={m.suggestions}
                    onApplied={() => window.dispatchEvent(new Event('sc:plan-changed'))}
                    onNavigate={() => window.innerWidth < 640 && setOpen(false)}
                  />
                )}
              </div>
            </div>
          ),
        )}
        {busy && (
          <div className="self-start flex items-center gap-1 rounded-2xl bg-surface-container px-4 py-3" aria-label="AI đang trả lời">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-2 h-2 rounded-full bg-outline animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        {error && <Alert>{error}</Alert>}
        <div ref={bottom} />
      </div>

      {limited ? (
        <div className="flex flex-col items-center gap-2 p-4 border-t border-outline-variant text-center shrink-0">
          <p className="text-body-sm text-secondary">Bạn đã hết lượt hỏi miễn phí hôm nay. Đăng nhập để tiếp tục và dùng đầy đủ tính năng AI.</p>
          <div className="flex gap-3 items-center">
            <Link to="/login" onClick={() => setOpen(false)} className={btnPrimary}>
              Đăng nhập
            </Link>
            <Link to="/register" onClick={() => setOpen(false)} className="text-primary-container text-body-sm font-semibold hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>
      ) : (
        <>
          {!isMember && (
            <p className="px-4 pb-1 pt-2 text-[12px] text-secondary border-t border-outline-variant shrink-0">
              {remaining === null ? 'Khách chưa đăng nhập được hỏi một vài câu mỗi ngày.' : `Còn ${remaining} lượt hỏi hôm nay.`}{' '}
              <Link to="/login" onClick={() => setOpen(false)} className="text-primary-container font-semibold hover:underline">
                Đăng nhập
              </Link>{' '}
              để dùng đầy đủ.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(text)
            }}
            className={`flex items-center gap-2 p-3 shrink-0 ${isMember ? 'border-t border-outline-variant' : ''}`}
          >
            <input
              className="flex-1 rounded-full bg-surface-container px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-container/40"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={isMember ? 1000 : 300}
              placeholder="Aa"
            />
            <button disabled={busy || !text.trim()} className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center disabled:opacity-40" title="Gửi">
              <Icon name="send" className="text-[20px]" />
            </button>
          </form>
        </>
      )}
    </div>
  )
}
