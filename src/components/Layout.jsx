import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
  { to: '/', label: 'Wyzwanie' },
  { to: '/aktywnosc', label: 'Aktywność' },
  { to: '/zakupy', label: 'Zakupy' },
  { to: '/tablica', label: 'Tablica' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = user?.user_metadata?.display_name || user?.email

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[color:var(--color-line)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/erasmus-logo.png" alt="Erasmus Labs" className="h-8 w-8 rounded-lg" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[color:var(--color-ink-900)] text-[17px] tracking-tight">Bez Cukru</span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-ink-300)] font-medium mt-0.5">Erasmus Labs</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-pill ${location.pathname === link.to ? 'nav-pill-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-[color:var(--color-line)] flex items-center gap-2">
              <span className="text-xs text-[color:var(--color-ink-400)] max-w-[140px] truncate font-medium">
                {displayName}
              </span>
              <button onClick={signOut} className="btn btn-danger-ghost btn-sm">
                Wyloguj
              </button>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[color:var(--color-ink-500)] hover:bg-black/5 rounded-lg"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-[color:var(--color-line)] bg-white px-4 py-3">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`nav-pill ${location.pathname === link.to ? 'nav-pill-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[color:var(--color-line-soft)] flex items-center justify-between px-1">
              <span className="text-xs text-[color:var(--color-ink-400)] truncate font-medium">
                {displayName}
              </span>
              <button onClick={() => { signOut(); setMenuOpen(false) }} className="btn btn-danger-ghost btn-sm">
                Wyloguj
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-10 w-full">
        {children}
      </main>

      <footer className="border-t border-[color:var(--color-line)] bg-white/60 py-5">
        <p className="text-center text-[color:var(--color-ink-400)] text-xs tracking-wide">
          Powered by <span className="font-semibold text-[color:var(--color-ink-500)]">Erasmus Labs</span>
        </p>
      </footer>
    </div>
  )
}
