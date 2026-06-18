const API = import.meta.env.VITE_API_URL || '/api'

export async function uploadFile(file: File, onProgress?: (loaded: number, total: number) => void): Promise<Response> {
  const formData = new FormData()
  formData.append('files', file)
  const xhr = new XMLHttpRequest()
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded, e.total)
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(new Response(xhr.response, { status: xhr.status }))
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.open('POST', `${API}/upload`)
    xhr.send(formData)
  })
}

export async function getUploadedImages(): Promise<Response> {
  return fetch(`${API}/uploaded-images`)
}

export async function loadFolder(path: string): Promise<Response> {
  return fetch(`${API}/load-folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
}

export async function performAction(filename: string, action: string): Promise<Response> {
  return fetch(`${API}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, action }),
  })
}

export async function undoAction(): Promise<Response> {
  return fetch(`${API}/undo`, { method: 'POST' })
}

export async function getStats(): Promise<Response> {
  return fetch(`${API}/stats`)
}

export async function exportPhotos(): Promise<Response> {
  return fetch(`${API}/export`, { method: 'POST' })
}

export async function exportToFolder(destination: string): Promise<Response> {
  return fetch(`${API}/export-to-folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination }),
  })
}

export async function downloadZip(type: string): Promise<Response> {
  return fetch(`${API}/export/${type}/download`)
}

export async function saveSession(data: Record<string, unknown>): Promise<Response> {
  return fetch(`${API}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function resolveFolder(name: string): Promise<Response> {
  return fetch(`${API}/resolve-folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export async function getSession(): Promise<Response> {
  return fetch(`${API}/session`)
}

export function getImageUrl(filename: string): string {
  return `${API}/image/${encodeURIComponent(filename)}`
}

export function getThumbnailUrl(filename: string): string {
  return `${API}/thumbnail/${encodeURIComponent(filename)}`
}
