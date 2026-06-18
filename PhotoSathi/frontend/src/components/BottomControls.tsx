interface Props {
  currentCategory: string | null
  onKeep: () => void
  onReject: () => void
  onFavorite: () => void
  onUndo: () => void
  onNext: () => void
  canUndo: boolean
}

export default function BottomControls({ currentCategory, onKeep, onReject, onFavorite, onUndo, onNext, canUndo }: Props) {
  return (
    <div className="controls-bar h-14 md:h-16 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 shrink-0 z-20 overflow-x-auto">
      <button
        onClick={onKeep}
        className={`ctrl-btn ${currentCategory === 'keep' ? 'ctrl-keep active' : 'ctrl-keep'} text-xs md:text-sm`}
      >
        <span className="text-base md:text-lg">❤️</span>
        <span className="hidden sm:inline">Keep</span>
      </button>

      <button
        onClick={onReject}
        className={`ctrl-btn ${currentCategory === 'reject' ? 'ctrl-reject active' : 'ctrl-reject'} text-xs md:text-sm`}
      >
        <span className="text-base md:text-lg">❌</span>
        <span className="hidden sm:inline">Reject</span>
      </button>

      <button
        onClick={onFavorite}
        className={`ctrl-btn ${currentCategory === 'favorite' ? 'ctrl-fav active' : 'ctrl-fav'} text-xs md:text-sm`}
      >
        <span className="text-base md:text-lg">⭐</span>
        <span className="hidden sm:inline">Fav</span>
      </button>

      <div className="h-6 w-px bg-white/10 mx-0.5 md:mx-1 shrink-0" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`ctrl-btn ctrl-undo text-xs md:text-sm`}
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="hidden md:inline">Undo</span>
      </button>

      <button onClick={onNext} className="ctrl-btn ctrl-next text-xs md:text-sm">
        <span className="hidden sm:inline">Next</span>
        <span className="text-base md:text-lg">⏭</span>
      </button>
    </div>
  )
}
