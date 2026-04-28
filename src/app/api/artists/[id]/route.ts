import { NextRequest, NextResponse } from 'next/server'
import { getArtist } from '@/lib/pocketbase-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return NextResponse.json(await getArtist(id))
  } catch (error) {
    console.error('Failed to fetch artist:', error)
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
  }
}
