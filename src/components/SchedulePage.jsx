import { Plus, Pencil, Trash2, CalendarRange, FlaskConical, BookOpen } from 'lucide-react'
import { WD, TYPE, mins, t12, hrs } from '../lib/schedule'
import Btn from './ui/Button'

const ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const fmtD = s => (s ? new Date(s + 'T00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '…')
const rangeText = c => (c.start_date || c.end_date ? `${fmtD(c.start_date)} – ${fmtD(c.end_date)}` : 'No date limit')

export default function SchedulePage({ classes, semesters, semId, setSemId, onAddSemester, onEditSemester, onDeleteSemester, onAdd, onEdit, onDelete }) {
  const regular = classes.filter(c => c.kind === 'regular')
  const unassigned = regular.filter(c => !c.semester_id).length
  const sem = semesters.find(s => String(s.id) === String(semId))
  const shown = regular.filter(c => (semId === 'none' ? !c.semester_id : String(c.semester_id) === String(semId)))

  const weekly = { lab: 0, lecture: 0 }
  shown.forEach(c => { weekly[c.class_type] += (mins(c.end_time) - mins(c.start_time)) * (c.weekdays || []).length })

  // Group semesters by academic year, newest first
  const years = [...new Set(semesters.map(s => s.academic_year))].sort().reverse()

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarRange size={18} /> Semester</h2>

        {semesters.length === 0 && unassigned === 0 ? (
          <div className="mt-2">
            <p className="text-sm text-slate-500">No semesters yet. Add your first semester (for example 1st Semester, A.Y. 2026-2027), then add your class schedule to it.</p>
            <Btn kind="success" className="mt-3" onClick={onAddSemester}><Plus size={16} />Add semester</Btn>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">Each semester has its own class schedule. Its classes only appear on the calendar and DTR between the semester's dates.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select aria-label="Semester" className="input-field !w-auto min-w-[14rem]" value={semId} onChange={e => setSemId(e.target.value)}>
                {years.map(y => (
                  <optgroup key={y} label={`A.Y. ${y}`}>
                    {semesters.filter(s => s.academic_year === y).map(s => <option key={s.id} value={s.id}>{s.term}</option>)}
                  </optgroup>
                ))}
                {unassigned > 0 && <option value="none">No semester ({unassigned})</option>}
              </select>
              <Btn kind="success" onClick={onAddSemester}><Plus size={16} />Add semester</Btn>
              {sem && <Btn kind="info" onClick={() => onEditSemester(sem)}><Pencil size={14} />Edit</Btn>}
              {sem && <Btn kind="danger" aria-label="Delete semester" onClick={() => onDeleteSemester(sem)}><Trash2 size={14} /></Btn>}
              <Btn className="sm:ml-auto" disabled={!semId} onClick={onAdd}><Plus size={16} />Add class</Btn>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {sem ? `${fmtD(sem.start_date)} – ${fmtD(sem.end_date)} · ` : semId === 'none' ? 'Classes without a semester · ' : ''}
              Weekly load: Lab {hrs(weekly.lab)} h · Lecture {hrs(weekly.lecture)} h
            </p>
          </>
        )}
      </section>

      {(semesters.length > 0 || unassigned > 0) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ORDER.map(d => {
            const list = shown.filter(c => (c.weekdays || []).includes(d)).sort((a, b) => mins(a.start_time) - mins(b.start_time))
            return (
              <section key={d} className="rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="font-semibold">{DAY_NAMES[d]}</h3>
                <ul className="mt-2 space-y-2">
                  {list.length === 0 && <li className="text-sm text-slate-500">No classes.</li>}
                  {list.map(c => (
                    <li key={c.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{c.subject}</p>
                          <p className="text-xs text-slate-500">{c.course_section} · {t12(mins(c.start_time))} – {t12(mins(c.end_time))}</p>
                          <p className="text-xs text-slate-400">{c.weekdays.map(x => WD[x]).join(' ')} · {rangeText(c)}</p>
                          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${TYPE[c.class_type].cls}`}>
                            {c.class_type === 'lab' ? <FlaskConical size={11} /> : <BookOpen size={11} />}{TYPE[c.class_type].label}
                          </span>
                        </div>
                        <div className="flex">
                          <Btn kind="info" className="!p-1.5" aria-label="Edit" onClick={() => onEdit(c)}><Pencil size={14} /></Btn>
                          <Btn kind="danger" className="!p-1.5" aria-label="Delete" onClick={() => onDelete(c)}><Trash2 size={14} /></Btn>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}