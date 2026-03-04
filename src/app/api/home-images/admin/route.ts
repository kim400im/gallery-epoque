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

// GET: 관리자용 홈 이미지 전체 목록 조회 (비활성 포함)
export async function GET(request: NextRequest) {
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

    const homeImages = await prisma.homeImage.findMany({
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json(homeImages)
  } catch (error) {
    console.error('Failed to fetch home images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home images' },
      { status: 500 }
    )
  }
}
