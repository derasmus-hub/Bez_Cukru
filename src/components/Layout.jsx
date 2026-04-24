import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const displayName = user?.user_metadata?.display_name || user?.email

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[color:var(--color-line)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            <img src="/erasmus-logo.png" alt="Erasmus Labs" className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-bold text-[color:var(--color-ink-900)] text-[17px] tracking-tight">Bez Cukru</span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-ink-300)] font-medium mt-0.5">Erasmus Labs</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline text-xs text-[color:var(--color-ink-400)] max-w-[160px] truncate font-medium">
              {displayName}
            </span>
            <button onClick={signOut} className="btn btn-danger-ghost btn-sm">
              Wyloguj
            </button>
          </div>
        </div>
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
