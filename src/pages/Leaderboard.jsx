import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Leaderboard() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from('challenge_leaderboard')
        .select('*')
        .order('day_number')
      setStats(data || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner />

  const totalUsers = stats.length > 0 ? stats[0].total_users : 0
  const totalCompleted = stats.reduce((sum, s) => sum + Number(s.completed_count), 0)
  const totalPossible = totalUsers * 30
  const overallPct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

  const pluralPeople = (n) => {
    if (n === 1) return 'osoba'
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'osoby'
    return 'osób'
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand-600)] font-semibold mb-2">
          Tablica
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--color-ink-900)] tracking-tight">
          Postęp Grupy
        </h1>
        <p className="text-[color:var(--color-ink-400)] text-sm mt-2">
          Wspólna droga przez 30 dni bez cukru
        </p>
      </div>

      {stats.length === 0 ? (
        <div className="card-premium py-16 text-center">
          <p className="text-4xl mb-3 opacity-60">👥</p>
          <p className="text-[color:var(--color-ink-500)] font-medium">Brak danych</p>
          <p className="text-[color:var(--color-ink-300)] text-sm mt-1">Nikt jeszcze nie dołączył</p>
        </div>
      ) : (
        <>
          <div className="card-elevated p-6 sm:p-7 mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-[color:var(--color-ink-500)]">Łączny postęp</p>
                <p className="text-3xl font-bold text-[color:var(--color-ink-900)] mt-1 tracking-tight">
                  {overallPct}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[color:var(--color-ink-500)]">Uczestnicy</p>
                <p className="text-3xl font-bold text-[color:var(--color-brand-600)] mt-1 tracking-tight">
                  {totalUsers}
                </p>
                <p className="text-xs text-[color:var(--color-ink-400)] font-medium mt-0.5">
                  {pluralPeople(totalUsers)} w wyzwaniu
                </p>
              </div>
            </div>
            <div className="progress-track mt-4">
              <div className="progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <p className="text-xs text-[color:var(--color-ink-400)] mt-3 font-medium">
              {totalCompleted} z {totalPossible} dni ukończonych
            </p>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[color:var(--color-line-soft)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[color:var(--color-ink-700)] tracking-tight">
                Dzień po dniu
              </h2>
              <span className="text-[11px] uppercase tracking-wider text-[color:var(--color-ink-400)] font-semibold">
                30 dni
              </span>
            </div>
            <div className="divide-y divide-[color:var(--color-line-soft)]">
              {stats.map((stat) => {
                const count = Number(stat.completed_count)
                const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0
                const complete = pct === 100
                return (
                  <div key={stat.day_number} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                          complete
                            ? 'text-white'
                            : 'text-[color:var(--color-ink-500)] bg-[color:var(--color-line-soft)]'
                        }`}
                        style={complete ? {
                          backgroundImage: 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(6,95,70,0.2)',
                        } : {}}>
                          {stat.day_number}
                        </span>
                        <span className="text-sm font-semibold text-[color:var(--color-ink-700)]">
                          Dzień {stat.day_number}
                        </span>
                      </div>
                      <span className="text-xs text-[color:var(--color-ink-400)] font-medium tabular-nums">
                        {count} / {totalUsers}
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: '0.375rem' }}>
                      <div
                        className="h-full rounded-full transition-all duration-400"
                        style={{
                          width: `${pct}%`,
                          backgroundImage: pct > 0
                            ? 'linear-gradient(90deg, #34d399 0%, #059669 100%)'
                            : 'none',
                          boxShadow: pct > 0 ? 'inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
