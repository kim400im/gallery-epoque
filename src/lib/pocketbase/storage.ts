const MAX_IMAGE_DIMENSION = 2800
const WEBP_QUALITY = 0.82

async function compressImageToWebp(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/webp') {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return file
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
  })

  if (!blob || blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() })
}

export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const uploadFile = await compressImageToWebp(file)
  const formData = new FormData()
  formData.append('file', uploadFile)
  formData.append('folder', folder)

  const controller = new AbortController()
  const timeoutMs = 5 * 60 * 1000
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
    signal: controller.signal,
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Image upload timed out after ${Math.round(timeoutMs / 1000)} seconds. File: ${uploadFile.name} (${uploadFile.size} bytes)`)
    }
    throw error
  }).finally(() => window.clearTimeout(timeoutId))

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to upload image')
  }

  const data = await response.json() as { url: string }
  return data.url
}
