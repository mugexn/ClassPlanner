const COLORS = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  warn: 'border-amber-300 bg-amber-50 text-amber-900',
  error: 'border-rose-300 bg-rose-50 text-rose-900',
}

export default function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${COLORS[t.type]}`}>{t.msg}</div>
      ))}
    </div>
  )
}
