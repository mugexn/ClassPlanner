import { useState } from 'react'
import Modal from './ui/Modal'
import Btn from './ui/Button'

export default function NoteForm({ item, onSave, onClose }) {
  const [text, setText] = useState(item?.text || '')
  return (
    <Modal title={item ? 'Edit note' : 'Add note'} onClose={onClose}>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); onSave({ ...item, text }) }}>
        <textarea required rows={4} className="input-field" value={text} onChange={e => setText(e.target.value)} />
        <Btn kind="success" className="w-full">Save note</Btn>
      </form>
    </Modal>
  )
}
