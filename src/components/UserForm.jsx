import { useState } from 'react'
import Modal from './ui/Modal'
import Field from './ui/Field'
import Btn from './ui/Button'

export default function UserForm({ item, onSave, onClose }) {
  const [f, setF] = useState({ id: item?.id, full_name: item?.full_name || '', email: item?.email || '', password: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <Modal title={item ? 'Edit user' : 'Add user'} onClose={onClose}>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSave(f) }}>
        <Field label="Display name"><input required className="input-field" value={f.full_name} onChange={e => set('full_name', e.target.value)} /></Field>
        <Field label="Email"><input required type="email" className="input-field" value={f.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label={item ? 'New password' : 'Password'}>
          <input type="text" autoComplete="off" minLength={6} required={!item} className="input-field" value={f.password}
            placeholder={item ? 'Leave blank to keep the current password' : 'At least 6 characters'} onChange={e => set('password', e.target.value)} />
        </Field>
        <Btn className="w-full">{item ? 'Save changes' : 'Add user'}</Btn>
      </form>
    </Modal>
  )
}
