import { useCallback, useEffect, useState } from 'react'

const keyFor = userId => (userId ? `class-planner-notifications:${userId}` : null)
const load = key => { try { return (key && JSON.parse(localStorage.getItem(key))) || [] } catch { return [] } }

export default function useNotifications(userId) {
  const key = keyFor(userId)
  const [toasts, setToasts] = useState([])
  const [store, setStore] = useState({ key: null, items: [] })

  useEffect(() => {
    try { localStorage.removeItem('class-planner-notifications') } catch {}
    setStore({ key, items: load(key) })
  }, [key])

  useEffect(() => {
    if (key && store.key === key) { try { localStorage.setItem(key, JSON.stringify(store.items)) } catch {} }
  }, [store, key])

  const log = store.key === key ? store.items : []

  const notify = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts(t => [...t, { id, msg, type }])
    if (key) setStore(s => ({ ...s, items: [{ id, msg, type, at: new Date().toLocaleString(), read: false }, ...s.items].slice(0, 50) }))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }, [key])

  const markAllRead = useCallback(() => setStore(s => (s.items.some(n => !n.read) ? { ...s, items: s.items.map(n => ({ ...n, read: true })) } : s)), [])
  const clearAll = useCallback(() => setStore(s => ({ ...s, items: [] })), [])
  const unread = log.filter(n => !n.read).length

  return { toasts, notify, log, unread, markAllRead, clearAll }
}