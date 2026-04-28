import { NextRequest, NextResponse } from 'next/server'
import { getNotice } from '@/lib/pocketbase-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return NextResponse.json(await getNotice(id))
  } catch (error) {
    console.error('Failed to fetch notice:', error)
    return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
  }
}
