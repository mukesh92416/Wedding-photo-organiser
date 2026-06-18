import type { Session } from '../types'

interface Props {
  session: Session
  onResume: () => void
  onNew: () => void
}

export default function ResumeDialog({ session, onResume, onNew }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-content text-center">
        <div className="text-4xl mb-4 animate-bounce">💾</div>
        <h2 className="text-lg font-semibold mb-2">Resume Previous Session?</h2>
        <p className="text-sm text-gray-500 mb-1">You were working on:</p>
        <p className="text-sm font-medium mb-1">{session.folderName || 'Uploads'}</p>
        <p className="text-xs text-gray-600 mb-6 tabular-nums">
          <span className="text-green">{session.stats.keep}</span> keep ·{' '}
          <span className="text-red">{session.stats.reject}</span> rejected ·{' '}
          <span className="text-yellow">{session.stats.favorites}</span> favorites
        </p>

        <div className="flex gap-3">
          <button onClick={onNew} className="btn-secondary flex-1 py-2.5 text-sm rounded-xl">
            Start Fresh
          </button>
          <button onClick={onResume} className="btn-primary flex-1 py-2.5 text-sm font-medium rounded-xl text-center">
            Resume
          </button>
        </div>
      </div>
    </div>
  )
}
