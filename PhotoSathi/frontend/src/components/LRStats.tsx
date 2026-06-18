import type { PhotoStats } from '../types'

interface Props {
  stats: PhotoStats
  open: boolean
  onClose: () => void
}

export default function LRStats({ stats, open, onClose }: Props) {
  const percent = stats.total > 0 ? Math.round(((stats.total - stats.remaining) / stats.total) * 100) : 0

  const cards = [
    { label: 'Total Photos', value: stats.total, color: 'text-blue' },
    { label: 'Keep', value: stats.keep, color: 'text-green' },
    { label: 'Rejected', value: stats.reject, color: 'text-red' },
    { label: 'Favorites', value: stats.favorites, color: 'text-yellow' },
    { label: 'Remaining', value: stats.remaining, color: 'text-gray-400' },
  ]

  return (
    <>
      {open && <div className="fixed inset-0 z-30 xl:hidden" onClick={onClose} />}
      <div className={`lr-stats ${open ? 'open' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statistics</h3>
          <button onClick={onClose} className="xl:hidden text-gray-500 hover:text-white p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {cards.map(c => (
          <div key={c.label} className={`lr-stat-card ${c.color}`}>
            <div className="num">{c.value.toLocaleString()}</div>
            <div className="lbl">{c.label}</div>
          </div>
        ))}

        {stats.total > 0 && (
          <div className="lr-stat-progress">
            <div className="flex justify-between text-[11px] text-gray-600 mb-1.5">
              <span>Progress</span>
              <span className="tabular-nums">{percent}%</span>
            </div>
            <div className="track">
              <div className="fill" style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 text-[10px] text-gray-700 text-center">
          PhotoSathi AI v2.0
        </div>
      </div>
    </>
  )
}
