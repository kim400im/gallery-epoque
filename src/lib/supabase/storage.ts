export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to upload image')
  }

  const data = await response.json() as { url: string }
  return data.url
}
