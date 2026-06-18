import { useState, useRef, useCallback } from 'react'
import { uploadFiles } from '../services/api'

const ACCEPTED = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp']

interface Props {
  onUploadComplete: () => void
}

export default function UploadZone({ onUploadComplete }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (name: string) => {
    const ext = '.' + name.split('.').pop()?.toLowerCase()
    return ACCEPTED.includes(ext)
  }

  const handleFiles = useCallback(async (fileList: FileList) => {
    const valid = Array.from(fileList).filter(f => isValidFile(f.name))
    if (!valid.length) { setErrors(['No supported image files found']); return }

    setUploading(true)
    setDone(false)
    setErrors([])

    try {
      const res = await uploadFiles(valid, (loaded, total) => {
        const pct = Math.round((loaded / total) * 100)
        setProgress({ current: Math.floor((pct / 100) * valid.length), total: valid.length })
      })
      const data = await res.json()
      if (data.errors?.length) setErrors(data.errors)
      if (data.uploaded?.length) {
        setProgress({ current: data.uploaded.length, total: valid.length })
        setTimeout(onUploadComplete, 600)
      }
    } catch {
      setErrors(['Upload failed. Is the server running?'])
    }
    setUploading(false)
    setDone(true)
  }, [onUploadComplete])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files)
  }, [handleFiles])

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.bmp,.tiff,.tif,.webp"
          onChange={onFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="text-3xl animate-bounce">⏳</div>
            <p className="text-sm text-gray-300">Uploading... {progress.current}/{progress.total}</p>
            <div className="progress-track max-w-xs mx-auto progress-pulse" style={{ height: 6 }}>
              <div className="progress-fill !bg-gradient-to-r !from-blue !to-purple" style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }} />
            </div>
          </div>
        ) : done ? (
          <div className="space-y-2 animate-slide-up">
            <div className="text-3xl">✅</div>
            <p className="text-sm text-green font-medium">Upload complete! Loading photos...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl upload-icon">📤</div>
            <p className="text-sm text-gray-300">Drop photos here or click to browse</p>
            <p className="text-xs text-gray-500">JPG, PNG, BMP, TIFF, WebP supported</p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-red/5 border border-red/20 rounded-xl p-3 animate-slide-up">
          {errors.map((e, i) => <p key={i} className="text-xs text-red">{e}</p>)}
        </div>
      )}
    </div>
  )
}
