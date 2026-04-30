import { NextRequest, NextResponse } from 'next/server'
import { PB_AUTH_COOKIE, pbLogin } from '@/lib/pocketbase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as { email: string; password: string }
    const auth = await pbLogin(email, password)
    const response = NextResponse.json({ email: auth.record.email || email })
    response.cookies.set(PB_AUTH_COOKIE, auth.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.SECURE_COOKIE !== 'false' && process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('PocketBase login failed:', error)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
}
