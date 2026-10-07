import { useState } from 'react'
import Modal from './ui/Modal'
import Field from './ui/Field'
import Btn from './ui/Button'

export const TERMS = ['1st Semester', '2nd Semester', 'Summer']

function suggestDates(year, term) {
  const a = +year.slice(0, 4), b = a + 1
  if (term === '1st Semester') return [`${a}-08-01`, `${b}-01-31`]
  if (term === '2nd Semester') return [`${b}-02-01`, `${b}-06-30`]
  return [`${b}-07-01`, `${b}-07-31`]
}

export default function SemesterForm({ item, onSave, onClose }) {
  const now = new Date()
  const defYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1
  const years = Array.from({ length: 8 }, (_, i) => `${defYear - 3 + i}-${defYear - 2 + i}`)

  const [f, setF] = useState(() => {
    if (item) return { ...item }
    const ay = `${defYear}-${defYear + 1}`
    const [start_date, end_date] = suggestDates(ay, '1st Semester')
    return { academic_year: ay, term: '1st Semester', start_date, end_date }
  })
  const options = years.includes(f.academic_year) ? years : [f.academic_year, ...years]
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  // For a new semester, picking the year or term fills in suggested dates.
  const pick = (k, v) => setF(p => {
    const n = { ...p, [k]: v }
    if (!item) { const [s, e] = suggestDates(n.academic_year, n.term); n.start_date = s; n.end_date = e }
    return n
  })

  return (
    <Modal title={item ? 'Edit semester' : 'Add semester'} onClose={onClose}>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSave(f) }}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Academic year">
            <select className="input-field" value={f.academic_year} onChange={e => pick('academic_year', e.target.value)}>
              {options.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Term">
            <select className="input-field" value={f.term} onChange={e => pick('term', e.target.value)}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts"><input required type="date" className="input-field" value={f.start_date} onChange={e => set('start_date', e.target.value)} /></Field>
          <Field label="Ends"><input required type="date" className="input-field" value={f.end_date} onChange={e => set('end_date', e.target.value)} /></Field>
        </div>
        <p className="text-xs text-slate-500">Classes in this semester only appear on the calendar and DTR between these dates. Changing the dates updates all its classes.</p>
        <Btn className="w-full">{item ? 'Save changes' : 'Add semester'}</Btn>
      </form>
    </Modal>
  )
}