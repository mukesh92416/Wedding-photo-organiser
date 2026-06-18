import { useState, useCallback } from 'react'
import type { Session, Action, Categories } from '../types'

const STORAGE_KEY = 'photosathi-session'

export function useSession() {
  const [savedSession, setSavedSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const saveToLocal = useCallback((data: Session) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSavedSession(data)
    } catch {}
  }, [])

  const clearLocal = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setSavedSession(null)
    } catch {}
  }, [])

  const buildSession = useCallback(
    (folderPath: string, folderName: string, images: string[], actions: Action[], categories: Categories) => {
      const total = images.length
      const keep = categories.keep.length
      const reject = categories.reject.length
      const favorites = categories.favorites.length
      const categorized = new Set([...categories.keep, ...categories.reject, ...categories.favorites])
      const remaining = total - categorized.size

      const session: Session = {
        folderPath,
        folderName,
        images,
        actions,
        categories,
        stats: { total, keep, reject, favorites, remaining },
        timestamp: new Date().toISOString(),
      }
      return session
    },
    []
  )

  return { savedSession, setSavedSession, saveToLocal, clearLocal, buildSession }
}
