import type { PhotoStats, Categories } from '../types'

interface Props {
  stats: PhotoStats
  categories: Categories
  currentCategory: string | null
  onJumpTo: (cat: string) => void
}

export default function LRSidebar({ stats, categories, currentCategory, onJumpTo }: Props) {
  const items = [
    { id: 'all', label: 'All Photos', icon: '🖼️', count: stats.total },
    { id: 'keep', label: 'Keep', icon: '❤️', count: stats.keep, color: 'text-green' },
    { id: 'reject', label: 'Rejected', icon: '❌', count: stats.reject, color: 'text-red' },
    { id: 'favorites', label: 'Favorites', icon: '⭐', count: stats.favorites, color: 'text-yellow' },
    { id: 'remaining', label: 'Remaining', icon: '📋', count: stats.remaining },
  ]

  return (
    <aside className="lr-sidebar">
      <div className="lr-logo">
        <span>📸</span>
        <span>Photo<span>Sathi</span></span>
      </div>

      <div className="lr-sidebar-section">Library</div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onJumpTo(item.id)}
          className={`lr-sidebar-item ${currentCategory === item.id ? 'active' : ''}`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
          <span className="count">{item.count}</span>
        </button>
      ))}

      <div className="mt-auto pt-4 text-[10px] text-gray-700 text-center">
        v2.0 &bull; PhotoSathi AI
      </div>
    </aside>
  )
}
