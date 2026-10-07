import { useState } from 'react'
import { parse, ymd, WD } from '../lib/schedule'
import Modal from './ui/Modal'
import Field from './ui/Field'
import Btn from './ui/Button'

const ORDER = [1, 2, 3, 4, 5, 6, 0]
const fmtD = s => new Date(s + 'T00:00').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

export default function ClassForm({ kind, item, date, semesters, semesterId, onSave, onClose }) {
  const [f, setF] = useState(item ? { ...item, semester_id: item.semester_id || '' } : {
    subject: '', course_section: '', class_type: 'lecture',
    weekdays: date ? [parse(date).getDay()] : [],
    semester_id: semesterId || '', start_date: '', end_date: '',
    date: date || ymd(new Date()), start_time: '08:00', end_time: '09:30',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const toggle = d => set('weekdays', f.weekdays?.includes(d) ? f.weekdays.filter(x => x !== d) : [...(f.weekdays || []), d])
  const sem = semesters.find(s => String(s.id) === String(f.semester_id))

  return (
    <Modal title={`${item ? 'Edit' : 'Add'} ${kind === 'makeup' ? 'make-up class' : 'class schedule'}`} onClose={onClose}>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSave({ ...f, kind }) }}>
        <Field label="Subject"><input required className="input-field" value={f.subject} onChange={e => set('subject', e.target.value)} /></Field>
        <Field label="Course & section"><input required placeholder="BSIT 2-A" className="input-field" value={f.course_section} onChange={e => set('course_section', e.target.value)} /></Field>
        <Field label="Class type">
          <select className="input-field" value={f.class_type} onChange={e => set('class_type', e.target.value)}>
            <option value="lecture">Lecture</option><option value="lab">Lab</option>
          </select>
        </Field>
        {kind === 'makeup'
          ? <Field label="Date"><input required type="date" className="input-field" value={f.date || ''} onChange={e => set('date', e.target.value)} /></Field>
          : <>
              <Field label="Semester">
                <select className="input-field" value={f.semester_id} onChange={e => set('semester_id', e.target.value)}>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.term} · A.Y. {s.academic_year}</option>)}
                  <option value="">No semester (custom dates)</option>
                </select>
              </Field>
              <div>
                <p className="text-sm font-medium text-slate-700">Days of the week</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {ORDER.map(d => (
                    <button type="button" key={d} onClick={() => toggle(d)} aria-pressed={f.weekdays?.includes(d)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${f.weekdays?.includes(d) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{WD[d]}</button>
                  ))}
                </div>
              </div>
              {sem
                ? <p className="text-xs text-slate-500">Repeats every week from {fmtD(sem.start_date)} to {fmtD(sem.end_date)}.</p>
                : <div className="grid grid-cols-2 gap-3">
                    <Field label="Starts"><input type="date" className="input-field" value={f.start_date || ''} onChange={e => set('start_date', e.target.value)} /></Field>
                    <Field label="Ends"><input type="date" className="input-field" value={f.end_date || ''} onChange={e => set('end_date', e.target.value)} /></Field>
                  </div>}
            </>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start"><input required type="time" className="input-field" value={f.start_time.slice(0, 5)} onChange={e => set('start_time', e.target.value)} /></Field>
          <Field label="End"><input required type="time" className="input-field" value={f.end_time.slice(0, 5)} onChange={e => set('end_time', e.target.value)} /></Field>
        </div>
        <Btn className="w-full">Save {kind === 'makeup' ? 'make-up class' : 'schedule'}</Btn>
      </form>
    </Modal>
  )
}