import { useState } from 'react'
import { Icon } from './ui'
import { courseAppearance } from './courseAppearance'

export default function CourseCover({ sport, compact = false, className }) {
  const artwork = courseAppearance(sport)
  const [failedImage, setFailedImage] = useState(null)
  return <div className={`relative shrink-0 overflow-hidden bg-surface-container ${className ?? (compact ? 'h-28 w-full sm:h-auto sm:w-28 xl:w-32' : 'h-44 sm:h-52')}`}>
    {artwork.src && failedImage !== artwork.src
      ? <img src={artwork.src} alt={`Bộ môn ${sport}`} loading="lazy" decoding="async"
          style={{ objectPosition: artwork.position }} onError={() => setFailedImage(artwork.src)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
      : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-container/15 to-surface-container text-primary">
          <Icon name="sports_gymnastics" className="text-4xl" /><span className="font-semibold text-body-sm">{sport || 'Khóa học FitZone'}</span>
        </div>}
  </div>
}
