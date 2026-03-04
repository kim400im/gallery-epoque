import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: { attachments: true },
    })
    if (!notice) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json(notice)
  } catch (error) {
    console.error('Failed to fetch notice:', error)
    return NextResponse.json({ error: 'Failed to fetch notice' }, { status: 500 })
  }
}
