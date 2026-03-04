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

// YYYY-MM-DD 문자열을 UTC 정오 Date로 변환
function parseToUTCNoon(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
}

// Date를 YYYY-MM-DD 문자열로 변환 (UTC 기준)
function formatDateToString(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 날짜 범위에서 개별 날짜 배열 생성 (YYYY-MM-DD 문자열 기반)
function getDatesBetweenStrings(startDateStr: string, endDateStr: string): Date[] {
  const dates: Date[] = []
  
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
  
  const current = new Date(Date.UTC(startYear, startMonth - 1, startDay, 12, 0, 0, 0))
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 12, 0, 0, 0))
  
  while (current <= end) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

// POST: 기존 전시 데이터를 기반으로 UnavailableDate 동기화
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

    // 먼저 기존 전시 관련 예약 불가 날짜 모두 삭제
    await prisma.unavailableDate.deleteMany({
      where: { type: 'exhibition' }
    })

    // 모든 전시회 가져오기
    const exhibitions = await prisma.exhibition.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true
      }
    })

    let totalDatesCreated = 0

    // 각 전시회에 대해 예약 불가 날짜 생성
    for (const exhibition of exhibitions) {
      // DB에서 가져온 Date를 문자열로 변환 후 처리
      const startDateStr = formatDateToString(exhibition.startDate)
      const endDateStr = formatDateToString(exhibition.endDate)
      const dates = getDatesBetweenStrings(startDateStr, endDateStr)
      
      for (const date of dates) {
        try {
          await prisma.unavailableDate.upsert({
            where: { date },
            update: {
              reason: `전시: ${exhibition.title}`,
              type: 'exhibition',
              exhibitionId: exhibition.id
            },
            create: {
              date,
              reason: `전시: ${exhibition.title}`,
              type: 'exhibition',
              exhibitionId: exhibition.id
            }
          })
          totalDatesCreated++
        } catch (error) {
          // 중복 날짜는 무시
          console.log(`Skipped date ${date} - already exists with different exhibition`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${exhibitions.length}개 전시회에서 ${totalDatesCreated}개 날짜가 동기화되었습니다.`,
      exhibitions: exhibitions.length,
      datesCreated: totalDatesCreated
    })
  } catch (error) {
    console.error('Failed to sync unavailable dates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync unavailable dates' },
      { status: 500 }
    )
  }
}
