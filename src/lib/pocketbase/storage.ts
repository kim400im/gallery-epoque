export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 30000)

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
    signal: controller.signal,
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Image upload timed out after 30 seconds. File: ${file.name} (${file.size} bytes)`)
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
