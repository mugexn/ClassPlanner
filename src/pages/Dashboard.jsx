import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { findConflicts, isSuspended, mins, occursOn, t12, ymd } from '../lib/schedule'
import Header from '../components/Header'
import CalendarGrid from '../components/CalendarGrid'
import DayPanel from '../components/DayPanel'
import Dtr from '../components/Dtr'
import ClassForm from '../components/ClassForm'
import SemesterForm from '../components/SemesterForm'
import SchedulePage from '../components/SchedulePage'
import UsersPage from '../components/UsersPage'
import UserForm from '../components/UserForm'
import AccountForm from '../components/AccountForm'
import { adminCall } from '../lib/adminApi'
import NoteForm from '../components/NoteForm'
import SuspensionForm from '../components/SuspensionForm'
import { useConfirm } from '../components/ConfirmProvider'

export default function Dashboard({ session, notify, inbox }) {
  const me = session.user
  const confirm = useConfirm()
  const [profile, setProfile] = useState(null)
  const [people, setPeople] = useState([])
  const [viewId, setViewId] = useState(me.id)
  const [classes, setClasses] = useState([])
  const [notes, setNotes] = useState([])
  const [suspensions, setSuspensions] = useState([])
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [sel, setSel] = useState(ymd(new Date()))
  const [tab, setTab] = useState('calendar')
  const [modal, setModal] = useState(null) // {type:'regular'|'makeup'|'note'|'suspension', item?}
  const [showLog, setShowLog] = useState(false)
  const [semesters, setSemesters] = useState([])
  const [semId, setSemId] = useState('')

  const loadPeople = useCallback(async () => {
    const { data } = await sb.from('profiles').select('*').order('full_name')
    setPeople(data || []); setProfile((data || []).find(p => p.id === me.id) || null)
  }, [me.id])
  useEffect(() => { loadPeople() }, [loadPeople])

  const load = useCallback(async () => {
    const [c, n, sp, sems] = await Promise.all([
      sb.from('classes').select('*').eq('user_id', viewId),
      sb.from('notes').select('*').eq('user_id', viewId),
      sb.from('suspensions').select('*').eq('user_id', viewId),
      sb.from('semesters').select('*').eq('user_id', viewId).order('academic_year', { ascending: false }).order('start_date', { ascending: false }),
    ])
    setClasses(c.data || []); setNotes(n.data || []); setSuspensions(sp.data || [])
    if (sems.error) {
      notify(sems.error.message, 'error')
      setSemesters([])
    } else {
      setSemesters(sems.data || [])
    }
  }, [viewId, notify])
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!semesters.length) {
      const hasUnassigned = classes.some(c => c.kind === 'regular' && !c.semester_id)
      setSemId(hasUnassigned ? 'none' : '')
      return
    }
    if (!semId || (semId !== 'none' && !semesters.some(s => String(s.id) === String(semId)))) {
      setSemId(String(semesters[0].id))
    }
  }, [semesters, classes, semId])

  const isAdmin = profile?.role === 'admin'
  // occAll = every class on a date (even suspended ones); occ = only classes that are still happening
  const occAll = useCallback(date => classes.filter(c => occursOn(c, date)).sort((a, b) => mins(a.start_time) - mins(b.start_time)), [classes])
  const occ = useCallback(date => occAll(date).filter(c => !isSuspended(c, date, suspensions)), [occAll, suspensions])

  const saveClass = async f => {
    if (mins(f.end_time) <= mins(f.start_time)) return notify('End time must be after start time.', 'error')
    if (f.kind === 'regular' && !f.weekdays?.length) return notify('Pick at least one day of the week.', 'error')
    if (f.kind === 'regular' && f.start_date && f.end_date && f.end_date < f.start_date) return notify('Semester end date must be after the start date.', 'error')
    const selectedSemester = f.semester_id
      ? semesters.find(s => String(s.id) === String(f.semester_id))
      : null
    const row = {
      user_id: viewId,
      semester_id: f.kind === 'regular' ? (f.semester_id || null) : null,
      kind: f.kind, subject: f.subject, course_section: f.course_section, class_type: f.class_type,
      weekdays: f.kind === 'regular' ? f.weekdays : null,
      start_date: f.kind === 'regular'
        ? (selectedSemester?.start_date || f.start_date || null)
        : null,
      end_date: f.kind === 'regular'
        ? (selectedSemester?.end_date || f.end_date || null)
        : null,
      date: f.kind === 'makeup' ? f.date : null,
      start_time: f.start_time, end_time: f.end_time,
    }
    const clash = findConflicts(classes, { ...row, id: f.id })
    const q = f.id ? sb.from('classes').update(row).eq('id', f.id) : sb.from('classes').insert(row)
    const { error } = await q
    if (error) return notify(error.message, 'error')
    const what = f.kind === 'makeup' ? 'Make-up class' : 'Class schedule'
    notify(`${what} "${f.subject}" ${f.id ? 'updated' : 'added'}.`, 'success')
    if (clash.length) notify(`Conflict: "${f.subject}" overlaps with ${clash.map(c => `${c.subject} (${t12(mins(c.start_time))}–${t12(mins(c.end_time))})`).join(', ')}.`, 'warn')
    setModal(null); load()
  }
  const delClass = async c => {
    if (!(await confirm({ title: 'Delete class', message: `Delete "${c.subject}"? This cannot be undone.`, confirmText: 'Delete', kind: 'dangerSolid' }))) return
    const { error } = await sb.from('classes').delete().eq('id', c.id)
    error ? notify(error.message, 'error') : (notify(`"${c.subject}" deleted.`, 'success'), load())
  }
  const saveSuspension = async f => {
    if (mins(f.end_time) <= mins(f.start_time)) return notify('The "To" time must be after the "From" time.', 'error')
    const row = { user_id: viewId, date: f.date, start_time: f.start_time, end_time: f.end_time, reason: f.reason || null }
    const { error } = f.id ? await sb.from('suspensions').update(row).eq('id', f.id) : await sb.from('suspensions').insert(row)
    if (error) return notify(error.message, 'error')
    const n = occAll(f.date).filter(c => mins(f.start_time) <= mins(c.start_time) && mins(f.end_time) >= mins(c.end_time)).length
    notify(`Suspension ${f.id ? 'updated' : 'added'} for ${f.date} (${n} class${n === 1 ? '' : 'es'} cancelled).`, 'success')
    setModal(null); load()
  }
  const delSuspension = async s => {
    if (!(await confirm({ title: 'Remove suspension', message: 'Classes covered by this suspension will count again.', confirmText: 'Remove', kind: 'dangerSolid' }))) return
    const { error } = await sb.from('suspensions').delete().eq('id', s.id)
    error ? notify(error.message, 'error') : (notify('Suspension removed.', 'success'), load())
  }
  const saveAccount = async ({ full_name, password }) => {
    const { error: e1 } = await sb.from('profiles').update({ full_name }).eq('id', me.id)
    if (e1) return notify(e1.message, 'error')
    const { error: e2 } = await sb.auth.updateUser({ data: { full_name }, ...(password ? { password } : {}) })
    if (e2) return notify(e2.message, 'error')
    notify(password ? 'Display name and password updated.' : 'Display name updated.', 'success')
    setModal(null); loadPeople()
  }
  const saveUser = async f => {
    try {
      await adminCall(f.id
        ? { action: 'update', id: f.id, full_name: f.full_name, email: f.email, password: f.password || undefined }
        : { action: 'create', full_name: f.full_name, email: f.email, password: f.password })
      notify(`User "${f.full_name}" ${f.id ? 'updated' : 'added'}.`, 'success')
      setModal(null); loadPeople()
    } catch (e) { notify(e.message, 'error') }
  }
  const delUser = async u => {
    if (!(await confirm({ title: 'Delete user', message: `Delete ${u.full_name || u.email}? Their schedules, notes and DTR will be removed too.`, confirmText: 'Delete user', kind: 'dangerSolid' }))) return
    try {
      await adminCall({ action: 'delete', id: u.id })
      if (viewId === u.id) setViewId(me.id)
      notify(`User "${u.full_name || u.email}" deleted.`, 'success'); loadPeople()
    } catch (e) { notify(e.message, 'error') }
  }
  const saveSemester = async f => {
    if (!f.academic_year || !f.term || !f.start_date || !f.end_date) return notify('Complete all semester fields.', 'error')
    if (f.end_date < f.start_date) return notify('Semester end date must be after the start date.', 'error')

    const row = {
      user_id: viewId,
      academic_year: f.academic_year,
      term: f.term,
      start_date: f.start_date,
      end_date: f.end_date,
    }
    const result = f.id
      ? await sb.from('semesters').update(row).eq('id', f.id).eq('user_id', viewId).select().single()
      : await sb.from('semesters').insert(row).select().single()

    if (result.error) return notify(result.error.message, 'error')
    setSemId(String(result.data.id))
    setModal(null)
    notify(`Semester ${f.id ? 'updated' : 'added'}.`, 'success')
    load()
  }

  const delSemester = async sem => {
    if (!(await confirm({
      title: 'Delete semester',
      message: `Delete ${sem.term}, A.Y. ${sem.academic_year}? Classes assigned to it will become unassigned.`,
      confirmText: 'Delete',
      kind: 'dangerSolid',
    }))) return

    const { error: unassignError } = await sb.from('classes').update({ semester_id: null }).eq('user_id', viewId).eq('semester_id', sem.id)
    if (unassignError) return notify(unassignError.message, 'error')

    const { error } = await sb.from('semesters').delete().eq('id', sem.id).eq('user_id', viewId)
    if (error) return notify(error.message, 'error')

    notify('Semester deleted. Its classes are now unassigned.', 'success')
    setSemId('')
    load()
  }
  const saveNote = async f => {
    const row = { user_id: viewId, date: sel, text: f.text }
    const { error } = f.id ? await sb.from('notes').update({ text: f.text }).eq('id', f.id) : await sb.from('notes').insert(row)
    if (error) return notify(error.message, 'error')
    notify(`Note ${f.id ? 'updated' : 'added'}.`, 'success'); setModal(null); load()
  }
  const delNote = async n => {
    const { error } = await sb.from('notes').delete().eq('id', n.id)
    error ? notify(error.message, 'error') : (notify('Note deleted.', 'success'), load())
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header tab={tab} setTab={setTab} isAdmin={isAdmin} people={people} viewId={viewId} setViewId={setViewId} meId={me.id} profile={profile} onAccount={() => setModal({ type: 'account' })} inbox={inbox} showLog={showLog} setShowLog={setShowLog} />

      <main className="mx-auto max-w-6xl p-4">
        {tab === 'dtr' ? <Dtr month={month} setMonth={setMonth} userId={viewId} occ={occ} suspensions={suspensions} notify={notify} />
          : tab === 'users' && isAdmin ? <UsersPage people={people} meId={me.id} onAdd={() => setModal({ type: 'user' })} onEdit={p => setModal({ type: 'user', item: p })} onDelete={delUser} onView={id => { setViewId(id); setTab('calendar') }} />
          : tab === 'schedule' ? <SchedulePage
              classes={classes}
              semesters={semesters}
              semId={semId}
              setSemId={setSemId}
              onAddSemester={() => setModal({ type: 'semester' })}
              onEditSemester={s => setModal({ type: 'semester', item: s })}
              onDeleteSemester={delSemester}
              onAdd={() => setModal({ type: 'regular', fromSchedule: true })}
              onEdit={c => setModal({ type: 'regular', item: c })}
              onDelete={delClass}
            />
          : (
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <CalendarGrid month={month} setMonth={setMonth} sel={sel} setSel={setSel} occ={occ} notes={notes} suspensions={suspensions} />
            <DayPanel sel={sel} occ={occ} occAll={occAll} suspensions={suspensions} notes={notes} setModal={setModal} delClass={delClass} delNote={delNote} delSuspension={delSuspension} />
          </div>
        )}
      </main>

      {modal?.type === 'account' && <AccountForm profile={profile} email={me.email} onSave={saveAccount} onClose={() => setModal(null)} />}
      {modal?.type === 'semester' && <SemesterForm item={modal.item} onSave={saveSemester} onClose={() => setModal(null)} />}
      {modal?.type === 'user' && <UserForm item={modal.item} onSave={saveUser} onClose={() => setModal(null)} />}
      {modal?.type === 'suspension' && <SuspensionForm item={modal.item} date={sel} occAll={occAll} onSave={saveSuspension} onClose={() => setModal(null)} />}
      {modal?.type === 'note' && <NoteForm item={modal.item} onSave={saveNote} onClose={() => setModal(null)} />}
      {(modal?.type === 'regular' || modal?.type === 'makeup') && <ClassForm kind={modal.type} item={modal.item} date={modal.fromSchedule ? null : sel} semesters={semesters} semesterId={semId === 'none' ? '' : semId} onSave={saveClass} onClose={() => setModal(null)} />}
    </div>
  )
}