import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
    setDark(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 ${className}`}
    >
      {dark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
    </button>
  )
}