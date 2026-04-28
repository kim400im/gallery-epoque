import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken, unauthorized } from '@/lib/pocketbase'
import { savePocketBaseUpload } from '@/lib/uploads'

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') || 'uploads')
    if (!file || file.size === 0) return NextResponse.json({ error: 'File is required' }, { status: 400 })

    return NextResponse.json({ url: await savePocketBaseUpload(file, folder, token) })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to upload file' }, { status: 500 })
  }
}
