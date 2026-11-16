import { Link } from 'react-router-dom'
import SiteHeader from './SiteHeader'

// Lightweight header/content wrapper for public pages (/classes, /packages, /trainers, /news) —
// not gated by RequireAuth, so it can't reuse AppLayout.
// Banner art carries its own text and is shown at the /classes strip ratio (2544×416) so pages line up.
// `bannerRatio` lets art whose text is too tall for the strip keep its own ratio instead of being cut.
// On phones the strip is too short to read: it gets a fixed height cropped from the left (where left-aligned art keeps
// its headline), or `bannerMobile`, a ~2.4:1 crop for art whose headline is centered.
// Pages with their own heading block (e.g. /trainers) omit `subtitle` and the title stays screen-reader only.
export default function PublicShell({ banner, bannerMobile, bannerRatio = '2544 / 416', eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <Link to="/register" className="block bg-inverse-surface">
        <picture>
          {bannerMobile && <source media="(max-width: 639px)" srcSet={bannerMobile} />}
          <img src={banner} alt="Banner FitZone — đăng ký hội viên" style={{ aspectRatio: bannerRatio }} className="block w-full max-w-[2560px] mx-auto h-40 sm:h-auto object-cover object-left sm:object-center" />
        </picture>
      </Link>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {subtitle ? (
          <div className="mb-8">
            {eyebrow && <span className="font-label-md text-label-md uppercase tracking-wider text-primary-container block mb-1">{eyebrow}</span>}
            <h1 className="font-headline-xl text-headline-xl text-on-surface">{title}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{subtitle}</p>
          </div>
        ) : (
          <h1 className="sr-only">{title}</h1>
        )}
        {children}
      </main>
    </div>
  )
}
