/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: ['btn', 'btn-primary', 'btn-success', 'btn-warning', 'btn-info', 'btn-danger', 'btn-danger-solid', 'btn-ghost'],
  theme: { extend: {} },
  plugins: [],
}