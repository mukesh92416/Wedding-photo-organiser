import { useState, useEffect, useCallback, useRef } from 'react'
import LandingPage from './components/LandingPage'
import LRSidebar from './components/LRSidebar'
import LRTopBar from './components/LRTopBar'
import LRViewer from './components/LRViewer'
import LRControls from './components/LRControls'
import LRFilmstrip from './components/LRFilmstrip'
import LRStats from './components/LRStats'
import ExportDialog from './components/ExportDialog'
import { useKeyboard } from './hooks/useKeyboard'
import { useSession } from './hooks/useSession'
import { setFiles, ensureThumbnail } from './utils/fileStore'
import type { Categories, Action, PhotoStats } from './types'

const SAVE_INTERVAL = 10000
const SWIPE_THRESHOLD = 50

function getCategory(filename: string, categories: Categories): string | null {
  if (categories.keep.includes(filename)) return 'keep'
  if (categories.reject.includes(filename)) return 'reject'
  if (categories.favorites.includes(filename)) return 'favorite'
  return null
}

export default function App() {
  const [folderName, setFolderName] = useState('')
  const [allImages, setAllImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [categories, setCategories] = useState<Categories>({ keep: [], reject: [], favorites: [] })
  const [actions, setActions] = useState<Action[]>([])
  const [stats, setStats] = useState<PhotoStats>({ total: 0, keep: 0, reject: 0, favorites: 0, remaining: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [uiHidden, setUiHidden] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [started, setStarted] = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const { saveToLocal } = useSession()

  const currentFile = allImages[currentIndex] || null
  const currentCategory = currentFile ? getCategory(currentFile, categories) : null

  const fixIndex = useCallback((idx: number, list: string[]) => {
    if (!list.length) return 0
    if (idx >= list.length) return list.length - 1
    if (idx < 0) return 0
    return idx
  }, [])

  const navigate = useCallback((direction: number) => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => fixIndex(prev + direction, allImages))
      setZoomLevel(1)
      setImageLoaded(false)
      setTimeout(() => setTransitioning(false), 50)
    }, 80)
  }, [allImages, fixIndex])

  const handleAction = useCallback((action: 'keep' | 'reject' | 'favorite') => {
    if (!currentFile) return

    setCategories(prev => {
      const next = { ...prev }
      ;(['keep', 'reject', 'favorites'] as const).forEach(c => {
        next[c] = prev[c].filter(f => f !== currentFile)
      })
      const map = { keep: 'keep' as const, reject: 'reject' as const, favorite: 'favorites' as const }
      next[map[action]] = [...prev[map[action]], currentFile]
      return next
    })

    setActions(prev => [...prev, { filename: currentFile, action }])
    setStats(prev => ({
      ...prev,
      keep: prev.keep + (action === 'keep' ? 1 : 0),
      reject: prev.reject + (action === 'reject' ? 1 : 0),
      favorites: prev.favorites + (action === 'favorite' ? 1 : 0),
      remaining: prev.remaining - 1,
    }))
    navigate(1)
  }, [currentFile, navigate])

  const handleUndo = useCallback(() => {
    if (!actions.length) return

    const last = actions[actions.length - 1]
    setActions(prev => prev.slice(0, -1))

    setCategories(prev => {
      const next = { ...prev }
      const map = { keep: 'keep' as const, reject: 'reject' as const, favorite: 'favorites' as const }
      const cat = map[last.action]
      next[cat] = prev[cat].filter(f => f !== last.filename)
      return next
    })

    setStats(prev => ({
      ...prev,
      keep: prev.keep - (last.action === 'keep' ? 1 : 0),
      reject: prev.reject - (last.action === 'reject' ? 1 : 0),
      favorites: prev.favorites - (last.action === 'favorite' ? 1 : 0),
      remaining: prev.remaining + 1,
    }))

    const idx = allImages.indexOf(last.filename)
    if (idx >= 0) {
      setCurrentIndex(idx)
      setImageLoaded(false)
    }
  }, [actions, allImages])

  const handleStart = useCallback((files: File[], name: string) => {
    setFiles(files)
    const names = files.map(f => f.name)
    setFolderName(name)
    setAllImages(names)
    setCurrentIndex(0)
    setCategories({ keep: [], reject: [], favorites: [] })
    setActions([])
    setZoomLevel(1)
    setImageLoaded(false)
    setStats({ total: names.length, keep: 0, reject: 0, favorites: 0, remaining: names.length })
    setStarted(true)

    names.forEach(n => ensureThumbnail(n))
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx) * 1.5) return
    if (dx > 0) navigate(-1)
    else navigate(1)
  }, [navigate])

  useKeyboard({
    ArrowRight: () => { if (currentCategory !== 'keep') handleAction('keep'); else navigate(1) },
    d: () => { if (currentCategory !== 'keep') handleAction('keep'); else navigate(1) },
    D: () => { if (currentCategory !== 'keep') handleAction('keep'); else navigate(1) },
    ArrowLeft: () => { if (currentCategory !== 'reject') handleAction('reject'); else navigate(-1) },
    a: () => { if (currentCategory !== 'reject') handleAction('reject'); else navigate(-1) },
    A: () => { if (currentCategory !== 'reject') handleAction('reject'); else navigate(-1) },
    ArrowUp: () => handleAction('favorite'),
    w: () => handleAction('favorite'),
    W: () => handleAction('favorite'),
    ArrowDown: () => { if (currentCategory) navigate(1) },
    s: () => { if (currentCategory) navigate(1) },
    S: () => { if (currentCategory) navigate(1) },
    f: () => toggleFullscreen(),
    F: () => toggleFullscreen(),
    '+': () => setZoomLevel(z => Math.min(z + 0.25, 5)),
    '=': () => setZoomLevel(z => Math.min(z + 0.25, 5)),
    '-': () => setZoomLevel(z => Math.max(z - 0.25, 0.25)),
    '_': () => setZoomLevel(z => Math.max(z - 0.25, 0.25)),
    ' ': () => setUiHidden(prev => !prev),
    'ctrl+z': () => handleUndo(),
  }, started && !showExport)

  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => {
      if (!allImages.length) return
      saveToLocal({
        folderPath: '',
        folderName,
        images: allImages,
        actions,
        categories,
        stats,
        timestamp: new Date().toISOString(),
      })
    }, SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [started, folderName, allImages, actions, categories, stats, saveToLocal])

  if (!started) {
    return (
      <LandingPage onStart={handleStart} />
    )
  }

  return (
    <div
      className={`${uiHidden ? 'ui-hidden ' : ''}h-dvh w-screen overflow-hidden bg-[#0B0B0B]`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showExport && <ExportDialog allImages={allImages} categories={categories} stats={stats} onClose={() => setShowExport(false)} />}

      <div className="lr-layout">
        <LRSidebar
          stats={stats}
          categories={categories}
          currentCategory={currentCategory}
          onJumpTo={(cat) => {
            const map: Record<string, string[]> = {
              all: allImages,
              keep: categories.keep,
              reject: categories.reject,
              favorites: categories.favorites,
              remaining: allImages.filter(f =>
                !categories.keep.includes(f) &&
                !categories.reject.includes(f) &&
                !categories.favorites.includes(f)
              ),
            }
            const list = map[cat]
            if (list?.length) {
              const idx = cat === 'all' ? 0 : allImages.indexOf(list[0])
              if (idx >= 0) { setCurrentIndex(idx); setImageLoaded(false); setZoomLevel(1) }
            }
          }}
        />

        <LRTopBar
          folderName={folderName}
          currentIndex={currentIndex + 1}
          total={stats.total}
          stats={stats}
          onToggleStats={() => setShowStats(prev => !prev)}
          onExport={() => setShowExport(true)}
          onFullscreen={toggleFullscreen}
        />

        <LRViewer
          file={currentFile}
          zoomLevel={zoomLevel}
          currentCategory={currentCategory}
          transitioning={transitioning}
          imageLoaded={imageLoaded}
          onImageLoad={() => setImageLoaded(true)}
        />

        <LRControls
          currentCategory={currentCategory}
          onKeep={() => handleAction('keep')}
          onReject={() => handleAction('reject')}
          onFavorite={() => handleAction('favorite')}
          onUndo={handleUndo}
          onNext={() => navigate(1)}
          canUndo={actions.length > 0}
        />

        <LRFilmstrip
          images={allImages}
          currentIndex={currentIndex}
          onSelect={(idx) => { setCurrentIndex(idx); setImageLoaded(false); setZoomLevel(1) }}
        />
      </div>

      <LRStats
        stats={stats}
        open={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  )
}
