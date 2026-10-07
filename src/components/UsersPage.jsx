import { Plus, Pencil, Trash2, CalendarDays, Shield } from 'lucide-react'
import Btn from './ui/Button'

export default function UsersPage({ people, meId, onAdd, onEdit, onDelete, onView }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Shield size={18} /> Users ({people.length})</h2>
        <Btn onClick={onAdd}><Plus size={16} />Add user</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr><th className="p-2">Display name</th><th>Email</th><th>Role</th><th className="text-right pr-2">Actions</th></tr>
          </thead>
          <tbody>
            {people.map(p => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-2 font-medium">{p.full_name || '—'}{p.id === meId && <span className="ml-1 text-xs text-slate-400">(you)</span>}</td>
                <td className="text-slate-600">{p.email}</td>
                <td><span className={`rounded-full px-2 py-0.5 text-xs ${p.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{p.role}</span></td>
                <td className="py-2">
                  <div className="flex justify-end gap-1.5">
                    <Btn kind="ghost" className="!px-2 !py-1.5" onClick={() => onView(p.id)}><CalendarDays size={14} />Schedule</Btn>
                    <Btn kind="info" className="!px-2 !py-1.5" aria-label="Edit user" onClick={() => onEdit(p)}><Pencil size={14} />Edit</Btn>
                    {p.id !== meId && <Btn kind="danger" className="!px-2 !py-1.5" aria-label="Delete user" onClick={() => onDelete(p)}><Trash2 size={14} /></Btn>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}