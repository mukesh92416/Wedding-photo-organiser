export interface PhotoStats {
  total: number
  keep: number
  reject: number
  favorites: number
  remaining: number
}

export interface Categories {
  keep: string[]
  reject: string[]
  favorites: string[]
}

export interface Action {
  filename: string
  action: 'keep' | 'reject' | 'favorite'
}

export interface Session {
  folderPath: string
  folderName: string
  images: string[]
  actions: Action[]
  categories: Categories
  stats: PhotoStats
  timestamp: string
}

export interface UploadResult {
  uploaded: string[]
  errors: string[]
  message: string
}

export interface ExportResult {
  message: string
  keep: number
  reject: number
  favorites: number
  error?: string
}
