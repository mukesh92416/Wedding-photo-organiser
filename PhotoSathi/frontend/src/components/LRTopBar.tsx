import type { PhotoStats } from '../types'

interface Props {
  folderName: string
  currentIndex: number
  total: number
  stats: PhotoStats
  onToggleStats: () => void
  onExport: () => void
  onFullscreen: () => void
}

export default function LRTopBar({ folderName, currentIndex, total, stats, onToggleStats, onExport, onFullscreen }: Props) {
  const percent = total > 0 ? Math.round(((total - stats.remaining) / total) * 100) : 0

  return (
    <div className="lr-topbar">
      <div className="lr-topbar-left">
        <strong>{currentIndex}</strong>
        <span className="text-gray-600">/ {total}</span>
        <div className="lr-progress">
          <div className="lr-progress-track">
            <div className="lr-progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          <span className="text-xs tabular-nums">{percent}%</span>
        </div>
      </div>

      <div className="lr-topbar-right">
        <span className="text-xs text-gray-600 hidden md:block truncate max-w-[160px]">{folderName}</span>

        <button onClick={onToggleStats} className="lr-btn lr-btn-neutral !px-2.5" title="Stats">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        <button onClick={onFullscreen} className="lr-btn lr-btn-neutral !px-2.5" title="Fullscreen">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        <button
          onClick={onExport}
          disabled={stats.keep + stats.reject + stats.favorites === 0}
          className="lr-btn lr-btn-keep disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  )
}
