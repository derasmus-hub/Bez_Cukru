import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName || email.split('@')[0])
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Konto utworzone! Możesz się teraz zalogować.')
        setIsSignUp(false)
        setPassword('')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/erasmus-logo.png" alt="Erasmus Labs" className="h-14 w-14 mx-auto mb-4 rounded-xl shadow-sm" />
          <h1 className="text-3xl font-bold text-[color:var(--color-ink-900)] tracking-tight">Bez Cukru</h1>
          <p className="text-[color:var(--color-ink-500)] mt-1.5 text-sm">
            {isSignUp ? 'Utwórz nowe konto' : 'Zaloguj się do swojego konta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-ink-700)] mb-1.5">Imię</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Twoje imię"
                className="input-premium"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[color:var(--color-ink-700)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
              required
              className="input-premium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--color-ink-700)] mb-1.5">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 znaków"
              required
              minLength={6}
              className="input-premium"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-[color:var(--color-brand-50)] border border-[color:var(--color-brand-100)] px-3 py-2">
              <p className="text-[color:var(--color-brand-700)] text-sm font-medium">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg btn-block"
          >
            {loading ? 'Ładowanie...' : isSignUp ? 'Utwórz konto' : 'Zaloguj się'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
          className="w-full mt-5 text-sm text-[color:var(--color-ink-500)] hover:text-[color:var(--color-brand-700)] transition-colors font-medium"
        >
          {isSignUp ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Utwórz je'}
        </button>

        <p className="text-center text-[color:var(--color-ink-400)] text-xs mt-6 tracking-wide">
          Powered by <span className="font-semibold text-[color:var(--color-ink-500)]">Erasmus Labs</span>
        </p>
      </div>
    </div>
  )
}
