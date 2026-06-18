import { useState, useCallback, useEffect } from 'react'
import { getImageUrl } from '../services/api'

interface Props {
  file: string | null
  zoomLevel: number
  currentCategory: string | null
  transitioning: boolean
  imageLoaded: boolean
  onImageLoad: () => void
}

export default function LRViewer({ file, zoomLevel, currentCategory, transitioning, imageLoaded, onImageLoad }: Props) {
  const [error, setError] = useState(false)

  useEffect(() => { setError(false) }, [file])

  const handleError = useCallback(() => { setError(true); onImageLoad() }, [onImageLoad])

  const badgeColor = currentCategory === 'keep' ? 'text-green' : currentCategory === 'reject' ? 'text-red' : currentCategory === 'favorite' ? 'text-yellow' : ''

  if (!file) {
    return (
      <div className="lr-viewer">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <span className="text-3xl">📸</span>
          <p className="text-sm">No images</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lr-viewer">
      <div style={{ transform: `scale(${zoomLevel})`, transition: 'transform .2s ease' }}>
        {!imageLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          key={file}
          src={getImageUrl(file)}
          alt={file}
          onLoad={onImageLoad}
          onError={handleError}
          style={{ opacity: transitioning ? 0 : 1 }}
          draggable={false}
        />
      </div>

      {currentCategory && (
        <div className={`lr-viewer-badge ${badgeColor}`}>
          {currentCategory === 'keep' && '❤️ Keep'}
          {currentCategory === 'reject' && '❌ Reject'}
          {currentCategory === 'favorite' && '⭐ Favorite'}
        </div>
      )}

      <div className="lr-viewer-filename">{file}</div>
    </div>
  )
}
