import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme
        const themes: Theme[] = ['light', 'dark', 'system']
        const next = themes[(themes.indexOf(current) + 1) % themes.length]
        set({ theme: next })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
