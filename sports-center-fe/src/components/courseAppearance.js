// Match by sport so filtering/reordering cannot change a course's photo or accent.
const ARTWORK = [
  { match: /yoga|thien/, src: '/images/sport-yoga.jpg', position: 'center 40%', tag: 'bg-emerald-100 text-emerald-800', price: 'text-emerald-700', border: 'border-t-emerald-500' },
  { match: /pilates/, src: '/images/sport-pilates.jpg', position: 'center 46%', tag: 'bg-sky-100 text-sky-800', price: 'text-sky-700', border: 'border-t-sky-500' },
  { match: /hiit|group\s*x|functional|cardio|aerobic/, src: '/images/sport-hiit.jpg', position: 'center 40%', tag: 'bg-rose-100 text-rose-800', price: 'text-rose-700', border: 'border-t-rose-500' },
  { match: /gym|the\s*hinh|strength|ta\s*the\s*luc/, src: '/images/sport-gym.jpg', position: 'center 28%', tag: 'bg-amber-100 text-amber-900', price: 'text-amber-700', border: 'border-t-amber-500' },
]

export function courseAppearance(sport) {
  const name = String(sport ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  return ARTWORK.find(item => item.match.test(name))
    ?? { tag: 'bg-indigo-100 text-indigo-800', price: 'text-indigo-700', border: 'border-t-indigo-500' }
}
