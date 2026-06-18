import type { PhotoStats } from '../types'
import { useEffect, useState, useRef } from 'react'

interface Props {
  stats: PhotoStats
}

function AnimatedNumber({ value, label, color }: { value: number; label: string; color: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = ref.current
    const diff = value - start
    if (diff === 0) { setDisplay(value); return }
    const duration = 400
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setDisplay(current)
      ref.current = current
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-value tabular-nums">{display.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

const cards: { label: string; key: keyof PhotoStats; color: string }[] = [
  { label: 'Total Photos', key: 'total', color: 'bg-blue/5 border-blue/20 text-blue' },
  { label: 'Keep', key: 'keep', color: 'bg-green/5 border-green/20 text-green' },
  { label: 'Rejected', key: 'reject', color: 'bg-red/5 border-red/20 text-red' },
  { label: 'Favorites', key: 'favorites', color: 'bg-yellow/5 border-yellow/20 text-yellow' },
  { label: 'Remaining', key: 'remaining', color: 'bg-gray-500/5 border-gray-500/20 text-gray-400' },
]

export default function SidePanel({ stats }: Props) {
  const percent = stats.total > 0 ? Math.round(((stats.total - stats.remaining) / stats.total) * 100) : 0

  return (
    <div className="w-56 bg-panel border-l border-border p-4 shrink-0 hidden lg:flex flex-col gap-2 overflow-y-auto">
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 animate-fade-in">Statistics</h3>

      {cards.map((c, i) => (
        <div key={c.key} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
          <AnimatedNumber value={stats[c.key]} label={c.label} color={c.color} />
        </div>
      ))}

      {stats.total > 0 && (
        <div className="mt-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-between text-[11px] text-gray-600 mb-1">
            <span>Progress</span>
            <span className="tabular-nums">{percent}%</span>
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 text-[10px] text-gray-700 text-center">
        PhotoSathi AI v2.0
      </div>
    </div>
  )
}
