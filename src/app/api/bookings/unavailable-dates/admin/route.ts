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

// UnavailableDate 레코드 타입
interface UnavailableDateRecord {
  id: string
  date: Date
  reason: string | null
  type: string
  exhibitionId: string | null
  createdAt: Date
}

// GET: 관리자용 - 모든 차단된 날짜 조회
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

    // 모든 예약 불가 날짜 조회 (관리자가 차단한 것만)
    const blockedDates = await prisma.unavailableDate.findMany({
      where: {
        type: 'blocked'
      },
      orderBy: { date: 'asc' }
    }) as UnavailableDateRecord[]

    return NextResponse.json(
      blockedDates.map((record: UnavailableDateRecord) => ({
        id: record.id,
        date: record.date.toISOString().split('T')[0],
        reason: record.reason,
        type: record.type
      }))
    )
  } catch (error) {
    console.error('Failed to fetch blocked dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked dates' },
      { status: 500 }
    )
  }
}

// POST: 관리자용 - 날짜 차단 추가
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
    const { dates, reason } = body as { dates: string[], reason?: string }

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: 'Dates array is required' },
        { status: 400 }
      )
    }

    // 각 날짜에 대해 upsert 수행
    const results = []
    for (const dateStr of dates) {
      // YYYY-MM-DD 형식을 UTC 정오로 파싱하여 시간대 문제 방지
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))

      const result = await prisma.unavailableDate.upsert({
        where: { date },
        update: {
          reason: reason || '관리자 차단',
          type: 'blocked',
          exhibitionId: null
        },
        create: {
          date,
          reason: reason || '관리자 차단',
          type: 'blocked'
        }
      })
      results.push(result)
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      message: `${results.length}개 날짜가 차단되었습니다.`
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to block dates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to block dates' },
      { status: 500 }
    )
  }
}

// DELETE: 관리자용 - 날짜 차단 해제
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
    const dateStr = searchParams.get('date')

    if (!id && !dateStr) {
      return NextResponse.json(
        { error: 'Either id or date parameter is required' },
        { status: 400 }
      )
    }

    // ID로 삭제하거나 날짜로 삭제
    if (id) {
      // ID로 삭제 (관리자가 차단한 것만 삭제 가능)
      await prisma.unavailableDate.deleteMany({
        where: {
          id,
          type: 'blocked' // 전시로 인한 차단은 삭제하지 않음
        }
      })
    } else if (dateStr) {
      // 날짜로 삭제 - YYYY-MM-DD 형식을 UTC 정오로 파싱
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
      
      await prisma.unavailableDate.deleteMany({
        where: {
          date,
          type: 'blocked'
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unblock date:', error)
    return NextResponse.json(
      { error: 'Failed to unblock date' },
      { status: 500 }
    )
  }
}
