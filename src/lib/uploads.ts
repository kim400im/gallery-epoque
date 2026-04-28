import { PBRecord, createFormRecord, fileUrl } from './pocketbase'

type MediaFileRecord = PBRecord & {
  folder?: string
  file: string
}

const safeSegment = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-')

export async function savePocketBaseUpload(file: File, folder: string, token: string) {
  const formData = new FormData()
  formData.append('folder', safeSegment(folder))
  formData.append('file', file)

  const record = await createFormRecord<MediaFileRecord>('media_files', formData, token)
  return fileUrl('media_files', record, 'file')
}
