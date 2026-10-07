import { useEffect, useState } from 'react'
import { sb } from './lib/supabase'
import useNotifications from './hooks/useNotifications'
import Auth from './components/Auth'
import Toasts from './components/Toasts'
import Dashboard from './pages/Dashboard'
import Spinner from './components/ui/Spinner'
import ConfirmProvider from './components/ConfirmProvider'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const { toasts, notify, ...inbox } = useNotifications(session?.user?.id)

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <ConfirmProvider>
      {session === undefined ? <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8 text-indigo-600" /></div>
        : session ? <Dashboard session={session} notify={notify} inbox={inbox} />
        : <Auth notify={notify} />}
      <Toasts toasts={toasts} />
    </ConfirmProvider>
  )
}