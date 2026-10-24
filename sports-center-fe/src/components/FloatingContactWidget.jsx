import { useState } from 'react'
import { Icon } from './ui'

const HOTLINE = '19008888'
const ZALO_URL = `https://zalo.me/${HOTLINE}`

const options = [
  { key: 'zalo', label: 'Chat Zalo', href: ZALO_URL, external: true, image: '/images/zalo-icon.png' },
  { key: 'sms', label: 'Gửi SMS', href: `sms:${HOTLINE}`, icon: 'call' },
  { key: 'ai', label: 'Chat AI', icon: 'smart_toy' },
]

// Bouncy "jump up and scale in" easing — overshoots past 100% before settling.
const bounceEase = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

// Floating action button for the home page — tap to pop a vertical column of
// Zalo, SMS and a placeholder AI chat option above it. No AI backend exists
// yet, so that option just opens a static "coming soon" panel.
export default function FloatingContactWidget() {
  const [open, setOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
      {aiOpen && (
        <div className="w-72 self-end rounded-xl bg-surface-container-lowest shadow-xl border border-outline-variant/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary-container text-on-primary">
            <span className="font-label-md text-label-md">Trợ lý AI FitZone</span>
            <button onClick={() => setAiOpen(false)}><Icon name="close" className="text-lg" /></button>
          </div>
          <div className="p-4 text-body-sm text-on-surface-variant">
            Tính năng chat AI đang được phát triển. Vui lòng dùng Zalo hoặc SMS để được hỗ trợ ngay.
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse items-center gap-4">
        {options.map((o, i) => {
          const common = {
            title: o.label,
            className: 'w-16 h-16 rounded-full bg-surface-container-lowest shadow-lg border border-outline-variant/40 flex items-center justify-center hover:shadow-xl overflow-hidden',
            style: {
              transitionProperty: 'transform, opacity',
              transitionDuration: '450ms',
              transitionTimingFunction: bounceEase,
              transitionDelay: open ? `${i * 70}ms` : '0ms',
              transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.3)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
            },
          }
          const inner = o.image ? (
            <img src={o.image} alt={o.label} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full rounded-full bg-[#0068FF] flex items-center justify-center">
              <Icon name={o.icon} className="text-white text-3xl" />
            </span>
          )
          const content = (
            <div className={`w-full h-full ${open ? 'animate-breathe' : ''}`} style={{ animationDelay: `${i * 150}ms` }}>
              {inner}
            </div>
          )
          return o.href ? (
            <a key={o.key} {...common} href={o.href} target={o.external ? '_blank' : undefined} rel={o.external ? 'noreferrer' : undefined}>
              {content}
            </a>
          ) : (
            <button key={o.key} {...common} onClick={() => setAiOpen((v) => !v)}>
              {content}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-full bg-primary-container text-on-primary shadow-xl flex items-center justify-center hover:opacity-90 transition-transform active:scale-90 ${open ? '' : 'animate-breathe'}`}
        title="Liên hệ hỗ trợ"
      >
        <Icon name={open ? 'close' : 'chat'} className="text-2xl" />
      </button>
    </div>
  )
}
