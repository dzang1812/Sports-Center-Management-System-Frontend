// Renders the small markdown subset the AI uses: **bold**, bullet / numbered lists, # headings and paragraphs.
const BULLET = /^\s*(?:[•\-*]|\d+[.)])\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/

function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part.replace(/\*\*/g, '')
    ),
  )
}

export default function AiText({ text }) {
  const blocks = []
  for (const raw of (text ?? '').split('\n')) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      blocks.push({ type: 'gap' })
      continue
    }
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
        if (b.type === 'gap') return null
        if (b.type === 'list')
          return (
            <ul key={i} className="flex flex-col gap-1.5 pl-4 list-disc marker:text-primary-container">
              {b.items.map((it, j) => (
                <li key={j}>
                  <Inline text={it} />
                </li>
              ))}
            </ul>
          )
        if (b.type === 'heading')
          return (
            <p key={i} className="font-semibold">
              <Inline text={b.text} />
            </p>
          )
        return (
          <p key={i}>
            <Inline text={b.text} />
          </p>
        )
      })}
    </div>
  )
}
