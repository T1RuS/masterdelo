import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  dark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () =>
        set((s) => {
          const next = !s.dark
          document.documentElement.classList.toggle('dark', next)
          return { dark: next }
        }),
    }),
    { name: 'md_theme' }
  )
)

export const initTheme = () => {
  try {
    const raw = localStorage.getItem('md_theme')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.dark) {
        document.documentElement.classList.add('dark')
      }
    }
  } catch {
    // ignore
  }
}
