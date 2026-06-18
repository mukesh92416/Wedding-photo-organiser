import { useEffect } from 'react'

interface KeyMap {
  [key: string]: () => void
}

export function useKeyboard(keyMap: KeyMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && key === 'z') {
        e.preventDefault()
        keyMap['ctrl+z']?.()
        return
      }

      const handler = keyMap[key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keyMap, enabled])
}
