import SiteHeader from './SiteHeader'

// Lightweight header/content wrapper for public pages (/classes, /packages, /trainers, /news) —
// not gated by RequireAuth, so it can't reuse AppLayout.
export default function PublicShell({ hero, children }) {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      {hero}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
    </div>
  )
}
