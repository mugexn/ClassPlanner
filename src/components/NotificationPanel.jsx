import { AlertTriangle, X, CheckCircle2 } from 'lucide-react'

export default function NotificationPanel({ log, onClear }) {
  return (
    <div className="absolute right-4 top-full max-h-80 w-80 overflow-y-auto rounded-xl border bg-white p-2 shadow-xl">
      {log.length > 0 && <div className="flex justify-end px-2 pb-1"><button onClick={onClear} className="text-xs text-indigo-600 hover:underline">Clear all</button></div>}
      {log.length === 0 && <p className="p-3 text-sm text-slate-500">No notifications yet.</p>}
      {log.map(n => (
        <div key={n.id} className="flex gap-2 rounded-lg p-2 text-sm hover:bg-slate-50">
          {n.type === 'warn' ? <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" /> : n.type === 'error' ? <X size={16} className="mt-0.5 shrink-0 text-rose-500" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />}
          <div><p>{n.msg}</p><p className="text-xs text-slate-400">{n.at}</p></div>
        </div>
      ))}
    </div>
  )
}
