import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken, unauthorized, updateRecord } from '@/lib/pocketbase'
import { NoticeRecord, getNotices } from '@/lib/pocketbase-data'

export async function GET() {
  try {
    const { notices } = await getNotices(1, 100)
    const notice = notices.find((item) => item.isFeatured)
    return NextResponse.json(notice ? { id: notice.id, title: notice.title } : null)
  } catch (error) {
    console.error('Failed to fetch featured notice:', error)
    return NextResponse.json({ error: 'Failed to fetch featured notice' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const { id } = await request.json() as { id: string }
    if (!id) return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 })

    const { notices } = await getNotices(1, 500)
    for (const notice of notices.filter((item) => item.isFeatured)) {
      await updateRecord<NoticeRecord>('notices', notice.id, { isFeatured: false }, token)
    }
    await updateRecord<NoticeRecord>('notices', id, { isFeatured: true }, token)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to set featured notice:', error)
    return NextResponse.json({ error: 'Failed to set featured notice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()

    const { notices } = await getNotices(1, 500)
    for (const notice of notices.filter((item) => item.isFeatured)) {
      await updateRecord<NoticeRecord>('notices', notice.id, { isFeatured: false }, token)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unset featured notice:', error)
    return NextResponse.json({ error: 'Failed to unset featured notice' }, { status: 500 })
  }
}
