import { NextRequest, NextResponse } from 'next/server'
import { getExhibition } from '@/lib/pocketbase-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return NextResponse.json(await getExhibition(id))
  } catch (error) {
    console.error('Failed to fetch exhibition:', error)
    return NextResponse.json({ error: 'Exhibition not found' }, { status: 404 })
  }
}
