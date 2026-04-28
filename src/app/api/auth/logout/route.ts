import { NextResponse } from 'next/server'
import { PB_AUTH_COOKIE } from '@/lib/pocketbase'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(PB_AUTH_COOKIE)
  return response
}
