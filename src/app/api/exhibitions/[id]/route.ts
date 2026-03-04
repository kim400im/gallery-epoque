import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 개별 전시회 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const exhibition = await prisma.exhibition.findUnique({
      where: { id },
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    if (!exhibition) {
      return NextResponse.json(
        { error: 'Exhibition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(exhibition)
  } catch (error) {
    console.error('Failed to fetch exhibition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exhibition' },
      { status: 500 }
    )
  }
}
