import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 작가 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })
    
    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(artist)
  } catch (error) {
    console.error('Failed to fetch artist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    )
  }
}
