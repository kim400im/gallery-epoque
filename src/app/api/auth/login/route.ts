import { NextRequest, NextResponse } from 'next/server'
import { PB_AUTH_COOKIE, pbLogin, pbRequest } from '@/lib/pocketbase'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json() as { email: string; password: string }

  let auth: { token: string; record: { email?: string } } | null = null

  // 슈퍼유저 로그인 시도
  try {
    auth = await pbLogin(email, password)
  } catch {
    // 슈퍼유저 실패 시 일반 users 컬렉션으로 시도
    try {
      auth = await pbRequest<{ token: string; record: { email?: string } }>(
        '/api/collections/users/auth-with-password',
        { method: 'POST', body: JSON.stringify({ identity: email, password }) }
      )
    } catch (err) {
      console.error('PocketBase login failed:', err)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
  }

  console.log('[login] success, setting cookie, secure:', process.env.SECURE_COOKIE !== 'false' && process.env.NODE_ENV === 'production')
  const response = NextResponse.json({ email: auth.record.email || email })
  response.cookies.set(PB_AUTH_COOKIE, auth.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.SECURE_COOKIE !== 'false' && process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
