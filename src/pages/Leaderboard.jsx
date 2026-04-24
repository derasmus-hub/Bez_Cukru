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

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-stone-800">Tablica Grupy</h1>
        <p className="text-stone-400 text-sm mt-1">Postęp wszystkich uczestników</p>
        {totalUsers > 0 && (
          <p className="text-emerald-600 font-medium text-sm mt-2">
            {totalUsers} {totalUsers === 1 ? 'osoba' : totalUsers < 5 ? 'osoby' : 'osób'} w wyzwaniu
          </p>
        )}
      </div>

      {stats.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm">Brak danych — nikt jeszcze nie dołączył</p>
        </div>
      ) : (
        <>
          {/* Overall progress */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-stone-600">Łączny postęp grupy</span>
              <span className="text-sm font-bold text-emerald-600">
                {totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Per-day breakdown */}
          <div className="space-y-2">
            {stats.map((stat) => {
              const pct = totalUsers > 0 ? (Number(stat.completed_count) / totalUsers) * 100 : 0
              return (
                <div key={stat.day_number} className="bg-white rounded-xl border border-stone-200 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-stone-700">
                      Dzień {stat.day_number}
                    </span>
                    <span className="text-xs text-stone-500">
                      {stat.completed_count} z {totalUsers} osób
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-emerald-400' : 'bg-stone-200'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
