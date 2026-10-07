import { useState } from 'react'
import Modal from './ui/Modal'
import Field from './ui/Field'
import Btn from './ui/Button'

// Any user: view and edit their own display name and password.
export default function AccountForm({ profile, email, onSave, onClose }) {
  const [name, setName] = useState(profile?.full_name || '')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const submit = e => {
    e.preventDefault()
    if (pw && pw !== pw2) return setErr('The two passwords do not match.')
    setErr(''); onSave({ full_name: name, password: pw })
  }
  return (
    <Modal title="My account" onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Display name"><input required className="input-field" value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Email"><input disabled className="input-field bg-slate-50 text-slate-500" value={email} /></Field>
        <Field label="New password"><input type="password" minLength={6} autoComplete="new-password" className="input-field" placeholder="Leave blank to keep the current password" value={pw} onChange={e => setPw(e.target.value)} /></Field>
        {pw && <Field label="Confirm new password"><input type="password" autoComplete="new-password" className="input-field" value={pw2} onChange={e => setPw2(e.target.value)} /></Field>}
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <Btn className="w-full">Save changes</Btn>
      </form>
    </Modal>
  )
}
