import { NextRequest, NextResponse } from 'next/server'
import { getRecord, getServerSuperuserToken, updateRecord } from '@/lib/pocketbase'
import { NoticeRecord } from '@/lib/pocketbase-data'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notice = await getRecord<NoticeRecord>('notices', id)
    await updateRecord('notices', id, { viewCount: (notice.viewCount || 0) + 1 }, await getServerSuperuserToken())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to increment view count:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
