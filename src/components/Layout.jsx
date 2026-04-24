import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
  { to: '/', label: 'Wyzwanie 30 Dni' },
  { to: '/aktywnosc', label: 'Aktywność' },
  { to: '/zakupy', label: 'Zakupy' },
  { to: '/tablica', label: 'Tablica' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/erasmus-logo.png" alt="Erasmus Labs" className="h-8" />
            <span className="font-bold text-stone-800 text-lg">Poczuj Luz</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-2 pl-2 border-l border-stone-200 flex items-center gap-2">
              <span className="text-xs text-stone-400 max-w-[120px] truncate">
                {user?.user_metadata?.display_name || user?.email}
              </span>
              <button
                onClick={signOut}
                className="text-xs text-stone-400 hover:text-red-600 transition-colors px-2 py-1 rounded"
              >
                Wyloguj
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
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

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t border-stone-200 bg-white px-4 pb-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium mt-1 ${
                  location.pathname === link.to
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between px-3">
              <span className="text-xs text-stone-400 truncate">
                {user?.user_metadata?.display_name || user?.email}
              </span>
              <button
                onClick={() => { signOut(); setMenuOpen(false) }}
                className="text-xs text-red-500 font-medium"
              >
                Wyloguj
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-white py-4">
        <p className="text-center text-stone-400 text-sm">Powered by Erasmus Labs</p>
      </footer>
    </div>
  )
}
