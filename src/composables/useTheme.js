import { ref } from 'vue'

const isDark = ref(localStorage.getItem('dashTheme') !== 'light')

function applyTheme(dark) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    localStorage.setItem('dashTheme', isDark.value ? 'dark' : 'light')
  }
  return { isDark, toggle }
}
