import 'react'

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string
    directory?: string
  }
}

interface FileSystemDirectoryHandle {
  name: string
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>
}

interface FileSystemFileHandle {
  name: string
  createWritable(): Promise<FileSystemWritableFileStream>
  getFile(): Promise<File>
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: File | Blob | string | ArrayBuffer): Promise<void>
  close(): Promise<void>
}

interface Window {
  showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
}
