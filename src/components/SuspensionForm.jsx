import { useState } from 'react'
import { mins, t12 } from '../lib/schedule'
import Modal from './ui/Modal'
import Field from './ui/Field'
import Btn from './ui/Button'

export default function SuspensionForm({ item, date, occAll, onSave, onClose }) {
  const [f, setF] = useState(item
    ? { ...item, start_time: item.start_time.slice(0, 5), end_time: item.end_time.slice(0, 5), reason: item.reason || '' }
    : { date, start_time: '00:00', end_time: '23:59', reason: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const preset = (a, b) => setF(p => ({ ...p, start_time: a, end_time: b }))
  const hit = f.date ? occAll(f.date).filter(c => mins(f.start_time) <= mins(c.start_time) && mins(f.end_time) >= mins(c.end_time)) : []

  return (
    <Modal title={item ? 'Edit suspension' : 'Add suspension'} onClose={onClose}>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSave(f) }}>
        <Field label="Date"><input required type="date" className="input-field" value={f.date || ''} onChange={e => set('date', e.target.value)} /></Field>
        <div>
          <p className="text-sm font-medium text-slate-700">Suspended time</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Btn type="button" kind="ghost" className="!px-2.5 !py-1" onClick={() => preset('00:00', '23:59')}>Whole day</Btn>
            <Btn type="button" kind="ghost" className="!px-2.5 !py-1" onClick={() => preset('00:00', '12:00')}>Morning</Btn>
            <Btn type="button" kind="ghost" className="!px-2.5 !py-1" onClick={() => preset('12:00', '23:59')}>Afternoon</Btn>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From"><input required type="time" className="input-field" value={f.start_time} onChange={e => set('start_time', e.target.value)} /></Field>
          <Field label="To"><input required type="time" className="input-field" value={f.end_time} onChange={e => set('end_time', e.target.value)} /></Field>
        </div>
        <Field label="Reason (optional)"><input className="input-field" placeholder="Typhoon, holiday, school event…" value={f.reason} onChange={e => set('reason', e.target.value)} /></Field>
        <p className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
          {hit.length
            ? <>Cancels {hit.length} class{hit.length > 1 ? 'es' : ''}: {hit.map(c => `${c.subject} (${t12(mins(c.start_time))}–${t12(mins(c.end_time))})`).join(', ')}.</>
            : 'No class is fully covered by this time range.'}
        </p>
        <Btn className="w-full">{item ? 'Save changes' : 'Add suspension'}</Btn>
      </form>
    </Modal>
  )
}
