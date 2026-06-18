import { useState } from 'react'
import type { PhotoStats } from '../types'
import { getFilesByCategory, getFile } from '../utils/fileStore'

interface Props {
  allImages: string[]
  categories: { keep: string[]; reject: string[]; favorites: string[] }
  stats: PhotoStats
  onClose: () => void
}

export default function ExportDialog({ allImages, categories, stats, onClose }: Props) {
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const total = stats.keep + stats.reject + stats.favorites
  const canExport = total > 0

  const handleFolderExport = async () => {
    if (!('showDirectoryPicker' in window)) {
      setError('Your browser does not support saving to folders. Use Chrome or Edge.')
      return
    }
    setExporting(true)
    setError(null)
    try {
      const rootHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
      const catMap = getFilesByCategory(allImages, categories)

      let count = 0
      for (const [cat, label] of [['keep', 'Keep'], ['reject', 'Reject'], ['favorites', 'Favorites']] as const) {
        const files = catMap[cat]
        if (!files.length) continue
        const dir = await rootHandle.getDirectoryHandle(label, { create: true })
        for (const file of files) {
          const handle = await dir.getFileHandle(file.name, { create: true })
          const writable = await handle.createWritable()
          await writable.write(file)
          await writable.close()
          count++
        }
      }

      setResult(`Saved ${count} photos to the selected folder`)
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        setError(null)
      } else {
        setError(err?.message || 'Export failed')
      }
    }
    setExporting(false)
  }

  const handleZipExport = async () => {
    const JSZip = (await import('jszip')).default
    setExporting(true)
    setError(null)
    try {
      const zip = new JSZip()
      const catMap = getFilesByCategory(allImages, categories)

      for (const [cat, label] of [['keep', 'Keep'], ['reject', 'Reject'], ['favorites', 'Favorites']] as const) {
        const files = catMap[cat]
        for (const file of files) {
          const buffer = await file.arrayBuffer()
          zip.file(`${label}/${file.name}`, buffer)
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'photosathi-export.zip'
      a.click()
      URL.revokeObjectURL(url)
      setResult('ZIP downloaded successfully')
    } catch {
      setError('Failed to create ZIP')
    }
    setExporting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <h2>Export Photos</h2>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm py-1"><span className="text-green">❤️ Keep</span><span className="tabular-nums">{stats.keep}</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-red">❌ Reject</span><span className="tabular-nums">{stats.reject}</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-yellow">⭐ Favorites</span><span className="tabular-nums">{stats.favorites}</span></div>
          <div className="border-t border-white/[.06] pt-3 mt-2 flex justify-between text-sm font-semibold">
            <span>Total Organized</span>
            <span className="tabular-nums">{total}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red/5 border border-red/20 rounded-xl p-3 text-sm text-red mb-4 animate-slide-up">
            ❌ {error}
          </div>
        )}
        {result && (
          <div className="bg-green/5 border border-green/20 rounded-xl p-3 text-sm text-green mb-4 animate-slide-up">
            ✅ {result}
          </div>
        )}

        {/* Save to Folder */}
        <button
          onClick={handleFolderExport}
          disabled={exporting || !canExport}
          className="btn-primary w-full py-3 text-sm font-medium rounded-xl mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner-small" />
              Saving...
            </span>
          ) : '📁 Save to Folder'}
        </button>
        <p className="text-xs text-gray-600 text-center mb-4 -mt-2">Pick where to save Keep / Reject / Favorites folders</p>

        {/* ZIP export */}
        <button
          onClick={handleZipExport}
          disabled={exporting || !canExport}
          className="btn-secondary w-full py-3 text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner-small" />
              Creating ZIP...
            </span>
          ) : '📦 Download ZIP'}
        </button>

        {!result && (
          <button onClick={onClose} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 mt-4 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
