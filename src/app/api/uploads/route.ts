import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken, unauthorized } from '@/lib/pocketbase'
import { savePocketBaseUpload } from '@/lib/uploads'

export async function POST(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    console.log('[uploads:POST] start')
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') || 'uploads')
    if (!file || file.size === 0) return NextResponse.json({ error: 'File is required' }, { status: 400 })

    console.log('[uploads:POST] form parsed', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder,
      elapsedMs: Date.now() - startedAt,
    })
    const url = await savePocketBaseUpload(file, folder, token)
    console.log('[uploads:POST] complete', {
      fileName: file.name,
      elapsedMs: Date.now() - startedAt,
    })
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to upload file' }, { status: 500 })
  }
}
