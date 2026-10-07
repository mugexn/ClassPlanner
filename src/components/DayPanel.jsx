import { Plus, Pencil, Trash2, Clock, StickyNote, FlaskConical, BookOpen, AlertTriangle, Ban } from 'lucide-react'
import { parse, mins, t12, hrs, TYPE, vacantSlots, dayHours, findConflicts, suspLabel } from '../lib/schedule'
import Btn from './ui/Button'

export default function DayPanel({ sel, occ, occAll, suspensions, notes, setModal, delClass, delNote, delSuspension }) {
  const all = occAll(sel)            // every class that day, including suspended ones
  const dayItems = occ(sel)          // classes that are still happening
  const activeIds = new Set(dayItems.map(c => c.id))
  const daySusp = suspensions.filter(s => s.date === sel)
  const vacant = vacantSlots(dayItems), hh = dayHours(dayItems)
  const dayNotes = notes.filter(n => n.date === sel)
  const clashIds = new Set(dayItems.filter(c => findConflicts(dayItems, c).length).map(c => c.id))

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">{parse(sel).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        <p className="mt-1 text-xs text-slate-500">Lab {hrs(hh.lab)} h · Lecture {hrs(hh.lecture)} h</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => setModal({ type: 'regular' })}><Plus size={15} />Class</Btn>
          <Btn kind="warning" onClick={() => setModal({ type: 'makeup' })}><Plus size={15} />Make-up</Btn>
          <Btn kind="success" onClick={() => setModal({ type: 'note' })}><Plus size={15} />Note</Btn>
          <Btn kind="danger" onClick={() => setModal({ type: 'suspension' })}><Ban size={15} />Suspension</Btn>
        </div>
        <ul className="mt-3 space-y-2">
          {all.length === 0 && <li className="text-sm text-slate-500">No classes this day. Add a class or make-up class above.</li>}
          {all.map(c => {
            const off = !activeIds.has(c.id)
            return (
              <li key={c.id} className={`rounded-xl border p-3 ${off ? 'border-slate-200 opacity-60' : clashIds.has(c.id) ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium ${off ? 'line-through' : ''}`}>{c.subject}</p>
                    <p className="text-xs text-slate-500">{c.course_section} · {t12(mins(c.start_time))} – {t12(mins(c.end_time))}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${TYPE[c.class_type].cls}`}>
                        {c.class_type === 'lab' ? <FlaskConical size={11} /> : <BookOpen size={11} />}{TYPE[c.class_type].label}
                      </span>
                      {c.kind === 'makeup' && <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Make-up</span>}
                      {off && <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs text-rose-700"><Ban size={11} />Suspended</span>}
                      {clashIds.has(c.id) && <span className="inline-flex items-center gap-1 text-xs text-rose-600"><AlertTriangle size={11} />Conflict</span>}
                    </div>
                  </div>
                  <div className="flex">
                    <Btn kind="info" className="!p-1.5" aria-label="Edit" onClick={() => setModal({ type: c.kind, item: c })}><Pencil size={14} /></Btn>
                    <Btn kind="danger" className="!p-1.5" aria-label="Delete" onClick={() => delClass(c)}><Trash2 size={14} /></Btn>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {daySusp.length > 0 && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-700"><Ban size={15} />Suspension</h3>
          <ul className="mt-2 space-y-2">
            {daySusp.map(s => (
              <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">{suspLabel(s)}</p>
                  {s.reason && <p className="text-xs text-slate-500">{s.reason}</p>}
                </div>
                <div className="flex shrink-0">
                  <Btn kind="info" className="!p-1.5" aria-label="Edit suspension" onClick={() => setModal({ type: 'suspension', item: s })}><Pencil size={14} /></Btn>
                  <Btn kind="danger" className="!p-1.5" aria-label="Remove suspension" onClick={() => delSuspension(s)}><Trash2 size={14} /></Btn>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock size={15} />Vacant time (7:00 AM – 7:00 PM)</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {vacant.length === 0 && <p className="text-sm text-slate-500">No vacant time.</p>}
          {vacant.map(([s, e]) => <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">{t12(s)} – {t12(e)} ({hrs(e - s)} h)</span>)}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><StickyNote size={15} />Notes</h3>
        <ul className="mt-2 space-y-2">
          {dayNotes.length === 0 && <li className="text-sm text-slate-500">No notes for this day.</li>}
          {dayNotes.map(n => (
            <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-2.5 text-sm">
              <p className="whitespace-pre-wrap">{n.text}</p>
              <div className="flex shrink-0">
                <Btn kind="info" className="!p-1.5" aria-label="Edit note" onClick={() => setModal({ type: 'note', item: n })}><Pencil size={14} /></Btn>
                <Btn kind="danger" className="!p-1.5" aria-label="Delete note" onClick={() => delNote(n)}><Trash2 size={14} /></Btn>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}