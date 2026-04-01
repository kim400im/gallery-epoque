import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.notice.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('Failed to increment view count:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
