import { useEffect, useState } from 'react'

// Crossfades through `images` every `interval`ms — same smooth transition as the homepage hero
// banner, just without the dot navigation (used as a plain banner, not a user-controlled slider).
export default function ImageCarousel({ images, alt = '', className = '', interval = 4000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), interval)
    return () => clearInterval(timer)
  }, [images.length, interval])

  if (!images.length) return null

  return images.map((src, i) => (
    <img
      key={src}
      src={src}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${className}`}
      style={{ opacity: i === index ? 1 : 0 }}
    />
  ))
}
