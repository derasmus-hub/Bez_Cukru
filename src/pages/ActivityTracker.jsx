import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']
const DAYS_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const WEEKS = [1, 2, 3, 4]
const WEEK_COLORS = [
  { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-700' },
  { border: 'border-sky-300', bg: 'bg-sky-50', text: 'text-sky-700' },
  { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  { border: 'border-indigo-300', bg: 'bg-indigo-50', text: 'text-indigo-700' },
]

const HABITS = [
  { key: 'meals', label: 'Posiłki', emoji: '🍽️', unit: '', placeholder: '0', step: '1' },
  { key: 'water', label: 'Woda', emoji: '💧', unit: 'ml', placeholder: '0', step: '100' },
  { key: 'exercise', label: 'Ćwiczenia', emoji: '🏃', unit: 'godz', placeholder: '0', step: '0.5' },
  { key: 'sleep_hours', label: 'Sen', emoji: '😴', unit: 'godz', placeholder: '0', step: '0.5' },
  { key: 'fasting_hours', label: 'Post', emoji: '⏱️', unit: 'godz', placeholder: '0', step: '1' },
]

function ValueCell({ value, habit, onChange }) {
  const [editing, setEditing] = useState(false)
  const [tempVal, setTempVal] = useState('')
  const inputRef = useRef(null)

  function startEdit() {
    setTempVal(value ? String(value) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function commitEdit() {
    setEditing(false)
    const num = tempVal === '' ? null : Number(tempVal)
    if (num !== value) onChange(num)
  }

  const displayVal = value ? value : null
  const hasValue = displayVal !== null && displayVal > 0

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        min="0"
        step={habit.step}
        value={tempVal}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
        className="w-full h-14 text-center text-lg font-bold border-2 border-emerald-400 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className={`w-full h-14 rounded-xl flex flex-col items-center justify-center transition-all active:scale-90 select-none ${
        hasValue
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
          : 'border-2 border-stone-200 bg-white text-stone-300 active:border-emerald-400'
      }`}
    >
      {hasValue ? (
        <>
          <span className="text-lg font-bold leading-none">{displayVal}</span>
          {habit.unit && <span className="text-[10px] opacity-80 leading-none mt-0.5">{habit.unit}</span>}
        </>
      ) : (
        <span className="text-xl leading-none">–</span>
      )}
    </button>
  )
}

export default function ActivityTracker() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(1)

  useEffect(() => {
    if (!user) return
    async function fetchLogs() {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number')
        .order('day_of_week')
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [user])

  function getLog(week, day) {
    return logs.find((l) => l.week_number === week && l.day_of_week === day)
  }

  async function updateValue(log, field, value) {
    setLogs((prev) =>
      prev.map((l) => (l.id === log.id ? { ...l, [field]: value } : l))
    )
    await supabase.from('activity_logs').update({ [field]: value }).eq('id', log.id)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-stone-800">Poczuj Luz 2026</h1>
        <p className="text-stone-400 text-sm mt-1">Kliknij pole, wpisz wartość</p>
      </div>

      {/* Week tabs */}
      <div className="flex gap-2 mb-6">
        {WEEKS.map((week, wi) => (
          <button
            key={week}
            onClick={() => setActiveWeek(week)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 select-none ${
              activeWeek === week
                ? `${WEEK_COLORS[wi].bg} ${WEEK_COLORS[wi].text} ${WEEK_COLORS[wi].border} border-2 shadow-sm`
                : 'bg-white border border-stone-200 text-stone-400'
            }`}
          >
            Tydzień {week}
          </button>
        ))}
      </div>

      {/* Desktop/tablet: table view */}
      <div className="hidden sm:block">
        <div className={`rounded-2xl border-2 ${WEEK_COLORS[activeWeek - 1].border} bg-white overflow-hidden shadow-sm`}>
          <div className="grid grid-cols-8 border-b border-stone-100 bg-stone-50">
            <div className="p-3" />
            {DAYS_PL.map((d) => (
              <div key={d} className="py-4 text-center text-sm font-bold text-stone-600">
                {d}
              </div>
            ))}
          </div>

          {HABITS.map((habit, hi) => (
            <div
              key={habit.key}
              className={`grid grid-cols-8 items-center gap-1 px-2 ${
                hi < HABITS.length - 1 ? 'border-b border-dashed border-stone-100' : ''
              }`}
            >
              <div className="py-3 px-1 text-center">
                <div className="text-2xl leading-none">{habit.emoji}</div>
                <div className="text-xs text-stone-500 mt-1 font-medium leading-tight">{habit.label}</div>
                {habit.unit && <div className="text-[10px] text-stone-400">({habit.unit})</div>}
              </div>
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const log = getLog(activeWeek, dayIdx)
                if (!log) return <div key={dayIdx} className="py-3" />
                return (
                  <div key={dayIdx} className="py-2 px-0.5">
                    <ValueCell
                      value={log[habit.key]}
                      habit={habit}
                      onChange={(val) => updateValue(log, habit.key, val)}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: card per day */}
      <div className="sm:hidden space-y-3">
        {Array.from({ length: 7 }, (_, dayIdx) => {
          const log = getLog(activeWeek, dayIdx)
          if (!log) return null
          return (
            <div
              key={dayIdx}
              className={`rounded-2xl border-2 ${WEEK_COLORS[activeWeek - 1].border} bg-white overflow-hidden shadow-sm`}
            >
              <div className={`px-4 py-3 ${WEEK_COLORS[activeWeek - 1].bg} border-b border-stone-100`}>
                <h3 className={`font-bold ${WEEK_COLORS[activeWeek - 1].text}`}>{DAYS_FULL[dayIdx]}</h3>
              </div>
              <div className="p-4 space-y-3">
                {HABITS.map((habit) => (
                  <div key={habit.key} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <span className="text-xl">{habit.emoji}</span>
                      <div>
                        <div className="text-sm font-medium text-stone-700">{habit.label}</div>
                        {habit.unit && <div className="text-[10px] text-stone-400">{habit.unit}</div>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <ValueCell
                        value={log[habit.key]}
                        habit={habit}
                        onChange={(val) => updateValue(log, habit.key, val)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
