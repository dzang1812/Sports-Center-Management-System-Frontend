import { Link } from 'react-router-dom'

// Renders the small markdown subset the AI uses: **bold**, [links](/path), bullet / numbered lists, # headings, paragraphs.
const BULLET = /^\s*(?:[•\-*]|\d+[.)])\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/

const linkCls = 'text-primary-container font-semibold underline underline-offset-2 hover:opacity-80'

function Inline({ text, onNavigate }) {
  return text.split(TOKEN).map((part, i) => {
    const link = part.match(LINK)
    if (link) {
      const [, label, href] = link
      // Only in-app paths and http(s) links are rendered as links; anything else stays plain text.
      if (href.startsWith('/'))
        return (
          <Link key={i} to={href} onClick={onNavigate} className={linkCls}>
            {label}
          </Link>
        )
      if (/^https?:\/\//.test(href))
        return (
          <a key={i} href={href} target="_blank" rel="noreferrer" className={linkCls}>
            {label}
          </a>
        )
      return label
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    return part.replace(/\*\*/g, '')
  })
}

export default function AiText({ text, onNavigate }) {
  const blocks = []
  for (const raw of (text ?? '').split('\n')) {
    const line = raw.trimEnd()
    if (!line.trim()) continue
    const bullet = line.match(BULLET)
    const heading = line.match(HEADING)
    const last = blocks[blocks.length - 1]
    if (bullet) {
      if (last?.type === 'list') last.items.push(bullet[1])
      else blocks.push({ type: 'list', items: [bullet[1]] })
    } else if (heading) blocks.push({ type: 'heading', text: heading[1] })
    else blocks.push({ type: 'p', text: line.trim() })
  }

  return (
    <div className="flex flex-col gap-2 leading-relaxed">
      {blocks.map((b, i) => {
        if (b.type === 'list')
          return (
            <ul key={i} className="flex flex-col gap-1.5 pl-4 list-disc marker:text-primary-container">
              {b.items.map((it, j) => (
                <li key={j}>
                  <Inline text={it} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          )
        return (
          <p key={i} className={b.type === 'heading' ? 'font-semibold' : undefined}>
            <Inline text={b.text} onNavigate={onNavigate} />
          </p>
        )
      })}
    </div>
  )
}
