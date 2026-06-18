import { useRef, useEffect } from 'react'
import { getThumbnailUrl } from '../services/api'

interface Props {
  images: string[]
  currentIndex: number
  onSelect: (index: number) => void
}

const RANGE = 30

export default function LRFilmstrip({ images, currentIndex, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const el = itemRefs.current.get(currentIndex)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentIndex])

  const start = Math.max(0, currentIndex - RANGE)
  const end = Math.min(images.length, currentIndex + RANGE + 1)

  return (
    <div className="lr-filmstrip">
      {images.slice(start, end).map((filename, i) => {
        const realIndex = start + i
        const active = realIndex === currentIndex
        return (
          <button
            key={filename}
            ref={el => { if (el) itemRefs.current.set(realIndex, el); else itemRefs.current.delete(realIndex) }}
            onClick={() => onSelect(realIndex)}
            className={`lr-thumb ${active ? 'active' : ''}`}
          >
            <img src={getThumbnailUrl(filename)} alt="" loading="lazy" />
          </button>
        )
      })}
    </div>
  )
}
