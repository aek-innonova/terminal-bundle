import { ref, computed } from 'vue'
import { themes, defaultThemeName } from '@/themes'
import type { TerminalTheme } from '@/types/theme'

const currentThemeName = ref(defaultThemeName)

const currentTheme = computed<TerminalTheme>(() => {
  return themes[currentThemeName.value]?.theme ?? themes[defaultThemeName]!.theme
})

const availableThemes = computed(() => {
  return Object.entries(themes).map(([key, def]) => ({ key, name: def.name }))
})

function setTheme(name: string) {
  if (themes[name]) {
    currentThemeName.value = name
  } else {
    currentThemeName.value = defaultThemeName
  }
}

export function useTheme() {
  return { currentThemeName, currentTheme, availableThemes, setTheme }
}
