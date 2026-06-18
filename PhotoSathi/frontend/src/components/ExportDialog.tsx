import { useState } from 'react'
import type { PhotoStats } from '../types'
import { exportPhotos, exportToFolder } from '../services/api'

interface Props {
  stats: PhotoStats
  onClose: () => void
}

export default function ExportDialog({ stats, onClose }: Props) {
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [destination, setDestination] = useState('')
  const [mode, setMode] = useState<'zip' | 'folder' | null>(null)

  const total = stats.keep + stats.reject + stats.favorites
  const canExport = total > 0

  const handleZipExport = async () => {
    setMode('zip')
    setExporting(true)
    setError(null)
    try {
      const res = await exportPhotos()
      const data = await res.json()
      if (data.error) setError(data.error)
      else {
        setResult(data.message || 'Export completed')
        setTimeout(() => {
          window.open('/api/export/download', '_blank')
        }, 300)
      }
    } catch {
      setError('Export failed. Is the server running?')
    }
    setExporting(false)
  }

  const handleFolderExport = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination folder path')
      return
    }
    setMode('folder')
    setExporting(true)
    setError(null)
    try {
      const res = await exportToFolder(destination.trim())
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data.message)
    } catch {
      setError('Export failed. Is the server running?')
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

        {/* ZIP export */}
        <button
          onClick={handleZipExport}
          disabled={exporting || !canExport}
          className="btn-primary w-full py-3 text-sm font-medium rounded-xl mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting && mode === 'zip' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner-small" />
              Exporting ZIP...
            </span>
          ) : '📦 Download ZIP'}
        </button>

        {/* Folder export */}
        <div className="border-t border-white/[.06] pt-4 mt-1">
          <p className="text-xs text-gray-600 mb-3">
            Or copy organized photos directly to a folder on your computer:
          </p>
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="e.g. D:\Wedding\Organized"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[.04] border border-white/[.08] text-sm text-white placeholder-gray-600 outline-none focus:border-[#3B82F6]/40 transition-colors mb-3"
          />
          <button
            onClick={handleFolderExport}
            disabled={exporting || !canExport || !destination.trim()}
            className="btn-secondary w-full py-2.5 text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting && mode === 'folder' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-small" />
                Exporting...
              </span>
            ) : '📁 Export to Folder'}
          </button>
        </div>

        {!result && (
          <button onClick={onClose} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 mt-4 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
