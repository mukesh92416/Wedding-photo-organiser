import type { PhotoStats } from '../types'

interface Props {
  folderName: string
  currentIndex: number
  total: number
  stats: PhotoStats
  onFullscreen: () => void
  onExport: () => void
}

export default function TopBar({ folderName, currentIndex, total, stats, onFullscreen, onExport }: Props) {
  const percent = total > 0 ? Math.round(((total - stats.remaining) / total) * 100) : 0

  return (
    <div className="topbar h-12 md:h-14 flex items-center justify-between px-3 md:px-4 shrink-0 z-20">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <span className="text-base md:text-lg shrink-0">📸</span>
        <span className="font-semibold text-xs md:text-sm hidden xs:inline">
          Photo<span className="text-blue">Sathi</span>
        </span>
        <div className="h-4 w-px bg-border hidden xs:block" />
        <div className="text-xs md:text-sm whitespace-nowrap tabular-nums">
          <span className="text-white font-medium">{currentIndex}</span>
          <span className="text-gray-500"> / {total}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-1">
          <div className="w-16 md:w-24 progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          <span className="text-[10px] md:text-xs text-gray-500 tabular-nums">{percent}%</span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <span className="text-[10px] text-gray-600 hidden lg:block truncate max-w-[140px] md:max-w-[180px]">{folderName}</span>

        <button onClick={onFullscreen} className="p-1.5 md:p-2 rounded-lg hover:bg-white/5 transition-all duration-200 active:scale-90" title="Fullscreen (F)">
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        <button
          onClick={onExport}
          disabled={stats.keep + stats.reject + stats.favorites === 0}
          className="px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-medium rounded-lg bg-green/15 text-green hover:bg-green/25 transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>
    </div>
  )
}
