import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Btn from './ui/Button'

const ConfirmContext = createContext(() => Promise.resolve(false))

export const useConfirm = () => useContext(ConfirmContext)

export default function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)

  const ask = useCallback(opts => new Promise(resolve => setState({ ...opts, resolve })), [])
  const close = ok => { state?.resolve(ok); setState(null) }

  useEffect(() => {
    if (!state) return
    const onKey = e => { if (e.key === 'Escape') { state.resolve(false); setState(null) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state])

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {state && (
        <Modal title={state.title || 'Are you sure?'} onClose={() => close(false)}>
          <p className="text-sm text-slate-600">{state.message}</p>
          <div className="mt-5 flex justify-end gap-2">
            <Btn kind="ghost" onClick={() => close(false)}>Cancel</Btn>
            <Btn kind={state.kind || 'primary'} autoFocus onClick={() => close(true)}>{state.confirmText || 'OK'}</Btn>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}