import { useState, useCallback, useEffect } from 'react'
import { getImageUrl } from '../services/api'

interface Props {
  file: string | null
  zoomLevel: number
  isFullscreen: boolean
  currentCategory: string | null
  transitioning: boolean
  imageLoaded: boolean
  onImageLoad: () => void
}

export default function MainViewer({ file, zoomLevel, isFullscreen, currentCategory, transitioning, imageLoaded, onImageLoad }: Props) {
  const [error, setError] = useState(false)

  useEffect(() => {
    setError(false)
  }, [file])

  const handleError = useCallback(() => {
    setError(true)
    onImageLoad()
  }, [onImageLoad])

  const ringClass = currentCategory === 'keep' ? 'ring-keep' : currentCategory === 'reject' ? 'ring-reject' : currentCategory === 'favorite' ? 'ring-fav' : ''

  if (!file) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-600 text-sm md:text-lg animate-pulse">No images</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden touch-pan-y">
      <div
        className={`relative transition-all duration-200 ${ringClass} rounded-lg overflow-hidden`}
        style={{
          transform: `scale(${zoomLevel})`,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {!imageLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 skeleton">
            <div className="spinner" />
          </div>
        )}
        <img
          key={file}
          src={getImageUrl(file)}
          alt={file}
          onLoad={onImageLoad}
          onError={handleError}
          className="max-h-[calc(100dvh-14rem)] max-w-full object-contain select-none"
          style={{
            maxHeight: isFullscreen ? '100dvh' : 'calc(100dvh - 10rem)',
            opacity: transitioning ? 0 : 1,
            transition: 'opacity .2s ease',
          }}
          draggable={false}
        />

        {currentCategory && (
          <div className={`category-badge ${
            currentCategory === 'keep' ? 'text-green' : currentCategory === 'reject' ? 'text-red' : 'text-yellow'
          }`}>
            {currentCategory === 'keep' && '❤️ Keep'}
            {currentCategory === 'reject' && '❌ Reject'}
            {currentCategory === 'favorite' && '⭐ Favorite'}
          </div>
        )}

        <div className="filename-bar">
          {file}
        </div>
      </div>
    </div>
  )
}
