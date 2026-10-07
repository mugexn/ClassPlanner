import Spinner from './Spinner'

const KINDS = {
  primary: 'btn-primary',
  success: 'btn-success',
  warning: 'btn-warning',
  info: 'btn-info',
  danger: 'btn-danger',
  dangerSolid: 'btn-danger-solid',
  ghost: 'btn-ghost',
}

export default function Button({ kind = 'primary', className = '', loading = false, disabled, children, ...props }) {
  return (
    <button {...props} disabled={disabled || loading} className={`btn ${KINDS[kind] || KINDS.primary} ${className}`}>
      {loading && <Spinner />}
      {children}
    </button>
  )
}