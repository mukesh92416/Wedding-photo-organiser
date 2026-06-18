const fileMap = new Map<string, File>()
const urlMap = new Map<string, string>()
const thumbMap = new Map<string, string>()

export function getFile(name: string): File | undefined {
  return fileMap.get(name)
}

export function getAllFiles(): File[] {
  return Array.from(fileMap.values())
}

export function getImageUrl(name: string): string {
  return urlMap.get(name) || ''
}

export function getThumbnailUrl(name: string): string {
  return thumbMap.get(name) || urlMap.get(name) || ''
}

export function setFiles(files: File[]) {
  for (const u of urlMap.values()) URL.revokeObjectURL(u)
  for (const u of thumbMap.values()) URL.revokeObjectURL(u)
  urlMap.clear()
  thumbMap.clear()
  fileMap.clear()
  for (const f of files) {
    fileMap.set(f.name, f)
    urlMap.set(f.name, URL.createObjectURL(f))
  }
}

export function cleanup() {
  for (const u of urlMap.values()) URL.revokeObjectURL(u)
  for (const u of thumbMap.values()) URL.revokeObjectURL(u)
  urlMap.clear()
  thumbMap.clear()
  fileMap.clear()
}

const thumbQueue = new Set<string>()
const pendingThumbs = new Map<string, Promise<void>>()

export function ensureThumbnail(name: string, size = 200): Promise<void> {
  if (thumbMap.has(name) || pendingThumbs.has(name)) {
    return pendingThumbs.get(name) || Promise.resolve()
  }
  const file = fileMap.get(name)
  if (!file) return Promise.resolve()
  const url = urlMap.get(name)
  if (!url) return Promise.resolve()

  if (thumbQueue.size > 50) {
    const first = thumbQueue.values().next().value
    if (first) {
      thumbQueue.delete(first)
      pendingThumbs.delete(first)
    }
  }
  thumbQueue.add(name)

  const promise = new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(); return }
      const aspect = img.width / img.height
      canvas.width = aspect > 1 ? size : size * aspect
      canvas.height = aspect > 1 ? size / aspect : size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const oldUrl = thumbMap.get(name)
          if (oldUrl) URL.revokeObjectURL(oldUrl)
          thumbMap.set(name, URL.createObjectURL(blob))
        }
        pendingThumbs.delete(name)
        resolve()
      }, 'image/jpeg', 60)
    }
    img.onerror = () => { pendingThumbs.delete(name); resolve() }
    img.src = url
  })
  pendingThumbs.set(name, promise)
  return promise
}

export function getFilesByCategory(
  allImages: string[],
  categories: { keep: string[]; reject: string[]; favorites: string[] }
) {
  const catMap: Record<string, File[]> = { keep: [], reject: [], favorites: [] }
  for (const [cat, names] of Object.entries(categories)) {
    for (const name of names) {
      const f = fileMap.get(name)
      if (f) catMap[cat].push(f)
    }
  }
  return catMap
}
