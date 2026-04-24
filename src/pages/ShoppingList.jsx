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
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-stone-800">Lista Zakupów</h1>
        {checked.length > 0 && (
          <button
            onClick={clearChecked}
            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium active:scale-95 transition-all"
          >
            Usuń ✓ ({checked.length})
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); addItem(newItem) }}
        className="flex gap-2 mb-3"
      >
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Wpisz produkt..."
          className="flex-1 px-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm active:scale-95 transition-all"
        >
          +
        </button>
      </form>

      <button
        onClick={() => setShowQuick(!showQuick)}
        className="w-full mb-3 py-2 text-sm text-stone-500 bg-stone-100 rounded-xl font-medium active:scale-[0.98] transition-all"
      >
        {showQuick ? 'Ukryj szybkie dodawanie ▲' : 'Szybkie dodawanie ▼'}
      </button>

      {showQuick && (
        <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-stone-50 rounded-xl">
          {QUICK_ITEMS.map((name) => {
            const alreadyAdded = existingNames.includes(name.toLowerCase())
            return (
              <button
                key={name}
                onClick={() => !alreadyAdded && addItem(name)}
                disabled={alreadyAdded}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 select-none ${
                  alreadyAdded
                    ? 'bg-emerald-100 text-emerald-400 cursor-not-allowed'
                    : 'bg-white border border-stone-200 text-stone-600 active:bg-emerald-50'
                }`}
              >
                {alreadyAdded ? '✓ ' : '+ '}{name}
              </button>
            )
          })}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-3xl mb-2">🛒</p>
          <p className="text-sm">Lista jest pusta</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {unchecked.map((item) => (
            <div key={item.id} className="flex items-center bg-white rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => toggleItem(item)}
                className="flex-1 flex items-center gap-3 px-4 py-3 active:bg-stone-50 transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full border-2 border-stone-300 flex-shrink-0" />
                <span className="text-sm text-stone-700">{item.name}</span>
              </button>
              <button
                onClick={() => deleteItem(item)}
                className="px-3 py-3 text-stone-300 active:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {checked.length > 0 && (
            <>
              <p className="text-xs text-stone-400 font-medium pt-2 px-1">Kupione</p>
              {checked.map((item) => (
                <div key={item.id} className="flex items-center bg-stone-50 rounded-xl border border-stone-100 overflow-hidden opacity-60">
                  <button
                    onClick={() => toggleItem(item)}
                    className="flex-1 flex items-center gap-3 px-4 py-3 active:bg-white transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-stone-400 line-through">{item.name}</span>
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
