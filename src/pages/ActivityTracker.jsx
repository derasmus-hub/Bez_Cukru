import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd']
const DAYS_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
const WEEKS = [1, 2, 3, 4]

const HABITS = [
  { key: 'meals', label: 'Posiłki', emoji: '🍽️', unit: '', step: '1' },
  { key: 'water', label: 'Woda', emoji: '💧', unit: 'ml', step: '100' },
  { key: 'exercise', label: 'Ćwiczenia', emoji: '🏃', unit: 'godz', step: '0.5' },
  { key: 'sleep_hours', label: 'Sen', emoji: '😴', unit: 'godz', step: '0.5' },
  { key: 'fasting_hours', label: 'Post', emoji: '⏱️', unit: 'godz', step: '1' },
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
        className="w-full h-[3.25rem] text-center text-lg font-bold rounded-xl bg-white text-[color:var(--color-ink-900)] focus:outline-none"
        style={{
          boxShadow:
            'inset 0 1px 2px rgba(6,95,70,0.08), inset 0 0 0 2px var(--color-brand-500), 0 0 0 3px rgba(16,185,129,0.18)',
        }}
      />
    )
  }

  return (
    <button
      onClick={startEdit}
      className={`value-cell focus-ring ${hasValue ? 'value-cell-filled' : 'value-cell-empty'}`}
    >
      {hasValue ? (
        <>
          <span className="text-lg font-bold leading-none tracking-tight">{displayVal}</span>
          {habit.unit && <span className="text-[10px] opacity-85 leading-none mt-0.5 font-medium">{habit.unit}</span>}
        </>
      ) : (
        <span className="text-xl leading-none font-bold">–</span>
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
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand-600)] font-semibold mb-2">
          Aktywność
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--color-ink-900)] tracking-tight">
          Bez Cukru 2026
        </h1>
        <p className="text-[color:var(--color-ink-400)] text-sm mt-2">
          Kliknij pole, aby dodać lub zaktualizować wartość
        </p>
      </div>

      <div className="flex gap-2 mb-6 p-1.5 card-premium">
        {WEEKS.map((week) => (
          <button
            key={week}
            onClick={() => setActiveWeek(week)}
            className={`tab-3d focus-ring ${activeWeek === week ? 'tab-3d-active' : ''}`}
          >
            Tydzień {week}
          </button>
        ))}
      </div>

      <div className="hidden sm:block card-elevated overflow-hidden">
        <div className="grid grid-cols-8 bg-gradient-to-b from-[color:var(--color-line-soft)] to-white border-b border-[color:var(--color-line)]">
          <div className="p-3" />
          {DAYS_PL.map((d) => (
            <div key={d} className="py-3.5 text-center text-xs font-semibold text-[color:var(--color-ink-500)] uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {HABITS.map((habit, hi) => (
          <div
            key={habit.key}
            className={`grid grid-cols-8 items-center gap-1 px-2 ${
              hi < HABITS.length - 1 ? 'border-b border-dashed border-[color:var(--color-line-soft)]' : ''
            }`}
          >
            <div className="py-3 px-1 text-center">
              <div className="text-2xl leading-none">{habit.emoji}</div>
              <div className="text-xs text-[color:var(--color-ink-700)] mt-1.5 font-semibold leading-tight">
                {habit.label}
              </div>
              {habit.unit && <div className="text-[10px] text-[color:var(--color-ink-300)] mt-0.5">({habit.unit})</div>}
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

      <div className="sm:hidden space-y-3">
        {Array.from({ length: 7 }, (_, dayIdx) => {
          const log = getLog(activeWeek, dayIdx)
          if (!log) return null
          return (
            <div key={dayIdx} className="card-elevated overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-b from-[color:var(--color-line-soft)] to-white border-b border-[color:var(--color-line)]">
                <h3 className="font-bold text-[color:var(--color-ink-900)] tracking-tight">
                  {DAYS_FULL[dayIdx]}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {HABITS.map((habit) => (
                  <div key={habit.key} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <span className="text-xl">{habit.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold text-[color:var(--color-ink-700)]">{habit.label}</div>
                        {habit.unit && <div className="text-[10px] text-[color:var(--color-ink-300)]">{habit.unit}</div>}
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
