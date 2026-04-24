import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const QUICK_ITEMS = [
  'Kurczak', 'Ryż', 'Jajka', 'Brokuły', 'Pomidory',
  'Ogórki', 'Cebula', 'Czosnek', 'Oliwa', 'Masło',
  'Mleko', 'Jogurt', 'Ser', 'Chleb', 'Awokado',
  'Banany', 'Jabłka', 'Szpinak', 'Łosoś', 'Tofu',
]

export default function ShoppingList() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQuick, setShowQuick] = useState(false)
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    if (!user) return
    async function fetchItems() {
      const { data } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .order('checked')
        .order('created_at')
      setItems(data || [])
      setLoading(false)
    }
    fetchItems()
  }, [user])

  async function addItem(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase() && !i.checked)) return

    const { data } = await supabase
      .from('shopping_items')
      .insert({ name: trimmed, checked: false, user_id: user.id })
      .select()
      .single()
    if (data) setItems((prev) => [...prev, data])
    setNewItem('')
  }

  async function toggleItem(item) {
    const newChecked = !item.checked
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i))
    )
    await supabase.from('shopping_items').update({ checked: newChecked }).eq('id', item.id)
  }

  async function deleteItem(item) {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    await supabase.from('shopping_items').delete().eq('id', item.id)
  }

  async function clearChecked() {
    const checkedIds = items.filter((i) => i.checked).map((i) => i.id)
    if (checkedIds.length === 0) return
    setItems((prev) => prev.filter((i) => !i.checked))
    await supabase.from('shopping_items').delete().in('id', checkedIds)
  }

  if (loading) return <LoadingSpinner />

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)
  const existingNames = items.map((i) => i.name.toLowerCase())

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand-600)] font-semibold mb-2">
          Zakupy
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--color-ink-900)] tracking-tight">
          Lista Zakupów
        </h1>
        <p className="text-[color:var(--color-ink-400)] text-sm mt-2">
          {unchecked.length} {unchecked.length === 1 ? 'produkt do kupienia' : 'produktów do kupienia'}
        </p>
      </div>

      <div className="card-elevated p-5 sm:p-6 mb-5">
        <form
          onSubmit={(e) => { e.preventDefault(); addItem(newItem) }}
          className="flex gap-2.5"
        >
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Wpisz produkt..."
            className="input-premium flex-1"
          />
          <button
            type="submit"
            disabled={!newItem.trim()}
            className="btn btn-primary px-5"
            aria-label="Dodaj produkt"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </form>

        <button
          onClick={() => setShowQuick(!showQuick)}
          className="btn btn-neutral btn-sm btn-block mt-4"
        >
          <span>Szybkie dodawanie</span>
          <svg className={`w-4 h-4 transition-transform ${showQuick ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showQuick && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[color:var(--color-line-soft)]">
            {QUICK_ITEMS.map((name) => {
              const alreadyAdded = existingNames.includes(name.toLowerCase())
              return (
                <button
                  key={name}
                  onClick={() => !alreadyAdded && addItem(name)}
                  disabled={alreadyAdded}
                  className={`chip ${alreadyAdded ? 'chip-disabled' : ''}`}
                >
                  {alreadyAdded ? '✓' : '+'} {name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {checked.length > 0 && (
        <div className="flex justify-end mb-3">
          <button onClick={clearChecked} className="btn btn-danger-ghost btn-sm">
            Usuń kupione ({checked.length})
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card-premium py-16 text-center">
          <p className="text-4xl mb-3 opacity-60">🛒</p>
          <p className="text-[color:var(--color-ink-500)] font-medium">Lista jest pusta</p>
          <p className="text-[color:var(--color-ink-300)] text-sm mt-1">Dodaj produkt, aby zacząć</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unchecked.map((item) => (
            <div key={item.id} className="card-premium flex items-center overflow-hidden">
              <button
                onClick={() => toggleItem(item)}
                className="flex-1 flex items-center gap-3 px-4 py-3.5 hover:bg-black/[0.02] transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full border-2 border-[color:var(--color-line)] flex-shrink-0 hover:border-[color:var(--color-brand-400)] transition-colors" />
                <span className="text-[0.9375rem] text-[color:var(--color-ink-700)] font-medium">{item.name}</span>
              </button>
              <button
                onClick={() => deleteItem(item)}
                aria-label={`Usuń ${item.name}`}
                className="px-4 py-3.5 text-[color:var(--color-ink-300)] hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {checked.length > 0 && (
            <>
              <p className="text-[11px] text-[color:var(--color-ink-400)] font-semibold uppercase tracking-wider pt-4 px-1">
                Kupione
              </p>
              {checked.map((item) => (
                <div key={item.id} className="card-premium flex items-center overflow-hidden opacity-60">
                  <button
                    onClick={() => toggleItem(item)}
                    className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{
                        backgroundImage: 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(6,95,70,0.25)',
                      }}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[0.9375rem] text-[color:var(--color-ink-400)] line-through">{item.name}</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
