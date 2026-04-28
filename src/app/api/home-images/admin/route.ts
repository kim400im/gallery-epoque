import { NextRequest, NextResponse } from 'next/server'
import { requireAuthToken, unauthorized } from '@/lib/pocketbase'
import { getHomeImages } from '@/lib/pocketbase-data'

export async function GET(request: NextRequest) {
  try {
    const token = requireAuthToken(request)
    if (!token) return unauthorized()
    return NextResponse.json(await getHomeImages(true))
  } catch (error) {
    console.error('Failed to fetch home images:', error)
    return NextResponse.json({ error: 'Failed to fetch home images' }, { status: 500 })
  }
}
