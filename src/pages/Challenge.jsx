import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Challenge() {
  const { user } = useAuth()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchDays() {
      const { data } = await supabase
        .from('challenge_days')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_name', '30 Dni Bez Cukru')
        .order('day_number')
      setDays(data || [])
      setLoading(false)
    }
    fetchDays()
  }, [user])

  async function toggleDay(day) {
    const newCompleted = !day.completed
    setDays((prev) =>
      prev.map((d) =>
        d.id === day.id ? { ...d, completed: newCompleted } : d
      )
    )
    await supabase
      .from('challenge_days')
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', day.id)
  }

  const completedCount = days.filter((d) => d.completed).length
  const pct = Math.round((completedCount / 30) * 100)

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand-600)] font-semibold mb-2">
          Wyzwanie
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--color-ink-900)] tracking-tight">
          30 Dni Bez Cukru
        </h1>
        <p className="text-[color:var(--color-ink-400)] text-sm mt-2">
          Metoda jedz i ćwicz
        </p>
      </div>

      <div className="card-elevated p-6 sm:p-8 mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-[color:var(--color-ink-500)]">Twój postęp</p>
            <p className="text-3xl font-bold text-[color:var(--color-ink-900)] mt-1 tracking-tight">
              {completedCount}
              <span className="text-[color:var(--color-ink-300)] text-xl font-semibold"> / 30</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[color:var(--color-ink-500)]">Ukończono</p>
            <p className="text-3xl font-bold text-[color:var(--color-brand-600)] mt-1 tracking-tight">
              {pct}%
            </p>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card-premium p-5 sm:p-6">
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => toggleDay(day)}
              aria-label={`Dzień ${day.day_number}${day.completed ? ' ukończony' : ''}`}
              className={`day-circle focus-ring ${day.completed ? 'day-circle-done' : 'day-circle-todo'}`}
            >
              {day.completed ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                day.day_number
              )}
            </button>
          ))}
        </div>
      </div>

      {completedCount === 30 && (
        <div className="mt-8 card-elevated p-6 text-center bg-gradient-to-b from-[color:var(--color-brand-50)] to-white">
          <p className="text-2xl font-bold text-[color:var(--color-brand-700)] tracking-tight">
            Gratulacje! 🎉
          </p>
          <p className="text-[color:var(--color-brand-600)] text-sm mt-1 font-medium">
            30 dni bez cukru — udało Ci się!
          </p>
        </div>
      )}
    </div>
  )
}
