import { useMemo } from 'react'
import { StickyNote, AlertTriangle, Ban } from 'lucide-react'
import { ymd, WD, findConflicts, TYPE } from '../lib/schedule'
import MonthNav from './MonthNav'

export default function CalendarGrid({ month, setMonth, sel, setSel, occ, notes, suspensions }) {
  const today = ymd(new Date())
  const cells = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [...Array(start).fill(null), ...Array.from({ length: n }, (_, i) => ymd(new Date(month.getFullYear(), month.getMonth(), i + 1)))]
  }, [month])

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3"><MonthNav month={month} setMonth={setMonth} onToday={() => setSel(today)} /></div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">{WD.map(d => <div key={d} className="py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const items = occ(d), hasNote = notes.some(n => n.date === d), hasSusp = suspensions.some(s => s.date === d), bad = items.some(c => findConflicts(items, c).length)
          return (
            <button key={d} onClick={() => setSel(d)} className={`flex aspect-square flex-col items-center justify-between rounded-lg border p-1 text-sm transition sm:p-1.5 ${
              d === sel ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-slate-50'} ${d === today ? 'font-bold text-indigo-700' : ''}`}>
              <span>{+d.slice(8)}</span>
              <span className="flex h-3 items-center gap-0.5">
                {items.slice(0, 3).map(c => <i key={c.id} className={`h-1.5 w-1.5 rounded-full ${c.kind === 'makeup' ? 'bg-amber-500' : TYPE[c.class_type].dot}`} />)}
                {hasSusp && <Ban size={9} className="text-rose-500" />}
                {hasNote && <StickyNote size={9} className="text-slate-400" />}
                {bad && <AlertTriangle size={10} className="text-rose-500" />}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />Lecture</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />Lab</span>
        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />Make-up</span>
        <span className="inline-flex items-center gap-1"><Ban size={10} className="text-rose-500" />Suspension</span>
      </p>
    </section>
  )
}