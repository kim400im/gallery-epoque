import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// API Route용 Supabase 클라이언트 생성
function createSupabaseClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // API Route에서는 쿠키 설정 불필요
        },
      },
    }
  )
}

// GET: 작가 목록 조회
export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(artists)
  } catch (error) {
    console.error('Failed to fetch artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    )
  }
}

// POST: 작가 등록
export async function POST(request: NextRequest) {
  try {
    // 인증 체크
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Artist name is required' },
        { status: 400 }
      )
    }

    const artist = await prisma.artist.create({
      data: {
        name: name.trim()
      }
    })

    return NextResponse.json(artist, { status: 201 })
  } catch (error) {
    console.error('Failed to create artist:', error)
    return NextResponse.json(
      { error: 'Failed to create artist' },
      { status: 500 }
    )
  }
}

// PUT: 작가 수정
export async function PUT(request: NextRequest) {
  try {
    // 인증 체크
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name } = body

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: 'Artist ID and name are required' },
        { status: 400 }
      )
    }

    const artist = await prisma.artist.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json(artist)
  } catch (error) {
    console.error('Failed to update artist:', error)
    return NextResponse.json(
      { error: 'Failed to update artist' },
      { status: 500 }
    )
  }
}

// DELETE: 작가 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 인증 체크
    const supabase = createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Artist ID is required' },
        { status: 400 }
      )
    }

    await prisma.artist.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete artist:', error)
    return NextResponse.json(
      { error: 'Failed to delete artist' },
      { status: 500 }
    )
  }
}
