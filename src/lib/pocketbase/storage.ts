const TARGET_IMAGE_SIZE = 10 * 1024 * 1024
const IMAGE_DIMENSIONS = [2800, 2400, 2000, 1600, 1200]
const WEBP_QUALITIES = [0.82, 0.72, 0.62, 0.52]
const COMPRESSION_TIMEOUT_MS = 45 * 1000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs)
    promise
      .then(resolve, reject)
      .finally(() => window.clearTimeout(timeoutId))
  })
}

async function compressImageToWebp(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/webp') {
    return file
  }

  const bitmap = await withTimeout(
    createImageBitmap(file),
    COMPRESSION_TIMEOUT_MS,
    `Image compression timed out. Uploading original file instead: ${file.name}`
  )

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return file
  }

  let bestBlob: Blob | null = null
  for (const maxDimension of IMAGE_DIMENSIONS) {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)

    for (const quality of WEBP_QUALITIES) {
      const blob = await withTimeout(
        new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/webp', quality)
        }),
        COMPRESSION_TIMEOUT_MS,
        `Image compression timed out. Uploading original file instead: ${file.name}`
      )
      if (!blob) continue
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob
      if (blob.size <= TARGET_IMAGE_SIZE && blob.size < file.size) {
        bitmap.close()
        const baseName = file.name.replace(/\.[^.]+$/, '')
        return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() })
      }
    }
  }

  bitmap.close()

  if (!bestBlob || bestBlob.size >= file.size) return file
  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([bestBlob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() })
}

export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  let uploadFile = file
  try {
    uploadFile = await compressImageToWebp(file)
  } catch (error) {
    console.warn(error)
    uploadFile = file
  }
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
