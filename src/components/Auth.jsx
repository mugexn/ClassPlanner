import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { sb } from '../lib/supabase'
import Field from './ui/Field'
import Btn from './ui/Button'
import ThemeToggle from './ThemeToggle'

export default function Auth({ notify }) {
  const [mode, setMode] = useState('in')
  const [f, setF] = useState({ email: '', password: '', name: '' })
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault(); setBusy(true)
    const { error } = mode === 'in'
      ? await sb.auth.signInWithPassword({ email: f.email, password: f.password })
      : await sb.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.name } } })
    setBusy(false)
    if (error) notify(error.message, 'error')
    else if (mode === 'up') notify('Account created. Check your email to confirm, then log in.', 'success')
  }
  return (
    <div className="relative grid min-h-screen place-items-center bg-slate-100 p-4">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-center gap-2 text-indigo-700"><CalendarDays /><h1 className="text-xl font-bold">Class Planner</h1></div>
        <p className="text-sm text-slate-500">{mode === 'in' ? 'Log in to see your schedule.' : 'Create your account.'}</p>
        {mode === 'up' && <Field label="Full name"><input required className="input-field" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>}
        <Field label="Email"><input required type="email" className="input-field" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input required minLength={6} type="password" className="input-field" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></Field>

        <Btn kind={mode === 'in' ? 'primary' : 'success'} loading={busy} className="w-full">
          {busy ? (mode === 'in' ? 'Logging in…' : 'Creating account…') : (mode === 'in' ? 'Log in' : 'Create account')}
        </Btn>

        <button type="button" className="w-full text-sm text-indigo-600" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'No account? Sign up' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  )
}