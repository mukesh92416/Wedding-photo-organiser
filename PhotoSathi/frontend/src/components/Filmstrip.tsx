import { useRef, useEffect } from 'react'
import { getThumbnailUrl } from '../services/api'

interface Props {
  images: string[]
  currentIndex: number
  onSelect: (index: number) => void
}

const VISIBLE_RANGE = 20

export default function Filmstrip({ images, currentIndex, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const el = itemRefs.current.get(currentIndex)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentIndex])

  const start = Math.max(0, currentIndex - VISIBLE_RANGE)
  const end = Math.min(images.length, currentIndex + VISIBLE_RANGE + 1)
  const visible = images.slice(start, end)

  const setRef = (index: number) => (el: HTMLButtonElement | null) => {
    if (el) itemRefs.current.set(index, el)
    else itemRefs.current.delete(index)
  }

  return (
    <div className="filmstrip h-14 md:h-20 shrink-0 z-10">
      <div ref={stripRef} className="h-full flex items-center gap-1 px-1 md:px-2 overflow-x-auto scrollbar-thin">
        {visible.map((filename, i) => {
          const realIndex = start + i
          const isCurrent = realIndex === currentIndex
          return (
            <button
              key={`${realIndex}-${filename}`}
              ref={setRef(realIndex)}
              onClick={() => onSelect(realIndex)}
              className={`thumb w-10 h-9 md:w-16 md:h-14 ${isCurrent ? 'active' : 'opacity-50 hover:opacity-80'}`}
            >
              <img src={getThumbnailUrl(filename)} alt={filename} loading="lazy" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
