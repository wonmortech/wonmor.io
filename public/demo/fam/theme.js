// Sahifa chizilishidan oldin saqlangan mavzu va tilni qo'llaydi (oq "chaqnash" bo'lmasin).
try {
  var t = localStorage.getItem('fam.theme')
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t
  else if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.dataset.theme = 'light'
  var l = localStorage.getItem('fam.lang')
  if (l) document.documentElement.lang = l
} catch (e) {}
