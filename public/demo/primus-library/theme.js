// Sahifa chizilishidan oldin saqlangan mavzu va shisha rejimini qo'llaydi (chaqnash bo'lmasligi uchun).
// Kalitlar App.tsx dagi THEME_KEY / GLASS_KEY bilan bir xil; tanlov yo'q bo'lsa — OS sozlamasi.
try {
  var d = document.documentElement, t = localStorage.getItem('primus-theme-choice')
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  d.dataset.theme = t
  if (localStorage.getItem('primus-glass') === '1') d.dataset.glass = 'on'
} catch { /* localStorage yopiq — standart mavzu */ }
