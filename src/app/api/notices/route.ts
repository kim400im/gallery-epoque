import { NextRequest, NextResponse } from 'next/server'
import { createRecord, deleteRecord, requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import { NoticeAttachmentRecord, NoticeRecord, getNotice, getNotices } from '@/lib/pocketbase-data'
import { savePocketBaseUpload } from '@/lib/uploads'

export async function GET(request: NextRequest) {
  try {
    const page = Math.max(1, parseInt(new URL(request.url).searchParams.get('page') || '1', 10))
    return NextResponse.json(await getNotices(page, 10))
  } catch (error) {
    console.error('Failed to fetch notices:', error)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const title = String(formData.get('title') || '').trim()
    const content = String(formData.get('content') || '').trim()
    if (!title || !content) return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })

    const notice = await createRecord<NoticeRecord>('notices', { title, content, isFeatured: false, viewCount: 0 }, token)
    for (const file of (formData.getAll('attachments') as File[]).filter((item) => item && item.size > 0)) {
      await createRecord<NoticeAttachmentRecord>('notice_attachments', {
        notice: notice.id,
        fileName: file.name,
        legacyFileUrl: await savePocketBaseUpload(file, 'notices', token),
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      }, token)
    }

    return NextResponse.json(await getNotice(notice.id), { status: 201 })
  } catch (error) {
    console.error('Failed to create notice:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create notice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const formData = await request.formData()
    const id = String(formData.get('id') || '')
    const title = String(formData.get('title') || '').trim()
    const content = String(formData.get('content') || '').trim()
    if (!id || !title || !content) return NextResponse.json({ error: 'ID, title, and content are required' }, { status: 400 })

    const deleteAttachmentIds = formData.get('deleteAttachmentIds')
    if (deleteAttachmentIds) {
      for (const attachmentId of JSON.parse(String(deleteAttachmentIds)) as string[]) {
        await deleteRecord('notice_attachments', attachmentId, token)
      }
    }

    await updateRecord<NoticeRecord>('notices', id, { title, content }, token)
    for (const file of (formData.getAll('attachments') as File[]).filter((item) => item && item.size > 0)) {
      await createRecord<NoticeAttachmentRecord>('notice_attachments', {
        notice: id,
        fileName: file.name,
        legacyFileUrl: await savePocketBaseUpload(file, 'notices', token),
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      }, token)
    }

    return NextResponse.json(await getNotice(id))
  } catch (error) {
    console.error('Failed to update notice:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update notice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 })

    await deleteRecord('notices', id, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete notice:', error)
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }
}
