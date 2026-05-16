type UploadTokenResponse = {
  token: string
  pocketbaseUrl: string
}

type MediaFileRecord = {
  id: string
  file: string
}

function fileUrl(baseUrl: string, record: MediaFileRecord) {
  return `${baseUrl.replace(/\/$/, '')}/api/files/media_files/${record.id}/${record.file}`
}

export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  let token = ''
  let pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || ''

  token = sessionStorage.getItem('pb_auth_token') || ''

  if (!token || !pocketbaseUrl) {
    const tokenResponse = await fetch('/api/auth/upload-token', {
      method: 'POST',
    })

    if (!tokenResponse.ok) {
      const data = await tokenResponse.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to prepare upload')
    }

    const uploadToken = await tokenResponse.json() as UploadTokenResponse
    token = uploadToken.token
    pocketbaseUrl = uploadToken.pocketbaseUrl
    sessionStorage.setItem('pb_auth_token', token)
  }

  const baseUrl = pocketbaseUrl.replace(/\/$/, '')

  const formData = new FormData()
  formData.append('folder', folder.replace(/[^a-zA-Z0-9._-]/g, '-'))
  formData.append('file', file)

  const response = await fetch(`${baseUrl}/api/collections/media_files/records`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || data.error || 'Failed to upload image to PocketBase')
  }

  const record = await response.json() as MediaFileRecord
  return fileUrl(baseUrl, record)
}
