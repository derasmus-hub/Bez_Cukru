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

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-stone-800">30 Dni Bez Cukru</h1>
        <p className="text-stone-400 text-sm italic mt-1">Metoda jedz i ćwicz</p>
        <p className="text-emerald-600 font-bold text-lg mt-2">{completedCount} / 30</p>
        <div className="w-full bg-stone-200 rounded-full h-3 mt-2">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / 30) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => toggleDay(day)}
            className={`aspect-square rounded-full flex items-center justify-center text-base font-bold transition-all duration-150 active:scale-90 select-none ${
              day.completed
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                : 'bg-white border-2 border-stone-200 text-stone-400 active:border-emerald-400'
            }`}
          >
            {day.completed ? '✓' : day.day_number}
          </button>
        ))}
      </div>

      {completedCount === 30 && (
        <div className="mt-6 bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
          <p className="text-lg font-bold text-emerald-700">Gratulacje! 🎉</p>
          <p className="text-emerald-600 text-sm mt-1">30 dni bez cukru!</p>
        </div>
      )}
    </div>
  )
}
