import { useEffect, useState } from 'react'
import { User, Users, CalendarDays, ListChecks, FileText, Shield, Bell, LogOut } from 'lucide-react'
import { sb } from '../lib/supabase'
import Btn from './ui/Button'
import NotificationPanel from './NotificationPanel'
import ThemeToggle from './ThemeToggle'

export default function Header({ tab, setTab, isAdmin, people, viewId, setViewId, meId, profile, onAccount, inbox, showLog, setShowLog }) {
  // Opening the panel marks everything as read, which clears the red dot.
  useEffect(() => { if (showLog && inbox.unread > 0) inbox.markAllRead() }, [showLog, inbox.unread])

  const [loggingOut, setLoggingOut] = useState(false)
  const logout = async () => {
    setLoggingOut(true)
    await sb.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        {/* Title: first on every screen size */}
        <div className="order-1 flex items-center gap-2 font-bold text-indigo-700"><CalendarDays /> Class Planner</div>

        {/* Tabs: own row below on mobile, beside the title on wider screens */}
        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto">
          {[['calendar', 'Calendar', CalendarDays], ['schedule', 'Schedule', ListChecks], ['dtr', 'DTR', FileText], ...(isAdmin ? [['users', 'Users', Users]] : [])].map(([k, l, I]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === k ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}><I size={16} />{l}</button>
          ))}
        </nav>

        {/* Theme, bell, account and log out: top row on mobile, far right on wider screens */}
        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          {isAdmin && (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-sm text-amber-800">
              <Shield size={15} />
              <select aria-label="View user" className="bg-transparent text-sm focus:outline-none" value={viewId} onChange={e => setViewId(e.target.value)}>
                {people.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}{p.id === meId ? ' (you)' : ''}</option>)}
              </select>
            </div>
          )}

          <ThemeToggle />

          <button onClick={() => setShowLog(s => !s)} aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-slate-100">
            <Bell size={18} />{inbox.unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />}
          </button>

          <Btn kind="info" aria-label="My account" onClick={onAccount}>
            <User size={16} /><span className="max-w-[8rem] truncate">{profile?.full_name || 'Account'}</span>
          </Btn>

          <Btn kind="danger" loading={loggingOut} onClick={logout}>
            {!loggingOut && <LogOut size={16} />}
            <span className="hidden sm:inline">{loggingOut ? 'Logging out…' : 'Log out'}</span>
          </Btn>
        </div>
      </div>

      {showLog && <NotificationPanel log={inbox.log} onClear={inbox.clearAll} />}
    </header>
  )
}