import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// UnavailableDate 레코드 타입
interface UnavailableDateRecord {
  id: string
  date: Date
  reason: string | null
  type: string
  exhibitionId: string | null
  createdAt: Date
}

// GET: 예약 불가능한 날짜 조회 (UnavailableDate 테이블 기반)
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // UnavailableDate 테이블에서 오늘 이후의 예약 불가 날짜 조회
    const unavailableDateRecords = await prisma.unavailableDate.findMany({
      where: {
        date: {
          gte: today
        }
      },
      orderBy: { date: 'asc' }
    }) as UnavailableDateRecord[]

    // 날짜 문자열 배열로 변환
    const unavailableDates = unavailableDateRecords.map((record: UnavailableDateRecord) => 
      record.date.toISOString().split('T')[0]
    )

    // 전시 정보도 함께 반환 (캘린더에 표시용)
    const exhibitions = await prisma.exhibition.findMany({
      where: {
        endDate: {
          gte: today
        }
      },
      select: {
        title: true,
        startDate: true,
        endDate: true
      },
      orderBy: { startDate: 'asc' }
    })

    // 관리자가 차단한 날짜 목록 (reason과 함께)
    const blockedDates = unavailableDateRecords
      .filter((record: UnavailableDateRecord) => record.type === 'blocked')
      .map((record: UnavailableDateRecord) => ({
        date: record.date.toISOString().split('T')[0],
        reason: record.reason
      }))

    return NextResponse.json({
      unavailableDates,
      exhibitions: exhibitions.map(e => ({
        title: e.title,
        startDate: e.startDate.toISOString().split('T')[0],
        endDate: e.endDate.toISOString().split('T')[0]
      })),
      blockedDates
    })
  } catch (error) {
    console.error('Failed to fetch unavailable dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unavailable dates' },
      { status: 500 }
    )
  }
}
