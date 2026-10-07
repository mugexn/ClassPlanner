export const pad = n => String(n).padStart(2, '0')
export const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const mins = t => (t ? +t.slice(0, 2) * 60 + +t.slice(3, 5) : null)
export const hm = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
export const t12 = m => `${Math.floor(m / 60) % 12 || 12}:${pad(m % 60)} ${m < 720 ? 'AM' : 'PM'}`
export const hrs = m => (m / 60).toFixed(2)
export const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const overlap = (a, b) => mins(a.start_time) < mins(b.end_time) && mins(b.start_time) < mins(a.end_time)
export const inRange = (c, date) => (!c.start_date || date >= c.start_date) && (!c.end_date || date <= c.end_date)
export const occursOn = (c, date) =>
  c.kind === 'makeup' ? c.date === date : (c.weekdays || []).includes(parse(date).getDay()) && inRange(c, date)
const rangesOverlap = (a, b) =>
  (!a.end_date || !b.start_date || a.end_date >= b.start_date) && (!b.end_date || !a.start_date || b.end_date >= a.start_date)
export const TYPE = {
  lab: { label: 'Lab', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  lecture: { label: 'Lecture', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500' },
}

export function findConflicts(classes, cand) {
  return classes.filter(c => {
    if (c.id === cand.id || !overlap(c, cand)) return false
    if (cand.kind === 'makeup') return occursOn(c, cand.date)
    if (c.kind === 'makeup') return occursOn(cand, c.date)
    return c.weekdays.some(d => cand.weekdays.includes(d)) && rangesOverlap(c, cand)
  })
}

export function vacantSlots(items, from = 420, to = 1140) {
  const iv = items.map(c => [mins(c.start_time), mins(c.end_time)]).sort((a, b) => a[0] - b[0])
  const out = []; let cur = from
  for (const [s, e] of iv) { if (s > cur) out.push([cur, Math.min(s, to)]); cur = Math.max(cur, e) }
  if (cur < to) out.push([cur, to])
  return out.filter(([s, e]) => e > s)
}

export function dayHours(items) {
  const r = { lab: 0, lecture: 0 }
  items.forEach(c => { r[c.class_type] += mins(c.end_time) - mins(c.start_time) })
  return r
}

export function autoDtr(items) {
  const am = items.filter(c => mins(c.start_time) < 720)
  const pm = items.filter(c => mins(c.start_time) >= 720)
  const first = l => (l.length ? hm(Math.min(...l.map(c => mins(c.start_time)))) : '')
  const last = l => (l.length ? hm(Math.max(...l.map(c => mins(c.end_time)))) : '')
  return { am_in: first(am), am_out: last(am), pm_in: first(pm), pm_out: last(pm) }
}

export const isSuspended = (c, date, suspensions) =>
  suspensions.some(s => s.date === date && mins(s.start_time) <= mins(c.start_time) && mins(s.end_time) >= mins(c.end_time))

export const suspLabel = s =>
  mins(s.start_time) === 0 && mins(s.end_time) >= 1439 ? 'Whole day' : `${t12(mins(s.start_time))} – ${t12(mins(s.end_time))}`