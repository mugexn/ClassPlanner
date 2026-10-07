import { ChevronLeft, ChevronRight } from 'lucide-react'
import Btn from './ui/Button'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MonthNav({ month, setMonth, onToday }) {
  const y = month.getFullYear(), m = month.getMonth()
  const now = new Date().getFullYear()
  const lo = Math.min(now - 6, y), hi = Math.max(now + 6, y)
  const years = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  const go = (yy, mm) => setMonth(new Date(yy, mm, 1))
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Btn kind="ghost" aria-label="Previous month" onClick={() => go(y, m - 1)}><ChevronLeft size={16} /></Btn>
      <select aria-label="Month" className="input-field !w-auto" value={m} onChange={e => go(y, +e.target.value)}>
        {MONTHS.map((n, i) => <option key={n} value={i}>{n}</option>)}
      </select>
      <select aria-label="Year" className="input-field !w-auto" value={y} onChange={e => go(+e.target.value, m)}>
        {years.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <Btn kind="ghost" aria-label="Next month" onClick={() => go(y, m + 1)}><ChevronRight size={16} /></Btn>
      <Btn kind="info" onClick={() => { const d = new Date(); go(d.getFullYear(), d.getMonth()); onToday?.() }}>Today</Btn>
    </div>
  )
}
