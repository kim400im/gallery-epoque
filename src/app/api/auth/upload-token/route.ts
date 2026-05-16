import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, pbAuthRefresh, pbPublicUrl, PB_AUTH_COOKIE, unauthorized } from '@/lib/pocketbase'

export async function POST(request: NextRequest) {
  const token = getAuthToken(request)
  if (!token) return unauthorized()

  try {
    const auth = await pbAuthRefresh(token)
    const response = NextResponse.json({
      token: auth.token,
      pocketbaseUrl: pbPublicUrl(),
    })
    response.cookies.set(PB_AUTH_COOKIE, auth.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.SECURE_COOKIE !== 'false' && process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('Failed to prepare PocketBase upload:', error)
    return unauthorized()
  }
}
