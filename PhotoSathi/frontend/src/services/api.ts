import { getImageUrl as _getImageUrl, getThumbnailUrl as _getThumbnailUrl } from '../utils/fileStore'

export function getImageUrl(filename: string): string {
  return _getImageUrl(filename)
}

export function getThumbnailUrl(filename: string): string {
  return _getThumbnailUrl(filename)
}
