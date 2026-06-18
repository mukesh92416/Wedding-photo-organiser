interface Props {
  currentCategory: string | null
  onKeep: () => void
  onReject: () => void
  onFavorite: () => void
  onUndo: () => void
  onNext: () => void
  canUndo: boolean
}

export default function LRControls({ currentCategory, onKeep, onReject, onFavorite, onUndo, onNext, canUndo }: Props) {
  return (
    <div className="lr-controls">
      <button onClick={onKeep} className={`lr-btn lr-btn-keep ${currentCategory === 'keep' ? 'active' : ''}`}>
        <span>❤️</span>
        <span className="hidden sm:inline">Keep</span>
      </button>

      <button onClick={onReject} className={`lr-btn lr-btn-reject ${currentCategory === 'reject' ? 'active' : ''}`}>
        <span>❌</span>
        <span className="hidden sm:inline">Reject</span>
      </button>

      <button onClick={onFavorite} className={`lr-btn lr-btn-fav ${currentCategory === 'favorite' ? 'active' : ''}`}>
        <span>⭐</span>
        <span className="hidden sm:inline">Fav</span>
      </button>

      <div className="lr-divider" />

      <button onClick={onUndo} disabled={!canUndo} className="lr-btn lr-btn-neutral">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="hidden md:inline">Undo</span>
      </button>

      <button onClick={onNext} className="lr-btn lr-btn-neutral">
        <span className="hidden sm:inline">Next</span>
        <span>⏭</span>
      </button>
    </div>
  )
}
