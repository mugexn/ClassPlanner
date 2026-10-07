import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

let wasDark = false
window.addEventListener('beforeprint', () => {
  wasDark = document.documentElement.classList.contains('dark')
  document.documentElement.classList.remove('dark')
})
window.addEventListener('afterprint', () => {
  if (wasDark) document.documentElement.classList.add('dark')
})